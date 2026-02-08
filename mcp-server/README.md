# AI Crypto Risk MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with cryptocurrency risk analysis capabilities.

## Features

- **Token Risk Analysis**: Analyze any crypto token for scam indicators
- **Deep Research**: Request comprehensive 4-pillar research reports
- **Multi-Chain Support**: Ethereum, BSC, Polygon, Arbitrum, Base, Solana
- **Usage Metering**: Built-in API key authentication and usage tracking

## Installation

```bash
# From npm (when published)
npm install -g @aicryptorisk/mcp-server

# Or from source
cd mcp-server
npm install
```

## Configuration

### For Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "aicryptorisk": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "AICRYPTORISK_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### For Claude Code

Add to your project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "aicryptorisk": {
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "AICRYPTORISK_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### `analyze_crypto_risk`

Analyze a token for scam indicators and risk factors.

**Input:**
- `contract_address` (required): Token contract address
- `chain` (optional): Blockchain network (default: ethereum)
- `coin_name` (optional): Name for better context

**Returns:**
- Risk score (0-100)
- Risk level (Low/Medium/High/Critical)
- Red flags and warnings
- Recommendations

### `request_deep_research`

Request comprehensive 4-pillar analysis (delivered via email).

**Input:**
- `contract_address` (required): Token contract address
- `chain` (required): Blockchain network
- `coin_name` (required): Token name
- `symbol` (optional): Token symbol
- `email` (required): Email for report delivery

### `get_supported_chains`

Get list of supported blockchain networks.

## Pricing Tiers

| Tier | Daily Limit | Price |
|------|-------------|-------|
| Free | 10 scans | $0 |
| Pro | 100 scans | $19/mo |
| Enterprise | Unlimited | Contact us |

Get your API key at: https://aicryptorisk.com/api-keys

## Example Usage

Once configured, you can ask Claude:

> "Analyze this token for scam risk: 0x1234...abcd on ethereum"

> "Research this new memecoin PEPE2 at 0xabc... on BSC and send the report to my@email.com"

## Development

```bash
# Install dependencies
npm install

# Run locally (dev mode, no auth required)
npm start

# With auth (production)
SUPABASE_URL=your-url \
SUPABASE_SERVICE_ROLE_KEY=your-key \
AICRYPTORISK_API_KEY=test-key \
npm start
```

## Database Setup

Run `schema.sql` in your Supabase SQL editor to create the required tables for API key management and usage tracking.

## License

MIT
