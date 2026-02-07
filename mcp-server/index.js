#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

// Configuration from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.AICRYPTORISK_API_KEY;
const API_BASE_URL = process.env.API_BASE_URL || "https://aicryptorisk.com";

// Initialize Supabase client for auth and usage tracking
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Supported chains
const SUPPORTED_CHAINS = {
  ethereum: "1",
  bsc: "56",
  polygon: "137",
  arbitrum: "42161",
  base: "8453",
  solana: "solana",
};

/**
 * Validate API key and check usage limits
 */
async function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: "API key required. Get one at https://aicryptorisk.com/api-keys" };
  }

  if (!supabase) {
    // Local development mode - accept any key
    console.error("[MCP] Warning: Supabase not configured, skipping auth");
    return { valid: true, userId: "dev-mode", tier: "unlimited" };
  }

  try {
    // Check API key in database
    const { data: keyData, error } = await supabase
      .from("api_keys")
      .select("id, user_id, tier, calls_today, daily_limit, is_active")
      .eq("key_hash", hashApiKey(apiKey))
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
  } catch (err) {
    console.error("[MCP] Auth error:", err.message);
    return { valid: false, error: "Authentication service unavailable" };
  }
}

/**
 * Hash API key for secure storage lookup
 */
function hashApiKey(key) {
  // Simple hash for lookup - in production use crypto.subtle
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Track API usage for billing
 */
async function trackUsage(keyId, tool, success) {
  if (!supabase || !keyId) return;

  try {
    // Increment daily counter
    await supabase.rpc("increment_api_calls", { key_id: keyId });

    // Log detailed usage
    await supabase.from("api_usage_log").insert({
      api_key_id: keyId,
      tool_name: tool,
      success,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[MCP] Usage tracking error:", err.message);
  }
}

/**
 * Analyze a crypto token for risk indicators
 */
async function analyzeToken(contractAddress, chain, coinName) {
  const chainId = SUPPORTED_CHAINS[chain.toLowerCase()] || chain;

  try {
    // Call our API endpoint
    const response = await fetch(`${API_BASE_URL}/api/scam-likely/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contractAddress,
        chain: chainId,
        coinName: coinName || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (err) {
    throw new Error(`Failed to analyze token: ${err.message}`);
  }
}

/**
 * Request deep research on a token (async, results sent via email)
 */
async function requestDeepResearch(contractAddress, chain, coinName, symbol, email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scam-likely/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contractAddress,
        chain,
        coinName,
        symbol,
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Research API error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (err) {
    throw new Error(`Failed to request research: ${err.message}`);
  }
}

// Create MCP server
const server = new Server(
  {
    name: "aicryptorisk",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_crypto_risk",
        description: `Analyze a cryptocurrency token for scam indicators and risk factors.

Returns a comprehensive risk analysis including:
- Overall risk score (0-100, higher = more risky)
- Risk level (Low/Medium/High/Critical)
- On-chain risk indicators (honeypot, ownership, liquidity)
- Specific red flags and warnings
- Actionable recommendations

Supports Ethereum, BSC, Polygon, Arbitrum, Base, and Solana.`,
        inputSchema: {
          type: "object",
          properties: {
            contract_address: {
              type: "string",
              description: "The token contract address to analyze",
            },
            chain: {
              type: "string",
              enum: ["ethereum", "bsc", "polygon", "arbitrum", "base", "solana"],
              description: "The blockchain network (default: ethereum)",
            },
            coin_name: {
              type: "string",
              description: "Optional: Name of the coin for better context",
            },
          },
          required: ["contract_address"],
        },
      },
      {
        name: "request_deep_research",
        description: `Request comprehensive 4-pillar research on a cryptocurrency token.

This triggers an in-depth analysis covering:
1. On-Chain Analysis - Contract security, liquidity, holder distribution
2. Social Media Intelligence - Community sentiment, influencer activity
3. Institutional Interest - VC backing, exchange listings, partnerships
4. Off-Chain Intelligence - Team background, legal status, news

Results are delivered via email within 5-10 minutes.`,
        inputSchema: {
          type: "object",
          properties: {
            contract_address: {
              type: "string",
              description: "The token contract address to research",
            },
            chain: {
              type: "string",
              enum: ["ethereum", "bsc", "polygon", "arbitrum", "base", "solana"],
              description: "The blockchain network",
            },
            coin_name: {
              type: "string",
              description: "Name of the coin",
            },
            symbol: {
              type: "string",
              description: "Token symbol (e.g., ETH, BTC)",
            },
            email: {
              type: "string",
              description: "Email address to receive the research report",
            },
          },
          required: ["contract_address", "chain", "coin_name", "email"],
        },
      },
      {
        name: "get_supported_chains",
        description: "Get list of supported blockchain networks for token analysis",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Validate API key
  const auth = await validateApiKey(API_KEY);
  if (!auth.valid) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: auth.error }, null, 2),
        },
      ],
      isError: true,
    };
  }

  try {
    let result;

    switch (name) {
      case "analyze_crypto_risk": {
        const { contract_address, chain = "ethereum", coin_name } = args;

        if (!contract_address) {
          throw new Error("contract_address is required");
        }

        result = await analyzeToken(contract_address, chain, coin_name);
        await trackUsage(auth.keyId, "analyze_crypto_risk", true);
        break;
      }

      case "request_deep_research": {
        const { contract_address, chain, coin_name, symbol, email } = args;

        if (!contract_address || !chain || !coin_name || !email) {
          throw new Error("contract_address, chain, coin_name, and email are required");
        }

        result = await requestDeepResearch(contract_address, chain, coin_name, symbol, email);
        await trackUsage(auth.keyId, "request_deep_research", true);
        break;
      }

      case "get_supported_chains": {
        result = {
          chains: Object.keys(SUPPORTED_CHAINS),
          details: {
            ethereum: { chainId: "1", name: "Ethereum Mainnet" },
            bsc: { chainId: "56", name: "BNB Smart Chain" },
            polygon: { chainId: "137", name: "Polygon" },
            arbitrum: { chainId: "42161", name: "Arbitrum One" },
            base: { chainId: "8453", name: "Base" },
            solana: { chainId: "solana", name: "Solana" },
          },
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    await trackUsage(auth.keyId, name, false);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] AI Crypto Risk server running");
}

main().catch((error) => {
  console.error("[MCP] Fatal error:", error);
  process.exit(1);
});
