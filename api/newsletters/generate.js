/* eslint-env node */
import { GoogleGenAI } from '@google/genai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';
let deepResearch;
let getModel;

async function loadDeepResearchModules() {
  if (deepResearch && getModel) return;

  const deepModule = await import('../../tools/deep-research/src/deep-research.js');
  const providerModule = await import('../../tools/deep-research/src/ai/providers.js');

  deepResearch = deepModule.deepResearch ?? deepModule.default?.deepResearch;
  getModel = providerModule.getModel ?? providerModule.default?.getModel;

  if (!deepResearch || !getModel) {
    throw new Error('Deep research modules failed to load');
  }
}

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
    await loadDeepResearchModules();
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

async function summarizeDeepResearch({ focus, timeframe, learnings, visitedUrls }) {
  const maxLearnings = Number.parseInt(process.env.DEEP_RESEARCH_MAX_LEARNINGS ?? '12', 10);
  const maxItems = Number.isFinite(maxLearnings) && maxLearnings > 0 ? maxLearnings : 12;
  const trimmedLearnings = learnings.slice(0, maxItems);
  const trimmedUrls = visitedUrls.slice(0, 25);

  const formattedLearnings = trimmedLearnings
    .map((entry, index) => `${index + 1}. ${entry}`)
    .join('\n');

  const formattedUrls = trimmedUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');

  const focusLine = focus ? `Subscriber emphasis: ${focus}.` : '';
  const coverageLabel = formatDisplayRange(new Date(timeframe.start), new Date(timeframe.end));

  const prompt = `You are MonteCrypto's lead risk desk analyst preparing the Weekly Risk Brief for paying subscribers.
Today's date: ${formatDisplayDate(new Date(timeframe.end || Date.now()))}.
Coverage window: ${coverageLabel}.
${focusLine}
Use only the research learnings and URLs provided below to surface scam cases where victims reported losing funds. Highlight actionable mitigation guidance for each case.

Research learnings (each line is an extracted fact):
${formattedLearnings}

Visited URLs (cite only from this list):
${formattedUrls}

Return strictly valid JSON with the structure:
{
  "summary": string overview tying the findings together,
  "findings": [
    {
      "token": string token or project name (optional),
      "eventDate": string ISO date (or "Unknown" if not explicit),
      "title": string newsletter-ready headline,
      "summary": string 1-2 sentence description referencing the losses,
      "howToAvoid": string practical defensive guidance,
      "threatLevel": "High" | "Medium" | "Low",
      "sourceUris": string[] subset of the visited URLs supporting this finding
    }
  ]
}
If no credible loss events are present, return an empty findings array and explain why in the summary.`;

  const schema = z.object({
    summary: z.string().optional(),
    findings: z
      .array(
        z.object({
          token: z.string().optional(),
          eventDate: z.string().optional(),
          title: z.string(),
          summary: z.string(),
          howToAvoid: z.string(),
          threatLevel: z.enum(['High', 'Medium', 'Low']).optional(),
          sourceUris: z.array(z.string()).optional(),
        }),
      )
      .max(Number.parseInt(process.env.DEEP_RESEARCH_MAX_FINDINGS ?? '5', 10)),
  });

  const result = await generateObject({
    model: getModel(),
    system: 'You are an exacting researcher. Answer with valid JSON only.',
    prompt,
    schema,
  });

  return result.object;
}

function normalizeResearchFinding(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      token: '',
      title: '',
      summary: '',
      howToAvoid: '',
      threatLevel: 'High',
      eventDate: null,
      sourceUris: [],
    };
  }

  const sourceUris = Array.isArray(raw.sourceUris)
    ? raw.sourceUris.map((uri) => textValue(uri)).filter(Boolean)
    : [];

  const normalizedDate = normalizeDateValue(raw.eventDate);

  return {
    token: textValue(raw.token),
    title: textValue(raw.title),
    summary: textValue(raw.summary),
    howToAvoid: textValue(raw.howToAvoid),
    threatLevel: normalizeThreatLevel(raw.threatLevel),
    eventDate: normalizedDate,
    sourceUris,
  };
}

