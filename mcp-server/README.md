# AI Crypto Risk MCP Server

**The Security Layer for Agentic Crypto Trading**

Stop your AI agent from trading into scams. This MCP server provides real-time cryptocurrency risk analysis, protecting users and agents from honeypots, rugpulls, and malicious smart contracts.

[![npm version](https://img.shields.io/npm/v/@aicryptorisk/mcp-server.svg)](https://www.npmjs.com/package/@aicryptorisk/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Use This?

- **Prevent Losses**: Detect honeypots, blacklist functions, and rugpull patterns before trading
- **Agent Safety**: Give your AI trading agents a security checkpoint
- **Liability Shield**: Document due diligence for every transaction
- **Multi-Chain**: Ethereum, BSC, Polygon, Arbitrum, Base, Solana

## Quick Start

```bash
npm install -g @aicryptorisk/mcp-server
```

Get your API key at: **https://aicryptorisk.com/api-keys**

### Claude Desktop Configuration

Add to `claude_desktop_config.json`:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aicryptorisk": {
      "command": "npx",
      "args": ["@aicryptorisk/mcp-server"],
      "env": {
        "AICRYPTORISK_API_KEY": "acr_your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. Done.

## Tools Available

### `analyze_crypto_risk`

Instant risk analysis for any token.

```
Input:
  - contract_address: "0x..." (required)
  - chain: "ethereum" | "bsc" | "polygon" | "arbitrum" | "base" | "solana"
  - coin_name: "Token Name" (optional)

Output:
  - Risk score: 0-100 (higher = more dangerous)
  - Verdict: Low Risk / Elevated Risk / High Risk / Critical Risk
  - Red flags: Honeypot, blacklist, hidden owner, high tax, etc.
  - Positive signals: Verified source, renounced ownership, etc.
```

### `request_deep_research`

Comprehensive 4-pillar analysis delivered via email:
1. On-Chain Security
2. Social Media Intelligence
3. Institutional Interest
4. Off-Chain Investigation

### `get_supported_chains`

Returns list of supported blockchain networks.

## Example Prompts

Once configured, just ask Claude:

> "Check if this token is safe: 0xdAC17F958D2ee523a2206206994597C13D831ec7"

> "Analyze the risk of trading PEPE on ethereum"

> "Before I swap, verify this contract: 0x..."

## Pricing

| Plan | Scans/Month | API Calls/Day | Price |
|------|-------------|---------------|-------|
| Free | 1/day | 10 | $0 |
| Monthly | 75 | 50 | $9/mo |
| Yearly | 150 | 100 | $69/yr |
| Lifetime | 200 | 200 | $199 once |

**[Get Your API Key](https://aicryptorisk.com/api-keys)**

## The Safe-Trade Skill

For maximum protection, pair this MCP with our **Safe-Trade Skill** that enforces mandatory risk checks before any transaction:

```yaml
# .claude/skills/safe-trade/SKILL.md
---
name: safe-trade
description: Check crypto risk before any transaction
---
BEFORE any crypto transaction, run analyze_crypto_risk.
If score > 75: REFUSE to proceed.
```

## Security

- API keys are hashed with SHA-256
- Usage tracked per key for billing
- Rate limiting prevents abuse
- No sensitive data stored

## Support

- Documentation: https://aicryptorisk.com/docs
- API Keys: https://aicryptorisk.com/api-keys
- Email: jason@aicryptorisk.com
- GitHub: https://github.com/djangamane/montecrypto

## License

MIT - Use freely in your agents and applications.

---

**Built for the Agentic Economy.** Protect your users. Protect your agents. Trade safe.
