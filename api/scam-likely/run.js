import { supabase } from "../_lib/supabase.js";
import { checkUsageAndEntitlements } from "../_lib/limits.js";

import { createHmac } from 'crypto';

const GOPLUS_API_KEY = process.env.GOPLUS_API_KEY;
const GOPLUS_API_SECRET = process.env.GOPLUS_API_SECRET;
let accessToken = null;
let tokenExpiresAt = null;

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiresAt && tokenExpiresAt > Date.now()) {
    return accessToken;
  }

  // If no credentials configured, return null (API works without auth, just limited)
  if (!GOPLUS_API_KEY || !GOPLUS_API_SECRET) {
    console.log("GoPlus credentials not configured - using unauthenticated mode");
    return null;
  }

  try {
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
      const errorBody = await response.text().catch(() => "");
      console.error("GoPlus token request failed:", response.status, errorBody);
      console.log("Falling back to unauthenticated mode");
      return null;
    }

    const data = await response.json();

    // Check for error in response
    if (data.code !== 1 && data.code !== "1") {
      console.error("GoPlus token error:", data.message || data.msg);
      console.log("Falling back to unauthenticated mode");
      return null;
    }

    if (!data.result?.access_token) {
      console.error("GoPlus token response missing access_token");
      console.log("Falling back to unauthenticated mode");
      return null;
    }

    accessToken = data.result.access_token;
    tokenExpiresAt = Date.now() + (data.result.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error("GoPlus auth error:", error.message);
    console.log("Falling back to unauthenticated mode");
    return null;
  }
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

  const headers = {
    "Content-Type": "application/json",
  };

  // Only add auth header if we have a token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("GoPlus security API failed:", response.status, errorBody);
    throw new Error(`GoPlus API responded with status: ${response.status}`);
  }

  const data = await response.json();

  // Check if API returned an error
  if (data.code !== 1 && data.code !== "1") {
    console.error("GoPlus API error:", data.message || data.msg);
    throw new Error(`GoPlus API error: ${data.message || data.msg || "Unknown error"}`);
  }

  console.log("GoPlus response keys:", Object.keys(data.result || {}));

  // GoPlus returns a result object where the key is the address
  return data.result?.[address.toLowerCase()] ?? null;
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
      return res.status(404).json({
        error: "Token not found or not supported by GoPlus.",
        code: "token_not_found",
        query,
        chainId
      });
    }

    const analysis = buildAnalysis({ goPlusData, address: query });

    await persistScan({
      userId: userResult.user.id,
      query,
      analysis,
    }).catch((persistError) => {
      console.error("Failed to persist scan (non-blocking)", persistError);
    });

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("Scan run failed", error);
    const isGoPlusError = error.message?.includes("GoPlus");
    return res.status(500).json({
      error: error.message,
      code: isGoPlusError ? "goplus_error" : "scan_failed"
    });
  }
}

