# AI Crypto Risk Framework

## 4-Pillar Analysis Model

### Pillar 1: Contract Security
- Honeypot detection
- Self-destruct functions
- External call vulnerabilities
- Blacklist/whitelist functions
- Hidden ownership
- Proxy contract risks

### Pillar 2: Trading Mechanics
- Buy/sell tax rates (>10% = red flag)
- Slippage manipulation
- Transfer pausability
- Anti-whale restrictions
- Trading cooldowns

### Pillar 3: Ownership & Supply
- Owner holdings percentage
- Creator holdings percentage
- Mintable supply
- Ownership renouncement status
- Balance manipulation capabilities

### Pillar 4: Liquidity & Distribution
- Holder count
- Liquidity provider count
- DEX listing status
- LP lock status

## Risk Scoring

### Critical Flags (25 points each)
- Honeypot detected
- Creator made previous honeypots
- Blacklist function exists
- Whitelist restriction active
- Self-destruct function
- External call vulnerability

### High Risk Flags (15 points each)
- Cannot sell all tokens
- Buying disabled
- Trading cooldown enforced
- Transfers pausable
- Anti-whale modifiable
- Hidden owner
- Tax rate >10%

### Moderate Risk Flags (8 points each)
- Modifiable slippage
- Mintable supply
- Recoverable ownership
- Balance manipulation possible
- Owner holdings >10%
- Creator holdings >10%
- Tax rate 5-10%

## Positive Signals

- Verified/open source contract
- Not a proxy contract
- Not detected as honeypot
- Listed on DEX
- Verified token standard
- No airdrop scam patterns
- High holder count (>1000)
- Multiple liquidity providers
- Zero trading tax
- Ownership renounced

## Supported Chains

| Chain | Chain ID |
|-------|----------|
| Ethereum | 1 |
| BNB Smart Chain | 56 |
| Polygon | 137 |
| Arbitrum One | 42161 |
| Base | 8453 |
| Solana | solana |
