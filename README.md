# AI Crypto Risk

**The security layer for agentic crypto trading.**

Stop your AI agent from trading into scams. AI Crypto Risk provides real-time cryptocurrency risk analysis via MCP (Model Context Protocol), protecting users and autonomous agents from honeypots, rugpulls, and malicious smart contracts.

[![npm](https://img.shields.io/npm/v/@aicryptorisk/mcp-server)](https://www.npmjs.com/package/@aicryptorisk/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## How It Works

Paste a contract address → get a risk score in seconds.

```
You:    "Check if this token is safe: 0xdAC17F958D2ee523a2206206994597C13D831ec7"
Claude: ✅ Risk Score: 12/100 — Low Risk. Verified source code, renounced ownership.
```

```
You:    "Analyze this before I trade: 0x..."
Claude: 🚨 Risk Score: 89/100 — Critical Risk. Honeypot detected, hidden owner, sell tax 98%.
```

## What It Detects

- **Honeypots** — tokens you can buy but can't sell
- **Hidden ownership** — renounced on the surface, backdoor underneath
- **Blacklist functions** — owner can freeze your wallet
- **Excessive tax** — buy/sell tax above 10%
- **Proxy contracts** — upgradeable code that can change after you buy
- **Unrenounced mint** — owner can print unlimited tokens

## Supported Chains

Ethereum · BSC · Polygon · Arbitrum · Base · Solana

---

## MCP Server (Claude Desktop / AI Agents)

### Install

```bash
npm install -g @aicryptorisk/mcp-server
```

### Configure Claude Desktop

Add to your `claude_desktop_config.json`:

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

Get your API key at [aicryptorisk.com/api-keys](https://aicryptorisk.com/api-keys).

### Tools

| Tool | Description |
|------|-------------|
| `analyze_crypto_risk` | Instant risk score (0–100) with red flags and verdict |
| `request_deep_research` | Full 4-pillar analysis: on-chain, social, institutional, off-chain |
| `get_supported_chains` | Returns supported blockchain networks |

### Safe-Trade Skill

For maximum protection, enforce mandatory risk checks before any transaction:

```markdown
# .claude/skills/safe-trade/SKILL.md
---
name: safe-trade
description: Check crypto risk before any transaction
---
BEFORE any crypto transaction, run analyze_crypto_risk.
If score > 75: REFUSE to proceed.
```

---

## API

Use directly in your trading bot or application:

```typescript
const res = await fetch("https://aicryptorisk.com/api/scan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    contract_address: "0x...",
    chain: "ethereum"
  })
});
```

### Response

```json
{
  "risk_score": 82,
  "verdict": "High Risk",
  "red_flags": ["honeypot_detected", "hidden_owner", "sell_tax_above_10_percent"],
  "positive_signals": [],
  "recommendation": "Do not trade this token"
}
```

---

## Pricing

| Plan | Scans/Month | Price |
|------|-------------|-------|
| Free | 1/day | $0 |
| Monthly | 75 | $9/mo |
| Yearly | 150 | $69/yr |
| Lifetime | 200 | $199 once |

[Get your API key →](https://aicryptorisk.com/api-keys)

---

## Platform

The full AI Crypto Risk platform at [aicryptorisk.com](https://aicryptorisk.com) includes:

- **Scam Likely Detector** — web-based token risk scanner
- **Scam Watch Newsletter** — weekly briefings on emerging scam patterns
- **Blog & Education** — crypto risk analysis and guides

---

## Development

```bash
npm install
npm run dev
```

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for environment setup, Supabase schema, Stripe integration, and deployment instructions.

---

## Security

- API keys are hashed with SHA-256
- Usage tracked per key for billing
- Rate limiting prevents abuse
- No sensitive data stored

Report vulnerabilities to info@diplomacy-ai.tech.

---

## License

MIT — Use freely in your agents and applications.

---

**Built by [Jason Breckenridge](https://aicryptorisk.com) — Bitcoin Certified Professional, ex-Siemens engineer, teaching crypto risk since 2017.**