function buildAnalysis({ goPlusData, address }) {
  const g = goPlusData;

  // Extract all relevant fields
  const tokenName = g.token_name || "Unknown Token";
  const tokenSymbol = g.token_symbol || "???";
  const holderCount = parseInt(g.holder_count) || 0;
  const lpHolderCount = parseInt(g.lp_holder_count) || 0;

  // Parse percentages and taxes
  const buyTax = parseFloat(g.buy_tax) || 0;
  const sellTax = parseFloat(g.sell_tax) || 0;
  const ownerPercent = parseFloat(g.owner_percent) * 100 || 0;
  const creatorPercent = parseFloat(g.creator_percent) * 100 || 0;
  const lpTotalSupply = parseFloat(g.lp_total_supply) || 0;

  // Build comprehensive flags
  const flags = [];
  const positives = [];

  // === CRITICAL RISKS (25 points each) ===
  if (g.is_honeypot === "1") {
    flags.push({ severity: "critical", title: "Honeypot Detected", detail: "You will NOT be able to sell this token after buying. Avoid at all costs." });
  }
  if (g.honeypot_with_same_creator === "1") {
    flags.push({ severity: "critical", title: "Creator Made Previous Honeypots", detail: "This creator has deployed honeypot scams before." });
  }
  if (g.is_blacklisted === "1") {
    flags.push({ severity: "critical", title: "Blacklist Function", detail: "Owner can blacklist addresses from selling." });
  }
  if (g.is_whitelisted === "1") {
    flags.push({ severity: "critical", title: "Whitelist Restriction", detail: "Only whitelisted addresses can trade." });
  }
  if (g.selfdestruct === "1") {
    flags.push({ severity: "critical", title: "Self-Destruct Function", detail: "Contract can be destroyed, potentially stealing all funds." });
  }
  if (g.external_call === "1") {
    flags.push({ severity: "critical", title: "External Call Risk", detail: "Contract makes external calls that could be exploited." });
  }

  // === HIGH RISKS (15 points each) ===
  if (g.cannot_sell_all === "1") {
    flags.push({ severity: "high", title: "Cannot Sell All", detail: "You may not be able to sell 100% of your tokens." });
  }
  if (g.cannot_buy === "1") {
    flags.push({ severity: "high", title: "Buying Disabled", detail: "Buying is currently disabled on this token." });
  }
  if (g.trading_cooldown === "1") {
    flags.push({ severity: "high", title: "Trading Cooldown", detail: "Forced waiting period between trades." });
  }
  if (g.transfer_pausable === "1") {
    flags.push({ severity: "high", title: "Transfers Pausable", detail: "Owner can pause all transfers at any time." });
  }
  if (g.is_anti_whale === "1") {
    flags.push({ severity: "high", title: "Anti-Whale Limits", detail: "Transaction size limits may prevent large sells." });
  }
  if (g.anti_whale_modifiable === "1") {
    flags.push({ severity: "high", title: "Modifiable Anti-Whale", detail: "Owner can change anti-whale rules arbitrarily." });
  }
  if (g.hidden_owner === "1") {
    flags.push({ severity: "high", title: "Hidden Owner", detail: "True contract owner is obfuscated." });
  }
  if (buyTax > 10 || sellTax > 10) {
    flags.push({ severity: "high", title: "High Tax", detail: `Buy: ${buyTax.toFixed(1)}% / Sell: ${sellTax.toFixed(1)}%. Over 10% is a red flag.` });
  }

  // === MODERATE RISKS (8 points each) ===
  if (g.slippage_modifiable === "1") {
    flags.push({ severity: "moderate", title: "Modifiable Slippage", detail: "Owner can change slippage settings." });
  }
  if (g.personal_slippage_modifiable === "1") {
    flags.push({ severity: "moderate", title: "Personal Slippage Control", detail: "Owner can set different slippage per wallet." });
  }
  if (g.is_mintable === "1") {
    flags.push({ severity: "moderate", title: "Mintable Supply", detail: "New tokens can be minted, diluting holders." });
  }
  if (g.can_take_back_ownership === "1") {
    flags.push({ severity: "moderate", title: "Recoverable Ownership", detail: "Ownership can be reclaimed after renouncing." });
  }
  if (g.owner_change_balance === "1") {
    flags.push({ severity: "moderate", title: "Balance Manipulation", detail: "Owner can modify wallet balances." });
  }
  if (ownerPercent > 10) {
    flags.push({ severity: "moderate", title: "High Owner Holdings", detail: `Owner holds ${ownerPercent.toFixed(1)}% of supply.` });
  }
  if (creatorPercent > 10) {
    flags.push({ severity: "moderate", title: "High Creator Holdings", detail: `Creator holds ${creatorPercent.toFixed(1)}% of supply.` });
  }
  if (buyTax > 5 && buyTax <= 10) {
    flags.push({ severity: "moderate", title: "Elevated Tax", detail: `Buy: ${buyTax.toFixed(1)}% / Sell: ${sellTax.toFixed(1)}%.` });
  }

  // === POSITIVE SIGNALS ===
  if (g.is_open_source === "1") {
    positives.push("Contract is open source and verified");
  }
  if (g.is_proxy === "0") {
    positives.push("Not a proxy contract (harder to rug)");
  }
  if (g.is_honeypot === "0") {
    positives.push("Not detected as honeypot");
  }
  if (g.is_in_dex === "1") {
    positives.push("Listed on decentralized exchange");
  }
  if (g.is_true_token === "1") {
    positives.push("Verified as legitimate token standard");
  }
  if (g.is_airdrop_scam === "0") {
    positives.push("No airdrop scam patterns detected");
  }
  if (holderCount > 1000) {
    positives.push(`${holderCount.toLocaleString()} holders`);
  }
  if (lpHolderCount > 10) {
    positives.push(`${lpHolderCount} liquidity providers`);
  }
  if (buyTax === 0 && sellTax === 0) {
    positives.push("Zero trading tax");
  }
  if (g.owner_address === "0x0000000000000000000000000000000000000000") {
    positives.push("Ownership renounced");
  }

  // Calculate score
  const score = calculateRiskScore(flags);
  const verdict = score >= 75 ? "Critical Risk" : score >= 50 ? "High Risk" : score >= 25 ? "Elevated Risk" : "Low Risk";

  // Build narrative
  let narrative;
  if (score >= 75) {
    narrative = `${tokenName} (${tokenSymbol}) shows critical risk signals. ${flags.length} warning${flags.length !== 1 ? 's' : ''} detected including potential scam indicators. Do not invest.`;
  } else if (score >= 50) {
    narrative = `${tokenName} (${tokenSymbol}) has significant risk factors. Found ${flags.length} concern${flags.length !== 1 ? 's' : ''} that warrant caution. Manual review strongly recommended.`;
  } else if (score >= 25) {
    narrative = `${tokenName} (${tokenSymbol}) shows some elevated risk signals. Review the ${flags.length} flag${flags.length !== 1 ? 's' : ''} below before investing.`;
  } else if (flags.length > 0) {
    narrative = `${tokenName} (${tokenSymbol}) appears relatively safe with ${flags.length} minor concern${flags.length !== 1 ? 's' : ''}. ${positives.length > 0 ? positives.slice(0, 2).join('. ') + '.' : ''}`;
  } else {
    narrative = `${tokenName} (${tokenSymbol}) shows no major red flags. ${positives.length > 0 ? positives.slice(0, 3).join('. ') + '.' : 'Continue with standard due diligence.'}`;
  }

  // Build pillars with actual data
  const pillars = [
    {
      name: "Contract Security",
      score: calculatePillarScore(flags, ["Honeypot", "Self-Destruct", "External Call", "Blacklist", "Whitelist", "Hidden Owner", "Proxy"]),
      highlights: flags.filter(f => ["Honeypot", "Self-Destruct", "External Call", "Blacklist", "Whitelist", "Hidden Owner"].some(k => f.title.includes(k))).map(f => f.detail),
      summary: g.is_open_source === "1" ? "Contract is verified and open source." : "Contract source not verified.",
    },
    {
      name: "Trading Mechanics",
      score: calculatePillarScore(flags, ["Tax", "Slippage", "Cannot Sell", "Cannot Buy", "Cooldown", "Pausable", "Anti-Whale"]),
      highlights: [
        `Buy Tax: ${buyTax.toFixed(1)}%`,
        `Sell Tax: ${sellTax.toFixed(1)}%`,
        ...flags.filter(f => ["Slippage", "Cannot", "Cooldown", "Pausable", "Anti-Whale"].some(k => f.title.includes(k))).map(f => f.title),
      ].slice(0, 4),
      summary: buyTax === 0 && sellTax === 0 ? "No trading taxes detected." : `Trading taxes: ${buyTax.toFixed(1)}% buy / ${sellTax.toFixed(1)}% sell.`,
    },
    {
      name: "Ownership & Supply",
      score: calculatePillarScore(flags, ["Owner", "Creator", "Mintable", "Balance"]),
      highlights: [
        g.owner_address === "0x0000000000000000000000000000000000000000" ? "Ownership renounced" : `Owner: ${g.owner_address?.slice(0, 8)}...`,
        ownerPercent > 0 ? `Owner holds ${ownerPercent.toFixed(1)}%` : null,
        creatorPercent > 0 ? `Creator holds ${creatorPercent.toFixed(1)}%` : null,
        g.is_mintable === "1" ? "Token is mintable" : "Fixed supply",
      ].filter(Boolean).slice(0, 4),
      summary: g.owner_address === "0x0000000000000000000000000000000000000000" ? "Ownership has been renounced." : "Contract has active owner.",
    },
    {
      name: "Liquidity & Holders",
      score: holderCount < 100 ? 60 : holderCount < 500 ? 40 : holderCount < 1000 ? 25 : 10,
      highlights: [
        `${holderCount.toLocaleString()} token holders`,
        `${lpHolderCount} liquidity providers`,
        g.is_in_dex === "1" ? "Listed on DEX" : "Not on DEX",
        lpTotalSupply > 0 ? `LP Supply: ${lpTotalSupply.toFixed(2)}` : null,
      ].filter(Boolean),
      summary: holderCount > 1000 ? "Strong holder distribution." : holderCount > 100 ? "Moderate holder count." : "Low holder count - higher risk.",
    },
  ];

  // Add severity to pillars
  pillars.forEach(p => {
    p.severity = p.score >= 60 ? "High Risk" : p.score >= 40 ? "Moderate Risk" : "Low Risk";
  });

  return {
    token: {
      address,
      name: tokenName,
      symbol: tokenSymbol,
      type: "ERC20",
      owner: g.owner_address,
      totalSupply: g.total_supply,
    },
    metrics: {
      holderCount,
      lpHolderCount,
      lpTotalSupply,
      buyTax,
      sellTax,
      dex: g.dex,
    },
    risk: {
      score,
      verdict,
      flags,
    },
    positives,
    narrative,
    pillars,
    nextSteps: generateNextSteps(flags, score),
    sources: {
      goplus: true,
    },
    fetchedAt: new Date().toISOString(),
  };
}

