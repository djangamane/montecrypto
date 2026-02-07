/**
 * MCP/API Key authenticated endpoint for Scam Likely analysis
 * This endpoint uses API key auth instead of Supabase session auth
 */

import { supabase } from "../_lib/supabase.js";
import { createHmac } from 'crypto';
import crypto from 'crypto';

const GOPLUS_API_KEY = process.env.GOPLUS_API_KEY;
const GOPLUS_API_SECRET = process.env.GOPLUS_API_SECRET;
let accessToken = null;
let tokenExpiresAt = null;

/**
 * Hash API key for lookup
 */
function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Validate API key from request header
 */
async function validateApiKey(req) {
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.substring("Bearer ".length)
    : req.headers["x-api-key"];

  if (!apiKey || !apiKey.startsWith("acr_")) {
    return { valid: false, error: "Invalid or missing API key" };
  }

  const keyHash = hashApiKey(apiKey);

  const { data: keyData, error } = await supabase
    .from("api_keys")
    .select("id, user_id, tier, calls_today, daily_limit, is_active")
    .eq("key_hash", keyHash)
    .single();

  if (error || !keyData) {
    return { valid: false, error: "Invalid API key" };
  }

  if (!keyData.is_active) {
    return { valid: false, error: "API key is disabled" };
  }

  if (keyData.daily_limit && keyData.calls_today >= keyData.daily_limit) {
    return {
      valid: false,
      error: `Daily limit reached (${keyData.daily_limit} calls). Upgrade at https://aicryptorisk.com/pricing`
    };
  }

  return {
    valid: true,
    userId: keyData.user_id,
    tier: keyData.tier,
    keyId: keyData.id
  };
}

/**
 * Track API usage
 */
