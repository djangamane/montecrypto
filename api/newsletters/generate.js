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
    } catch (error) {
      return {};
    }
  }
  return body;
}

async function runNewsletterGeneration({ focus }) {
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
  const result = JSON.parse(jsonPayload);

  const groundedSources = extractGroundedSources(response);
  if (groundedSources.length) {
    result.sources = groundedSources;
  }

  result.publishedAt = new Date().toISOString();
  result.status = 'draft';

  return result;
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

function extractGroundedSources(response) {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set();
  const sources = [];
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({
      uri,
      title: chunk?.web?.title || uri,
    });
  }
  return sources;
}

function initClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Newsletter generation endpoint disabled.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}
