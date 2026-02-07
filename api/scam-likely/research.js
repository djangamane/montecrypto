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

    // Log the request (non-blocking, table may not exist yet)
    supabase.from("research_requests").insert({
      user_id: user.id,
      contract_address: contractAddress.trim(),
      coin_name: coinName.trim(),
      coin_symbol: coinSymbol?.trim() || null,
      chain: chainName,
      status: "pending",
    }).then(({ error }) => {
      if (error) {
        console.log("Research request logging skipped:", error.message);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Research request submitted. Check your email in 5-10 minutes.",
    });

  } catch (error) {
    console.error("Research request failed:", error);
    return res.status(500).json({
      error: error.message || "Failed to submit research request",
    });
  }
}

function buildResearchPrompt({ contractAddress, coinName, coinSymbol, chain }) {
  return `You are an expert cryptocurrency security analyst performing deep due diligence. Investigate this token thoroughly:

═══════════════════════════════════════════════════════════
TOKEN UNDER INVESTIGATION
═══════════════════════════════════════════════════════════
Name: ${coinName}
Symbol: ${coinSymbol}
Contract: ${contractAddress}
Chain: ${chain}

Analyze this token across these FOUR critical risk dimensions. Search for real, current information from reliable sources.

═══════════════════════════════════════════════════════════
1. ON-CHAIN ANALYSIS
═══════════════════════════════════════════════════════════
Investigate the smart contract and blockchain data:

• Contract Verification: Is the source code verified on block explorer? Is it open source?
• Honeypot Detection: Can holders actually sell? Any transfer restrictions?
• Token Functions: Does it have mint(), pause(), blacklist(), or selfdestruct() functions?
• Tax Structure: What are the buy/sell taxes? Can they be modified by owner?
• Ownership Status: Is ownership renounced? Or can owner still control the contract?
• Liquidity Analysis: How much liquidity exists? Is it locked? Lock duration?
• Holder Distribution: Top 10 holder concentration? Any wallets holding >5%?
• Trading History: Volume patterns, suspicious wash trading, coordinated dumps?

═══════════════════════════════════════════════════════════
2. SOCIAL MEDIA MONITOR
═══════════════════════════════════════════════════════════
Analyze social presence and community signals:

• Twitter/X Activity: Follower count, engagement rate, account age, verified?
• Telegram/Discord: Member count, activity level, bot vs real users?
• Sentiment Analysis: What is the community saying? Positive, negative, or artificial hype?
• Influencer Promotion: Is it being shilled by paid promoters? Coordinated campaigns?
• Red Flags: Fake followers, deleted negative comments, echo chamber behavior?
• Community Age: How long has the community existed? Organic growth or sudden spike?
• Developer Communication: Are devs active and transparent? Do they answer questions?

═══════════════════════════════════════════════════════════
3. INSTITUTIONAL INTEREST & SMART MONEY SIGNALS
═══════════════════════════════════════════════════════════
Look for signs of legitimate institutional backing:

• VC/Fund Investment: Any known venture capital or crypto fund backing?
• Whale Wallet Activity: Are known smart money wallets holding or accumulating?
• Exchange Listings: Listed on reputable CEXs (Binance, Coinbase, Kraken)?
• Market Makers: Any legitimate market makers providing liquidity?
• Partnerships: Real partnerships with established companies? Or fake announcements?
• Treasury/Backing: Any real assets backing the token? Proof of reserves?
• Institutional Custody: Available on institutional platforms?

If there is NO institutional interest, this is a significant warning sign for retail investors.

═══════════════════════════════════════════════════════════
4. OFF-CHAIN INTELLIGENCE
═══════════════════════════════════════════════════════════
Research external data sources and real-world factors:

• Security Audits: Has it been audited? By whom (CertiK, Hacken, Trail of Bits)? Audit findings?
• Team Identity: Is the team doxxed (publicly known)? LinkedIn profiles? Track record?
• Legal Entity: Is there a registered company behind it? Jurisdiction?
• Regulatory Status: Any SEC, CFTC, or international regulatory warnings?
• Scam Reports: Listed on ScamAdviser, CryptoScamDB, or similar databases?
• News Coverage: Any negative press? Hack reports? Lawsuit mentions?
• Historical Incidents: Has this team launched failed/scam projects before?
• Website Quality: Professional site or hastily made? Domain age? Contact info?

═══════════════════════════════════════════════════════════
RISK ASSESSMENT SUMMARY
═══════════════════════════════════════════════════════════

Based on your research, provide:

1. RISK SCORE: 0-100 (0 = Very Safe, 100 = Definite Scam)

2. RISK LEVEL:
   • LOW RISK (0-25): Legitimate project with strong fundamentals
   • MODERATE RISK (26-50): Some concerns but potentially viable
   • HIGH RISK (51-75): Significant red flags, extreme caution advised
   • CRITICAL RISK (76-100): Likely scam, do not invest

3. TOP 5 FINDINGS: List the most important discoveries (good or bad)

4. RED FLAGS: List all warning signs discovered

5. GREEN FLAGS: List all positive indicators discovered

6. VERDICT: One of:
   • ✅ SAFE TO INVEST - Strong fundamentals, institutional backing, clean history
   • ⚠️ PROCEED WITH CAUTION - Mixed signals, do additional research
   • 🚫 AVOID - Too many red flags, high probability of loss
   • ☠️ CONFIRMED SCAM - Evidence of fraud, rug pull, or malicious intent

7. SOURCES: List all URLs you referenced in your research

Be thorough, factual, and cite specific sources. If you cannot find information on a topic, explicitly state that the lack of information is itself a risk factor.`;
}
