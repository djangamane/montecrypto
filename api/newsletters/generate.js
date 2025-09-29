/* eslint-env node */
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';

const client = initClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Supabase access token' });
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'Invalid Supabase session' });
  }

  if (!isNewsletterAdmin(userResult.user.email)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  if (!client) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { focus } = parseBody(req.body);

  try {
    const result = await runNewsletterGeneration({ focus });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Failed to generate newsletter briefing', error);
    return res.status(500).json({ error: error.message || 'Failed to generate newsletter.' });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

async function runNewsletterGeneration({ focus }) {
  const briefing = await runGeminiBriefing({ focus }).catch((error) => {
    console.error('Gemini workflow failed', error);
    return buildGeminiFallback({ focus, error });
  });

  return normalizeBriefing(briefing);
}

async function runGeminiBriefing({ focus }) {
  const requestFocus = focus ? `Focus on ${focus}. ` : '';
  const prompt = `You are "Risky Kristy", a cryptocurrency threat analyst summarizing this week's most pressing scams.
${requestFocus}Use Google Search to identify the three most urgent and newsworthy crypto scam developments from the last 10 days.
Return ONLY valid JSON with the following structure:
{
  "headline": string catchy weekly headline,
  "summary": string 2-3 sentences overview suitable for newsletter intro,
  "insights": [
    {
      "title": string descriptive scam title,
      "summary": string concise explanation of how the scam operates and who it targets,
      "howToAvoid": string actionable defensive guidance,
      "threatLevel": "High" | "Medium" | "Low"
    }
  ],
  "sources": [
    {
      "uri": string URL reference,
      "title": string human readable title
    }
  ]
}
The JSON must be parseable with no trailing prose. Threat levels must be consistent with risk severity.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = await extractText(response);
  const jsonPayload = sanitizeJson(rawText);
  return JSON.parse(jsonPayload);
}

function buildGeminiFallback({ focus, error }) {
  const parsed = parseGeminiError(error);
  const summaryMessage = parsed
    ? `Gemini did not return a briefing. (${parsed}).`
    : 'Gemini did not return a briefing. Manual review required.';

  return {
    headline: 'Weekly Risk Brief — Manual Review Required',
    summary: summaryMessage,
    insights: [],
    sources: [],
    status: 'draft',
    metadata: {
      geminiError: parsed,
      geminiStatus: errorStatus(error) || null,
      focus: typeof focus === 'string' ? focus : null,
    },
  };
}

function normalizeBriefing(raw) {
  const fallbackHeadline = 'Weekly Risk Brief';
  const fallbackSummary =
    'Summary not provided by Gemini. Review and update before publishing.';

  const normalizedInsights = Array.isArray(raw?.insights)
    ? raw.insights.map((insight, index) => normalizeInsight(insight, index))
    : [];

  const normalizedSources = Array.isArray(raw?.sources)
    ? raw.sources
        .map((source, index) => normalizeSource(source, index))
        .filter(Boolean)
    : [];

  return {
    id: raw?.id || `draft-${Date.now()}`,
    headline: textValue(raw?.headline) || fallbackHeadline,
    summary: textValue(raw?.summary) || fallbackSummary,
    publishedAt: raw?.publishedAt || new Date().toISOString(),
    insights: normalizedInsights,
    sources: normalizedSources,
    status: raw?.status || 'draft',
    metadata: raw?.metadata || {},
  };
}

function normalizeInsight(insight, index) {
  const fallbackTitle = `Insight ${index + 1}`;
  const fallbackSummary =
    'Gemini did not include a summary for this threat. Add context before publishing.';
  const fallbackAvoid =
    'Gemini did not provide mitigation guidance. Insert manual recommendations.';

  return {
    title: textValue(insight?.title) || fallbackTitle,
    summary: textValue(insight?.summary) || fallbackSummary,
    howToAvoid: textValue(insight?.howToAvoid) || fallbackAvoid,
    threatLevel: normalizeThreatLevel(insight?.threatLevel),
  };
}

function normalizeSource(source, index) {
  const uri = textValue(source?.uri);
  if (!uri) return null;

  return {
    uri,
    title: textValue(source?.title) || `Source ${index + 1}`,
  };
}

function textValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function normalizeThreatLevel(level) {
  const normalized = textValue(level).toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function parseGeminiError(error) {
  if (!error) return '';
  if (typeof error === 'string') return error.slice(0, 500);

  const dataMessage = error?.response?.data?.error?.message;
  const topMessage = error?.message;

  const message = textValue(dataMessage || topMessage);
  if (message) return message.slice(0, 500);

  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error)).slice(0, 500);
  } catch (jsonError) {
    console.error('Failed to serialize Gemini error', jsonError);
    return 'Unknown Gemini error';
  }
}

function errorStatus(error) {
  return error?.response?.status ?? error?.status ?? null;
}

async function extractText(response) {
  if (!response) return '';
  if (typeof response.text === 'function') {
    return response.text();
  }
  if (typeof response.text === 'string') {
    return response.text;
  }
  const candidates = response.candidates || [];
  const parts = candidates[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (typeof part.text === 'string' ? part.text : ''))
      .join('');
  }
  return '';
}

function sanitizeJson(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Gemini response empty');
  }
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('Gemini returned invalid JSON.');
  }
  return raw.slice(firstBrace, lastBrace + 1);
}

function initClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Newsletter generation endpoint disabled.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}