function calculatePillarScore(flags, keywords) {
  let score = 0;
  for (const flag of flags) {
    if (keywords.some(k => flag.title.includes(k))) {
      if (flag.severity === "critical") score += 30;
      else if (flag.severity === "high") score += 20;
      else if (flag.severity === "moderate") score += 10;
    }
  }
  return Math.min(100, score);
}

function generateNextSteps(flags, score) {
  const steps = [];

  if (score >= 50) {
    steps.push("Do not invest until all flags are thoroughly investigated.");
  }

  if (flags.some(f => f.title.includes("Owner") || f.title.includes("Creator"))) {
    steps.push("Check if ownership is renounced on the block explorer.");
  }
  if (flags.some(f => f.title.includes("Tax"))) {
    steps.push("Verify actual tax rates by simulating a small trade.");
  }
  if (flags.some(f => f.title.includes("Liquidity") || f.title.includes("LP"))) {
    steps.push("Verify liquidity is locked using a lock checker tool.");
  }

  if (steps.length === 0) {
    steps.push("Verify the contract on the block explorer.");
    steps.push("Check community channels for recent activity.");
    steps.push("Start with a small test transaction if investing.");
  }

  return steps.slice(0, 4);
}

function calculateRiskScore(flags) {
  let score = 0;
  for (const flag of flags) {
    if (flag.severity === "critical") {
      score += 25;
    } else if (flag.severity === "high") {
      score += 15;
    } else if (flag.severity === "moderate") {
      score += 8;
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
