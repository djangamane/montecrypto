import { GoogleGenAI } from '@google/genai';
import { supabase } from '../_lib/supabase.js';

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

  const { query } = parseBody(req.body);
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await runGeminiAnalysis(query);

    await supabase
      .from('scans')
      .insert({
        user_id: userResult.user.id,
        product: 'scam_likely_ai',
        query,
        score: Number(result.overallScore) || null,
        verdict: deriveVerdict(result.overallScore),
        raw_response: result,
      });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Gemini analysis failed', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze token.' });
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

async function runGeminiAnalysis(query) {
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = buildPrompt(query);

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = await extractText(response);
  const jsonPayload = sanitizeJson(rawText);
  const rawResult = JSON.parse(jsonPayload);

  const groundedSources = extractGroundedSources(response);
  if (groundedSources.length) {
    rawResult.sources = groundedSources;
  }

  return applyScoreAdjustments(rawResult, query);
}

function buildPrompt(query) {
  return `You are a crypto security analyst. Analyze the token at "${query}" using ONLY the provided Google Search tool results. ` +
    `Provide a JSON object with these keys: tokenName, overallScore (0-100), summary, onChainAnalysis, offChainIntelligence, socialSentiment, institutionalInterest, and sources. ` +
    `Each analysis array should contain objects with "finding" and "severity" (Low|Medium|High|Critical). ` +
    `If the address is invalid or not a token, state that in the summary and return overallScore 100. ` +
    `Return ONLY valid JSON with the described shape.`;
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
  return chunks
    .filter((chunk) => chunk?.web?.uri && chunk?.web?.title)
    .map((chunk) => ({ title: chunk.web.title, url: chunk.web.uri }));
}

function deriveVerdict(score) {
  const value = Number(score) || 0;
  if (value >= 70) return 'High Risk';
  if (value >= 50) return 'Elevated Risk';
  return 'Guarded';
}

function initClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Gemini analysis endpoint disabled.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const TOP_50_IDENTIFIERS = new Set(
  [
    ['bitcoin', 'btc'],
    ['ethereum', 'eth'],
    ['tether', 'usdt'],
    ['binance coin', 'bnb'],
    ['solana', 'sol'],
    ['ripple', 'xrp'],
    ['usd coin', 'usdc'],
    ['cardano', 'ada'],
    ['dogecoin', 'doge'],
    ['tron', 'trx'],
    ['toncoin', 'ton'],
    ['avalanche', 'avax'],
    ['shiba inu', 'shib'],
    ['wrapped bitcoin', 'wbtc'],
    ['chainlink', 'link'],
    ['polygon', 'matic'],
    ['polkadot', 'dot'],
    ['litecoin', 'ltc'],
    ['dai', 'dai'],
    ['uniswap', 'uni'],
    ['bitcoin cash', 'bch'],
    ['leo token', 'leo', 'leocoin'],
    ['stellar', 'xlm'],
    ['okb', 'okx'],
    ['internet computer', 'icp'],
    ['filecoin', 'fil'],
    ['lido dao', 'ldo'],
    ['cosmos', 'atom'],
    ['monero', 'xmr'],
    ['ethereum classic', 'etc'],
    ['aptos', 'apt'],
    ['hedera', 'hbar'],
    ['arbitrum', 'arb'],
    ['near protocol', 'near'],
    ['vechain', 'vet'],
    ['optimism', 'op'],
    ['maker', 'mkr'],
    ['quant', 'qnt'],
    ['algorand', 'algo'],
    ['render', 'rndr'],
    ['aave', 'aave'],
    ['the graph', 'grt'],
    ['injective', 'inj'],
    ['sui', 'sui'],
    ['immutable', 'imx'],
    ['kaspa', 'kas'],
    ['mantle', 'mnt'],
    ['celestia', 'tia'],
    ['arweave', 'ar'],
    ['fantom', 'ftm'],
    ['thorchain', 'rune'],
    ['gala', 'gala'],
    ['flow', 'flow'],
    ['axie infinity', 'axs'],
    ['the sandbox', 'sand'],
  ]
    .flat()
    .map(normalizeIdentifier),
);

function applyScoreAdjustments(result, query) {
  const safeResult = { ...result };
  const originalScore = Number(safeResult.overallScore) || 0;
  const modifiers = Array.isArray(safeResult.scoreAdjustments)
    ? safeResult.scoreAdjustments.slice()
    : [];

  const isTop50 = isTop50Coin(query, safeResult.tokenName);

  let adjustedScore = originalScore;

  if (isTop50) {
    adjustedScore = clampScore(originalScore * 0.85);
    modifiers.push({
      id: 'top-50-market-cap',
      label: 'Top 50 market-cap asset',
      impact: '-15%',
      description: 'Blue-chip market presence reduces overall risk relative to similar assets.',
    });
  }

  safeResult.originalScore = originalScore;
  safeResult.overallScore = adjustedScore;
  safeResult.scoreAdjustments = modifiers;
  safeResult.top50Coin = isTop50;

  return safeResult;
}

function normalizeIdentifier(value) {
  if (!value || typeof value !== 'string') return '';
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTop50Coin(query, tokenName) {
  const inputs = [query, tokenName]
    .filter((value) => typeof value === 'string')
    .flatMap((value) => {
      const normalized = normalizeIdentifier(value);
      const parts = value.split(/[\s:/\-()]+/).map(normalizeIdentifier);
      return [normalized, ...parts];
    })
    .filter(Boolean);

  return inputs.some((identifier) => TOP_50_IDENTIFIERS.has(identifier));
}

function clampScore(value) {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