async function trackUsage(keyId, success) {
  if (!keyId) return;

  try {
    await supabase.rpc("increment_api_calls", { key_id: keyId });

    await supabase.from("api_usage_log").insert({
      api_key_id: keyId,
      tool_name: "analyze_crypto_risk",
      success,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Usage tracking error:", err.message);
  }
}

async function getAccessToken() {
  if (accessToken && tokenExpiresAt && tokenExpiresAt > Date.now()) {
    return accessToken;
  }

  if (!GOPLUS_API_KEY || !GOPLUS_API_SECRET) {
    return null;
  }

  try {
    const time = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', GOPLUS_API_SECRET)
      .update(GOPLUS_API_KEY.toLowerCase() + time)
      .digest('hex');

    const response = await fetch("https://api.gopluslabs.io/api/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: GOPLUS_API_KEY,
        sign: signature,
        time: time,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 1 && data.code !== "1") return null;
    if (!data.result?.access_token) return null;

    accessToken = data.result.access_token;
    tokenExpiresAt = Date.now() + (data.result.expires_in * 1000);
    return accessToken;
  } catch {
    return null;
  }
}

async function fetchGoPlusAnalysis(address, chainId = '1') {
  const token = await getAccessToken();
  const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, { method: "GET", headers });

  if (!response.ok) {
    throw new Error(`GoPlus API responded with status: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== 1 && data.code !== "1") {
    throw new Error(`GoPlus API error: ${data.message || data.msg || "Unknown error"}`);
  }

  return data.result?.[address.toLowerCase()] ?? null;
}

export default async function handler(req, res) {
  // CORS for external API access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate API key
  const auth = await validateApiKey(req);
  if (!auth.valid) {
    return res.status(401).json({ error: auth.error });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
  }

  // Support both 'query' and 'contractAddress' field names
  const address = body?.contractAddress || body?.contract_address || body?.query;
  if (!address) {
    return res.status(400).json({ error: "contractAddress is required" });
  }

  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!isAddress) {
    return res.status(400).json({ error: "Invalid contract address format" });
  }

  const chainId = body?.chainId || body?.chain || '1';

  try {
    const goPlusData = await fetchGoPlusAnalysis(address, chainId);
    if (!goPlusData) {
      await trackUsage(auth.keyId, false);
      return res.status(404).json({
        error: "Token not found or not supported",
        code: "token_not_found",
        address,
        chainId
      });
    }

    const analysis = buildAnalysis({ goPlusData, address });

    // Track successful usage
    await trackUsage(auth.keyId, true);

    // Persist scan (non-blocking)
    supabase.from("scans").insert({
      user_id: auth.userId,
      product: "scam_likely_mcp",
      query: address,
      score: analysis.risk.score,
      verdict: analysis.risk.verdict,
      raw_response: analysis,
    }).then(() => {}).catch(() => {});

    return res.status(200).json(analysis);
  } catch (error) {
    await trackUsage(auth.keyId, false);
    return res.status(500).json({
      error: error.message,
      code: "scan_failed"
    });
  }
}

// Reuse the same buildAnalysis function from run.js
function buildAnalysis({ goPlusData, address }) {
  const g = goPlusData;

  const tokenName = g.token_name || "Unknown Token";
  const tokenSymbol = g.token_symbol || "???";
  const holderCount = parseInt(g.holder_count) || 0;
  const lpHolderCount = parseInt(g.lp_holder_count) || 0;

  const buyTax = parseFloat(g.buy_tax) || 0;
  const sellTax = parseFloat(g.sell_tax) || 0;
  const ownerPercent = parseFloat(g.owner_percent) * 100 || 0;
  const creatorPercent = parseFloat(g.creator_percent) * 100 || 0;
  const lpTotalSupply = parseFloat(g.lp_total_supply) || 0;

  const flags = [];
  const positives = [];

  // Critical risks
  if (g.is_honeypot === "1") flags.push({ severity: "critical", title: "Honeypot Detected", detail: "Cannot sell after buying" });
  if (g.honeypot_with_same_creator === "1") flags.push({ severity: "critical", title: "Creator Made Previous Honeypots", detail: "Known scammer" });
  if (g.is_blacklisted === "1") flags.push({ severity: "critical", title: "Blacklist Function", detail: "Owner can block sells" });
  if (g.selfdestruct === "1") flags.push({ severity: "critical", title: "Self-Destruct", detail: "Contract can be destroyed" });

  // High risks
  if (g.cannot_sell_all === "1") flags.push({ severity: "high", title: "Cannot Sell All", detail: "Selling restrictions" });
  if (g.transfer_pausable === "1") flags.push({ severity: "high", title: "Pausable", detail: "Transfers can be paused" });
  if (g.hidden_owner === "1") flags.push({ severity: "high", title: "Hidden Owner", detail: "Obfuscated ownership" });
  if (buyTax > 10 || sellTax > 10) flags.push({ severity: "high", title: "High Tax", detail: `${buyTax}% buy / ${sellTax}% sell` });

  // Moderate risks
  if (g.is_mintable === "1") flags.push({ severity: "moderate", title: "Mintable", detail: "Supply can increase" });
  if (ownerPercent > 10) flags.push({ severity: "moderate", title: "High Owner Holdings", detail: `${ownerPercent.toFixed(1)}%` });

  // Positives
  if (g.is_open_source === "1") positives.push("Verified source code");
  if (g.is_honeypot === "0") positives.push("Not a honeypot");
  if (g.is_in_dex === "1") positives.push("Listed on DEX");
  if (holderCount > 1000) positives.push(`${holderCount.toLocaleString()} holders`);
  if (buyTax === 0 && sellTax === 0) positives.push("Zero tax");

  const score = calculateRiskScore(flags);
  const verdict = score >= 75 ? "Critical Risk" : score >= 50 ? "High Risk" : score >= 25 ? "Elevated Risk" : "Low Risk";

  return {
    token: {
      address,
      name: tokenName,
      symbol: tokenSymbol,
      owner: g.owner_address,
    },
    risk: {
      score,
      verdict,
      flags,
    },
    positives,
    metrics: {
      holderCount,
      lpHolderCount,
      buyTax,
      sellTax,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function calculateRiskScore(flags) {
  let score = 0;
  for (const flag of flags) {
    if (flag.severity === "critical") score += 25;
    else if (flag.severity === "high") score += 15;
    else if (flag.severity === "moderate") score += 8;
  }
  return Math.min(100, score);
}
