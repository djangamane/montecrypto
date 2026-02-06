import { supabase } from "../_lib/supabase.js";

// Make.com webhook URL - set this in Vercel environment variables
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

const CHAIN_NAMES = {
  '1': 'Ethereum',
  '56': 'BNB Chain',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '10': 'Optimism',
  '43114': 'Avalanche',
  '8453': 'Base',
  'solana': 'Solana',
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate user
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const user = userResult.user;
  const userEmail = user.email;

  if (!userEmail) {
    return res.status(400).json({ error: "No email associated with your account" });
  }

  // Parse request body
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
  }

  const { contractAddress, coinName, coinSymbol, chain } = body;

  // Validate required fields
  if (!contractAddress?.trim()) {
    return res.status(400).json({ error: "Contract address is required" });
  }

  if (!coinName?.trim()) {
    return res.status(400).json({ error: "Coin name is required" });
  }

  const chainName = CHAIN_NAMES[chain] || 'Unknown';

  // Build the research prompt for Perplexity (to be used by Make automation)
  const researchPrompt = buildResearchPrompt({
    contractAddress: contractAddress.trim(),
    coinName: coinName.trim(),
    coinSymbol: coinSymbol?.trim() || coinName.trim().toUpperCase().slice(0, 5),
    chain: chainName,
  });

  // Check if webhook is configured
  if (!MAKE_WEBHOOK_URL) {
    console.error("MAKE_WEBHOOK_URL not configured");
    return res.status(500).json({ error: "Research service not configured" });
  }

  try {
    // Send to Make.com webhook
    const webhookResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // User info
        userEmail,
        userId: user.id,

        // Token info
        contractAddress: contractAddress.trim(),
        coinName: coinName.trim(),
        coinSymbol: coinSymbol?.trim() || coinName.trim().toUpperCase().slice(0, 5),
        chain: chainName,
        chainId: chain,

        // Research prompt for Perplexity
        researchPrompt,

        // Metadata
        requestedAt: new Date().toISOString(),
      }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text().catch(() => "");
      console.error("Make webhook failed:", webhookResponse.status, errorText);
      throw new Error("Failed to submit research request");
    }

    // Log the request
    await supabase.from("research_requests").insert({
      user_id: user.id,
      contract_address: contractAddress.trim(),
      coin_name: coinName.trim(),
      coin_symbol: coinSymbol?.trim() || null,
      chain: chainName,
      status: "pending",
    }).catch((err) => {
      console.error("Failed to log research request:", err);
    });

    return res.status(200).json({
      success: true,
      message: "Research request submitted. You will receive an email with results.",
    });

  } catch (error) {
    console.error("Research request failed:", error);
    return res.status(500).json({
      error: error.message || "Failed to submit research request",
    });
  }
}

function buildResearchPrompt({ contractAddress, coinName, coinSymbol, chain }) {
  return `You are a cryptocurrency security analyst. Perform comprehensive due diligence research on the following token:

TOKEN DETAILS:
- Name: ${coinName}
- Symbol: ${coinSymbol}
- Contract Address: ${contractAddress}
- Blockchain: ${chain}

Analyze this token across FOUR key risk dimensions and provide a detailed report:

## 1. CONTRACT SECURITY
- Is the contract verified and open source?
- Has it been audited? By whom?
- Are there any known vulnerabilities or exploits?
- Is it a proxy contract? Can it be upgraded?
- Does the contract have dangerous functions (mint, pause, blacklist, selfdestruct)?

## 2. TRADING MECHANICS
- What are the buy/sell taxes?
- Are there any trading restrictions (cooldowns, limits, whitelists)?
- Can the owner modify trading parameters?
- Is there sufficient liquidity?
- Is liquidity locked? For how long?

## 3. OWNERSHIP & TOKEN DISTRIBUTION
- Who owns the contract? Is ownership renounced?
- What percentage do the top 10 holders own?
- Are there any suspicious wallet patterns?
- Is the team doxxed or anonymous?
- Are there any connections to known scammers?

## 4. COMMUNITY & SOCIAL SIGNALS
- How active is the community (Twitter, Telegram, Discord)?
- What is the sentiment around this token?
- Are there any scam reports or warnings?
- How old is the project?
- Are there any red flags in their marketing?

FINAL ASSESSMENT:
- Provide an overall RISK SCORE (0-100, where higher = more risky)
- Classify as: LOW RISK, MODERATE RISK, HIGH RISK, or CRITICAL RISK
- List the TOP 3 concerns
- Provide a clear RECOMMENDATION (Safe to invest, Proceed with caution, Avoid)

Use real, verifiable sources. Cite specific URLs where possible. Be thorough but concise.`;
}
