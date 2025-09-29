/* eslint-env node */
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';

const PERPLEXITY_ENDPOINT = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'pplx-7b-online';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

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
  const [geminiRaw, coinScan] = await Promise.all([
    runGeminiBriefing({ focus }).catch((error) => {
      console.error('Gemini workflow failed', error);
      return buildGeminiFallback({ focus, error });
    }),
    runPerplexityCoinScan({ focus }).catch((error) => {
      console.error('Perplexity coin scan failed', error);
      return null;
    }),
  ]);

  const briefing = normalizeBriefing(geminiRaw);

  if (coinScan) {
    return mergeCoinScan(briefing, coinScan);
  }

  return briefing;
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

async function runPerplexityCoinScan({ focus }) {
  if (!PERPLEXITY_API_KEY) {
    return null;
  }

  const windowDays = Math.max(Number.parseInt(process.env.PERPLEXITY_WINDOW_DAYS ?? '10', 10), 1);
  const now = new Date();
  const start = new Date(now.getTime() - windowDays * DAY_IN_MS);

  const prompt = buildPerplexityPrompt({ focus, start, now, windowDays });
  const response = await fetch(PERPLEXITY_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      max_tokens: Number.parseInt(process.env.PERPLEXITY_MAX_TOKENS ?? '1200', 10),
      temperature: Number.parseFloat(process.env.PERPLEXITY_TEMPERATURE ?? '0.1'),
      frequency_penalty: 1,
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'Be precise and concise in your responses. Respond in English.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error?.message || response.statusText;
    throw new Error(`Perplexity API error (${response.status}): ${message}`);
  }

  const payload = await response.json();
  const rawContent = extractPerplexityText(payload);
  const parsed = parsePerplexityJson(rawContent);

  return {
    findings: normalizeCoinFindings(parsed?.findings ?? []),
    sources: normalizeCoinSources(parsed?.sources ?? []),
    metadata: {
      timeframe: { start: start.toISOString(), end: now.toISOString() },
      generatedAt: now.toISOString(),
      model: PERPLEXITY_MODEL,
    },
  };
}

function buildPerplexityPrompt({ focus, start, now, windowDays }) {
  const focusLine = focus ? `Focus on tokens related to: ${focus}.` : '';
  return `You are an on-chain fraud analyst cataloging cryptocurrency tokens or projects that
have credible reports of investor losses (rug pulls, exit scams, phishing, Ponzi schemes, exploit drainers).

Time window: ${formatDate(start)} to ${formatDate(now)} (${windowDays} days).
${focusLine}
Search reputable, up-to-date sources (news coverage, regulator notices, on-chain analysis) and
return JSON ONLY with this structure:
{
  "findings": [
    {
      "token": string token or project name,
      "title": string concise headline,
      "summary": string referencing the losses and what happened,
      "howToAvoid": string practical defensive advice,
      "threatLevel": "High" | "Medium" | "Low",
      "sources": [ { "uri": string, "title": string } ]
    }
  ],
  "sources": [ { "uri": string, "title": string } ]
}
Rules:
- Include only cases where losses are confirmed or strongly evidenced (not mere allegations).
- Cite real URLs (no placeholders). Prefer primary reporting.
- If nothing credible is found, return an empty findings array with an explanatory summary.`;
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

function mergeCoinScan(briefing, coinScan) {
  const mergedInsights = Array.isArray(briefing.insights) ? [...briefing.insights] : [];
  const mergedSources = Array.isArray(briefing.sources) ? [...briefing.sources] : [];
  const existingInsightKeys = new Set(
    mergedInsights.map((insight) => textValue(insight?.title).toLowerCase()).filter(Boolean),
  );
  const existingSourceUris = new Set(mergedSources.map((source) => textValue(source?.uri)).filter(Boolean));

  for (const finding of coinScan.findings) {
    const baseTitle = finding.title || (finding.token ? `${finding.token} scam watch` : 'Coin scam update');
    const prefixedTitle = `Coin Watch — ${baseTitle}`;
    const titleKey = textValue(prefixedTitle).toLowerCase();
    const summary = textValue(finding.summary);
    const howToAvoid = textValue(finding.howToAvoid);

    if (!titleKey || !summary || !howToAvoid || existingInsightKeys.has(titleKey)) {
      continue;
    }

    mergedInsights.push({
      title: prefixedTitle,
      summary,
      howToAvoid,
      threatLevel: normalizeThreatLevel(finding.threatLevel),
    });
    existingInsightKeys.add(titleKey);

    for (const source of finding.sources || []) {
      const uri = textValue(source.uri);
      if (!uri || existingSourceUris.has(uri)) continue;
      mergedSources.push({
        uri,
        title: textValue(source.title) || uri,
      });
      existingSourceUris.add(uri);
    }
  }

  for (const source of coinScan.sources || []) {
    const uri = textValue(source.uri);
    if (!uri || existingSourceUris.has(uri)) continue;
    mergedSources.push({
      uri,
      title: textValue(source.title) || uri,
    });
    existingSourceUris.add(uri);
  }

  return {
    ...briefing,
    insights: mergedInsights,
    sources: mergedSources,
    metadata: {
      ...(briefing.metadata || {}),
      coinScan,
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

function normalizeCoinFindings(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const sources = normalizeCoinSources(item?.sources ?? []);
      return {
        token: textValue(item?.token),
        title: textValue(item?.title),
        summary: textValue(item?.summary),
        howToAvoid: textValue(item?.howToAvoid),
        threatLevel: normalizeThreatLevel(item?.threatLevel),
        sources,
      };
    })
    .filter((entry) => entry.summary && entry.howToAvoid);
}

function normalizeCoinSources(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({
      uri: textValue(item?.uri),
      title: textValue(item?.title) || `Source ${index + 1}`,
    }))
    .filter((item) => item.uri);
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

function extractPerplexityText(payload) {
  const choice = payload?.choices?.[0];
  if (!choice) throw new Error('Perplexity response missing choices array.');
  const message = choice.message;
  if (!message) throw new Error('Perplexity response missing message content.');

  if (typeof message.content === 'string') {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('\n')
      .trim();
  }

  throw new Error('Perplexity message content in unexpected format.');
}

function parsePerplexityJson(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Empty response from Perplexity.');
  }

  let trimmed = rawContent.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    console.error('Failed to parse Perplexity JSON', { rawContent });
    throw error;
  }
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

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
