import { supabase } from "../_lib/supabase.js";
import { checkUsageAndEntitlements } from "../_lib/limits.js";

import { createHmac } from 'crypto';

const GOPLUS_API_KEY = process.env.GOPLUS_API_KEY;
const GOPLUS_API_SECRET = process.env.GOPLUS_API_SECRET;
let accessToken = null;
let tokenExpiresAt = null;

async function getAccessToken() {
  if (accessToken && tokenExpiresAt && tokenExpiresAt > Date.now()) {
    return accessToken;
  }

  if (!GOPLUS_API_KEY || !GOPLUS_API_SECRET) {
    throw new Error("GoPlus API key or secret is not configured.");
  }

  const time = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', GOPLUS_API_SECRET).update(GOPLUS_API_KEY.toLowerCase() + time).digest('hex');

  const response = await fetch("https://api.gopluslabs.io/api/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_key: GOPLUS_API_KEY,
      sign: signature,
      time: time,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get GoPlus access token: ${response.status}`);
  }

  const data = await response.json();
  accessToken = data.result.access_token;
  tokenExpiresAt = Date.now() + (data.result.expires_in * 1000);
  return accessToken;
}

/**
 * Fetches token security data from the GoPlus Security API.
 * @param {string} address The contract address to check.
 * @param {string} chainId The chain ID to check the address on.
 * @returns {Promise<any>} The JSON response from the API.
 */
async function fetchGoPlusAnalysis(address, chainId = '1') { // Default to Ethereum mainnet
  const token = await getAccessToken();
  const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`GoPlus API responded with status: ${response.status}`);
    }

    const data = await response.json();
    // GoPlus returns a result object where the key is the address
    return data.result[address.toLowerCase()];
  } catch (error) {
    console.error("Error fetching from GoPlus API:", error);
    throw new Error("Failed to fetch security analysis.");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Supabase access token" });
  }

  const { data: userResult, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: "Invalid Supabase session" });
  }

  const userId = userResult.user.id;

  try {
    const { isOverLimit, plan } = await checkUsageAndEntitlements(userId);
    if (isOverLimit) {
      const message =
        plan === "free"
          ? "You have exceeded your daily limit of 1 free scan."
          : "You have exceeded your monthly scan limit.";
      return res
        .status(429)
        .json({ error: message, code: "rate_limit_exceeded" });
    }
  } catch (error) {
    console.error("Usage check failed", error);
    return res.status(500).json({ error: "Could not verify usage limits." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
  }

  const query = body?.query?.trim();
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(query);
  if (!isAddress) {
    return res
      .status(400)
      .json({
        error: "Only direct contract addresses are supported in this preview",
      });
  }

  const chainId = body?.chainId || '1'; // Default to Ethereum mainnet

  try {
    const goPlusData = await fetchGoPlusAnalysis(query, chainId);
    if (!goPlusData) {
      return res.status(404).json({ error: "Token not found or not supported by GoPlus." });
    }

    const analysis = buildAnalysis({ goPlusData, address: query });

    await persistScan({
      userId: userResult.user.id,
      query,
      analysis,
    });

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Scan run failed", error);
    return res.status(500).json({ error: error.message });
  }
}

function buildAnalysis({ goPlusData, address }) {
  const {
    token_name,
    token_symbol,
    total_supply,
    owner_address,
    is_honeypot,
    honeypot_with_same_creator,
    cannot_sell_all,
    buy_tax,
    sell_tax,
    slippage_modifiable,
    is_in_dex,
    dex,
    holder_count,
    owner_balance,
    owner_percent,
    creator_address,
    creator_balance,
    creator_percent,
    lp_holder_count,
    lp_total_supply,
  } = goPlusData;

  const flags = [];
  if (is_honeypot === "1") {
    flags.push({ severity: "high", title: "Honeypot Detected", detail: "This token appears to be a honeypot, meaning you may not be able to sell it after buying." });
  }
  if (honeypot_with_same_creator === "1") {
    flags.push({ severity: "high", title: "Creator Linked to Previous Honeypots", detail: "The creator of this token has been associated with other honeypot scams." });
  }
  if (cannot_sell_all === "1") {
    flags.push({ severity: "high", title: "Sell-All Restriction", detail: "The contract may prevent you from selling all of your tokens at once." });
  }
  if (parseFloat(buy_tax) > 10 || parseFloat(sell_tax) > 10) {
    flags.push({ severity: "high", title: "High Buy/Sell Tax", detail: `The buy tax is ${buy_tax}% and the sell tax is ${sell_tax}%. High taxes can be a sign of a scam.` });
  }
  if (slippage_modifiable === "1") {
    flags.push({ severity: "moderate", title: "Modifiable Slippage", detail: "The contract owner can modify the slippage, which could lead to unfavorable trades." });
  }
  if (owner_balance && owner_percent && parseFloat(owner_percent) > 20) {
    flags.push({ severity: "moderate", title: "High Owner Balance", detail: `The contract owner holds ${owner_percent}% of the token supply.` });
  }
  if (creator_balance && creator_percent && parseFloat(creator_percent) > 20) {
    flags.push({ severity: "moderate", title: "High Creator Balance", detail: `The token creator holds ${creator_percent}% of the token supply.` });
  }

  const score = calculateRiskScore(flags);
  const verdict = score >= 70 ? "High Risk" : score >= 40 ? "Elevated Risk" : "Guarded";

  return {
    token: {
      address,
      name: token_name,
      symbol: token_symbol,
      decimals: null, // GoPlus doesn't provide this, may need another source if required
      type: "ERC20",
      owner: owner_address,
      totalSupply: total_supply,
      circulatingSupply: null, // GoPlus doesn't provide this
      lastUpdated: null,
    },
    metrics: {
      holderCount: holder_count,
      lpTotalSupply: lp_total_supply,
      dex,
    },
    risk: {
      score,
      verdict,
      flags,
    },
    sources: {
      goplus: true,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function calculateRiskScore(flags) {
  let score = 0;
  for (const flag of flags) {
    if (flag.severity === "high") {
      score += 25;
    } else if (flag.severity === "moderate") {
      score += 10;
    }
  }
  return Math.min(100, score);
}

async function persistScan({ userId, query, analysis }) {
  const { error } = await supabase.from("scans").insert({
    user_id: userId,
    product: "scam_likely",
    query,
    score: analysis.risk.score,
    verdict: analysis.risk.verdict,
    raw_response: analysis,
  });

  if (error) {
    console.error("Supabase insert error", error);
  }
}
