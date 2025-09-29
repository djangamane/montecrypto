/* eslint-env node */
import { z } from 'zod';
import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';

const PERPLEXITY_ENDPOINT = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'pplx-7b-online';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

const OutputSchema = z.object({
  headline: z.string().min(1, 'headline required'),
  summary: z.string().min(1, 'summary required'),
  insights: z
    .array(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        howToAvoid: z.string().min(1),
        threatLevel: z.enum(['High', 'Medium', 'Low']).optional(),
      }),
    )
    .default([]),
  sources: z
    .array(
      z.object({
        uri: z.string().min(1),
        title: z.string().optional(),
      }),
    )
    .default([]),
});

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

  if (!PERPLEXITY_API_KEY) {
    return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not configured.' });
  }

  const { focus } = parseBody(req.body);

  try {
    const result = await runPerplexityBriefing({ focus: typeof focus === 'string' ? focus.trim() : '' });
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

async function runPerplexityBriefing({ focus }) {
  const timeWindowDays = Number.parseInt(process.env.PERPLEXITY_WINDOW_DAYS ?? '10', 10);
  const now = new Date();
  const start = new Date(now.getTime() - Math.max(timeWindowDays, 1) * DAY_IN_MS);

  const requestBody = buildPerplexityRequest({ focus, start, now });
  const response = await fetch(PERPLEXITY_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorPayload = await safeReadJson(response);
    const message = errorPayload?.error?.message || response.statusText;
    throw new Error(`Perplexity API error (${response.status}): ${message}`);
  }

  const payload = await response.json();
  const rawContent = extractAssistantText(payload);
  const parsed = OutputSchema.safeParse(normalizeJson(rawContent));

  if (!parsed.success) {
    console.error('Perplexity response did not match schema', parsed.error);
    throw new Error('Perplexity returned an unexpected response.');
  }

  return normalizeBriefing(parsed.data, {
    generatedAt: now.toISOString(),
    timeframe: { start: start.toISOString(), end: now.toISOString() },
    focus,
  });
}

function buildPerplexityRequest({ focus, start, now }) {
  const focusLine = focus ? `Focus on: ${focus}.` : '';
  const prompt = `You are "Risky Kristy", a cryptocurrency threat analyst who writes the MonteCrypto Weekly Risk Brief.
Summarize the most urgent crypto scam or fraud developments from the last ${Math.max(
    Number.parseInt(process.env.PERPLEXITY_WINDOW_DAYS ?? '10', 10),
    1,
  )} days (${formatDate(start)} to ${formatDate(now)}).
${focusLine}
Return JSON ONLY, no prose, following this schema:
{
  "headline": string,
  "summary": string,
  "insights": [
    {
      "title": string,
      "summary": string,
      "howToAvoid": string,
      "threatLevel": "High" | "Medium" | "Low"
    }
  ],
  "sources": [
    {
      "uri": string,
      "title": string
    }
  ]
}
Rules:
- Cite real URLs in sources (no placeholders).
- Prioritize cases where victims lost funds (rug pulls, phishing, Ponzi, hacks).
- Keep insights concise but actionable, with clear defensive advice.
- If no credible losses were found, provide an empty insights array and explain why in the summary.`;

  return {
    model: PERPLEXITY_MODEL,
    max_tokens: Number.parseInt(process.env.PERPLEXITY_MAX_TOKENS ?? '1200', 10),
    temperature: Number.parseFloat(process.env.PERPLEXITY_TEMPERATURE ?? '0.2'),
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
  };
}

function extractAssistantText(payload) {
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

function normalizeJson(rawContent) {
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

function normalizeBriefing(data, metadata) {
  const insights = data.insights
    .map((insight) => ({
      title: insight.title.trim(),
      summary: insight.summary.trim(),
      howToAvoid: insight.howToAvoid.trim(),
      threatLevel: normalizeThreatLevel(insight.threatLevel),
    }))
    .filter((item) => item.title && item.summary && item.howToAvoid);

  const sources = data.sources
    .map((source, index) => ({
      uri: source.uri.trim(),
      title: (source.title || `Source ${index + 1}`).trim(),
    }))
    .filter((item) => item.uri);

  return {
    id: `draft-${Date.now()}`,
    headline: data.headline.trim(),
    summary: data.summary.trim(),
    insights,
    sources,
    status: 'draft',
    publishedAt: new Date().toISOString(),
    metadata: {
      ...metadata,
      perplexityModel: PERPLEXITY_MODEL,
    },
  };
}

function normalizeThreatLevel(level) {
  const normalized = typeof level === 'string' ? level.trim().toLowerCase() : '';
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
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