function formatResearchTitle(finding) {
  const baseTitle = finding.title || (finding.token ? `${finding.token} scam losses` : 'Scam losses identified');
  const dateLabel = finding.eventDate ? formatShortDate(new Date(finding.eventDate)) : null;
  if (dateLabel) {
    return `Deep Research — [${dateLabel}] ${baseTitle}`;
  }
  return `Deep Research — ${baseTitle}`;
}

function extractSourcesFromFindings(findings, fallbackUrls) {
  const allowed = new Set(fallbackUrls);
  const entries = [];
  for (const finding of findings) {
    const uris = Array.isArray(finding.sourceUris) ? finding.sourceUris : [];
    for (const uri of uris) {
      if (allowed.size && !allowed.has(uri)) continue;
      entries.push({
        uri,
        title: finding.title || uri,
      });
    }
  }
  return entries;
}

function mergeInsights(baseInsights = [], extraInsights = []) {
  const merged = [...baseInsights];
  const seen = new Set(
    baseInsights.map((insight) => textValue(insight?.title).toLowerCase()).filter(Boolean),
  );

  for (const insight of extraInsights) {
    const key = textValue(insight?.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    const normalizedInsight = {
      title: textValue(insight?.title),
      summary: textValue(insight?.summary),
      howToAvoid: textValue(insight?.howToAvoid),
      threatLevel: normalizeThreatLevel(insight?.threatLevel),
    };

    if (!normalizedInsight.title || !normalizedInsight.summary || !normalizedInsight.howToAvoid) {
      continue;
    }

    merged.push(normalizedInsight);
    seen.add(key);
  }

  return merged;
}

function mergeSources(baseSources = [], extraSources = []) {
  const merged = [];
  const seen = new Set();

  for (const source of [...baseSources, ...extraSources]) {
    const uri = textValue(source?.uri);
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    merged.push({
      uri,
      title: textValue(source?.title) || uri,
    });
  }

  return merged;
}

function textValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
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
      focus: textValue(focus) || null,
    },
  };
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

function normalizeThreatLevel(level) {
  const normalized = textValue(level).toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function normalizeDateValue(input) {
  const value = textValue(input);
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function formatDisplayDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDisplayRange(start, end) {
  return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
}

function dedupeStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const normalized = textValue(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function canRunDeepResearch() {
  const hasFirecrawl = Boolean(process.env.FIRECRAWL_KEY);
  const hasModel = Boolean(
    process.env.OPENAI_KEY || process.env.CUSTOM_MODEL || process.env.FIREWORKS_KEY,
  );
  if (!hasFirecrawl || !hasModel) {
    if (!hasFirecrawl) {
      console.warn('Skipping deep research augmentation: FIRECRAWL_KEY not configured.');
    }
    if (!hasModel) {
      console.warn('Skipping deep research augmentation: OpenAI-compatible model key missing.');
    }
    return false;
  }
  return true;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

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
  const result = JSON.parse(jsonPayload);

  const groundedSources = extractGroundedSources(response);
  if (groundedSources.length) {
    result.sources = groundedSources;
  }

  result.publishedAt = new Date().toISOString();
  result.status = 'draft';

  return result;
}

async function runDeepResearchAugmentation({ focus }) {
  if (!canRunDeepResearch()) {
    return null;
  }

  const now = new Date();
  const endIso = now.toISOString();
  const windowDays = Number.parseInt(process.env.DEEP_RESEARCH_WINDOW_DAYS ?? '10', 10);
  const coverageDays = Number.isFinite(windowDays) && windowDays > 0 ? windowDays : 10;
  const start = new Date(now.getTime() - coverageDays * DAY_IN_MS);
  const startIso = start.toISOString();

  const requestFocus = focus ? ` Focus on ${focus}.` : '';
  const researchPrompt = `Research Objective: Identify cryptocurrency tokens or projects credibly accused of being scams where victims report losing funds.
Timeframe: ${formatDisplayRange(start, now)}.
Evidence Requirements: rely on firsthand loss reports, regulatory actions, or on-chain analyses that document losses. Capture token names, alleged scam pattern (rug pull, Ponzi, phishing, etc.), loss magnitude if stated, and impacted communities.${requestFocus}
Only use trustworthy coverage windows (≤ ${coverageDays} days old) and avoid speculation.`;

  const breadth = Number.parseInt(process.env.DEEP_RESEARCH_BREADTH ?? '4', 10);
  const depth = Number.parseInt(process.env.DEEP_RESEARCH_DEPTH ?? '2', 10);
  const researchBreadth = Number.isFinite(breadth) && breadth > 0 ? breadth : 4;
  const researchDepth = Number.isFinite(depth) && depth > 0 ? depth : 2;

  const { learnings = [], visitedUrls = [] } = await deepResearch({
    query: researchPrompt,
    breadth: researchBreadth,
    depth: researchDepth,
  });

  const cleanLearnings = learnings.filter(Boolean);
  const cleanUrls = dedupeStrings(visitedUrls.filter(Boolean));

  if (!cleanLearnings.length) {
    return {
      insights: [],
      sources: [],
      metadata: {
        generatedAt: endIso,
        timeframe: { start: startIso, end: endIso },
        summary: '',
        findings: [],
        learnings: [],
        visitedUrls: cleanUrls,
      },
    };
  }

  const structured = await summarizeDeepResearch({
    focus,
    timeframe: { start: startIso, end: endIso },
    learnings: cleanLearnings,
    visitedUrls: cleanUrls,
  });

  const findings = (structured.findings || [])
    .map(normalizeResearchFinding)
    .filter((finding) => finding.summary && finding.howToAvoid);
  const insights = findings
    .map((finding) => ({
      title: formatResearchTitle(finding),
      summary: finding.summary,
      howToAvoid: finding.howToAvoid,
      threatLevel: finding.threatLevel,
    }))
    .filter((insight) => insight.title && insight.summary && insight.howToAvoid);

  const sources = mergeSources([], extractSourcesFromFindings(findings, cleanUrls));

  return {
    insights,
    sources,
    metadata: {
      generatedAt: endIso,
      timeframe: { start: startIso, end: endIso },
      summary: textValue(structured.summary),
      findings,
      learnings: cleanLearnings,
      visitedUrls: cleanUrls,
    },
  };
}

async function runNewsletterGeneration({ focus }) {
  const [geminiResult, deepResearchResult] = await Promise.all([
    runGeminiBriefing({ focus }).catch((error) => {
      console.error('Gemini workflow failed', error);
      return buildGeminiFallback({ focus, error });
    }),
    runDeepResearchAugmentation({ focus }).catch((error) => {
      console.error('Deep research augmentation failed', error);
      return null;
    }),
  ]);

  const normalizedGemini = {
    ...geminiResult,
    insights: Array.isArray(geminiResult.insights) ? geminiResult.insights : [],
    sources: Array.isArray(geminiResult.sources) ? geminiResult.sources : [],
    metadata: geminiResult.metadata && typeof geminiResult.metadata === 'object'
      ? { ...geminiResult.metadata }
      : {},
  };

  if (!deepResearchResult) {
    return normalizedGemini;
  }

  const mergedInsights = mergeInsights(normalizedGemini.insights, deepResearchResult.insights);
  const mergedSources = mergeSources(normalizedGemini.sources, deepResearchResult.sources);

  return {
    ...normalizedGemini,
    insights: mergedInsights,
    sources: mergedSources,
    metadata: {
      ...normalizedGemini.metadata,
      deepResearch: deepResearchResult.metadata,
    },
  };
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
