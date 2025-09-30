# AI Crypto Risk Assessment — Implementation Plan

> Legacy filename retained for continuity with previous project docs.

## 0. Brand & Message
- **Site Title:** AI Crypto Risk Assessment
- **Tagline:** *On-chain, off-chain, social, and institutional signals — simplified into one AI-powered risk score.*
- **Promise:** Read risk before you read hype.
- **Tone:** Neutral, evidence-based, no sensational claims. Use "scam" language only inside the closed newsletter.

## 1. One-Page Layout (MVP)
1. **Hero**
   - H1 `AI Crypto Risk Assessment`
   - Subhead: explain the four-analyzer model and the single score output.
   - Primary CTAs: `Run a free risk check` and `Start the free course`.
2. **Risk Meter Module**
   - Radial gauge (0–100) with band labels: Low · Moderate · Elevated · High · Severe.
   - Four analyzer cards (On-Chain, Social Sentiment, Off-Chain, Institutional) with mini bars and summaries.
   - Optional `Show evidence` disclosure that toggles a JSON payload.
3. **Course Teaser**
   - "Best Free Crypto Course in the World" headline with five bullets.
   - Button: `Watch now`.
4. **Weekly Risk Brief**
   - Newsletter hook: "No spam. Evidence-based risk notes." Email capture + submit button.
5. **About**
   - Short founder story focused on credibility.
6. **Footer**
   - Legal links (Terms, Privacy, Disclaimer, Ad Disclosure, Contact) and trust language.

**Ad placements (lightweight):** one responsive in-content unit under the course section, one right-rail/after meter for desktop. Avoid sticky units on mobile.

## 2. Visual System
- **Base Background:** `#F7F5EF`
- **Primary Text:** `#121417`
- **Accent / Action:** `#E5B200`
- **Link & Trust:** `#3E5F5A`
- **Risk Band Colors:**
  - Low `#2E7D32`
  - Moderate `#8BC34A`
  - Elevated `#F9A825`
  - High `#EF6C00`
  - Severe `#C62828`
- **Typography:** Headings set in Bebas Neue (fallback Oswald). Body copy in Inter.
- **Iconography:** Shield with four quadrants (one per analyzer). Favicon uses shield mark.

## 3. API Contract
```
POST /api/scan
{ "input": "0xABC... | BTC | https://site.com" }

Response 200
{
  "score": 76,
  "band": "Moderate",
  "analyzers": {
    "on_chain":      { "score": 82, "summary": "Ownership renounced; top10 holders 41%; LP locked 90d." },
    "social":        { "score": 64, "summary": "Mentions up 140% with mixed sentiment; followers look organic." },
    "off_chain":     { "score": 71, "summary": "Domain 2.1y old; docs present; team semi-doxxed." },
    "institutional": { "score": 55, "summary": "No major fund filings; a few smart wallets hold small positions." }
  },
  "evidence": {
    "optional_detailed_json_per_factor": true
  },
  "disclaimer": "Educational risk analysis. Not financial advice.",
  "cached": true,
  "scan_id": "scr_01Hx..."
}
```
- Scoring uses equal weights (0.25) across analyzers.
- Band mapping: 85–100 Low, 70–84 Moderate, 50–69 Elevated, 30–49 High, 0–29 Severe.
- Cache by normalizing the `input` string and storing `{score, analyzers, evidence, created_at}`.

## 4. Analyzer Definitions (UI keeps one-liners)
- **On-Chain Analysis:** contract powers, ownership, holder concentration, liquidity locks, age, unusual fees or volatility.
- **Social Sentiment:** mention velocity, engagement authenticity, channel diversity, rumor spikes.
- **Off-Chain Analysis:** domain age, docs, founder transparency, exchange listings, repo activity.
- **Institutional Interest:** fund filings, analyst coverage, notable wallets, market-maker presence.

## 5. Core Copy Blocks
- **Hero Subhead:** *On-chain, off-chain, social, and institutional signals — simplified into one AI-powered risk score.*
- **Buttons:** `Run a free risk check`, `Start the free course`.
- **Newsletter:** **Weekly Risk Brief** — "Every Friday: top risk moves, 5 tokens to watch, and one quick lesson. Evidence-based. No hype."
- **About:** cite 2017 teaching history, early BitConnect warning, ETH/XMR mining setup, and present-day AI work. Close with "make risk visible" line.
- **Footer:** "AI Crypto Risk Assessment provides educational risk analysis based on public data. **Not financial advice.**"

## 6. React Interfaces (shared types)
```ts
export type AnalyzerKey = "on_chain" | "social" | "off_chain" | "institutional";
export interface AnalyzerResult { score: number; summary: string; }
export interface ScanResult {
  score: number;
  band: "Low" | "Moderate" | "Elevated" | "High" | "Severe";
  analyzers: Record<AnalyzerKey, AnalyzerResult>;
  evidence?: unknown;
  disclaimer: string;
  cached: boolean;
  scan_id: string;
}
```

## 7. Tailwind Page Shell (reference)
```html
<body class="bg-[#F7F5EF] text-[#121417]">
  <!-- Hero, Meter Module, Course, Newsletter, About, Footer as discussed -->
</body>
```

## 8. Routes & SEO
- Pages: `/`, `/course`, `/newsletter`, `/docs/how-we-score`, `/legal/terms`, `/legal/privacy`, `/disclaimer`.
- Add `title`, `meta description`, `og:image`, `twitter:card`, canonical link.
- JSON-LD: `WebSite` + `Organization` minimal schema.
- Add `ads.txt` and visible **Ad Disclosure** copy.

## 9. Implementation Notes
- Default view: score + four analyzer bars + one-liners; evidence lives behind a disclosure control.
- Keep tone factual; avoid "scam" labels in public UI.
- Rate-limit `/api/scan`; keep API keys server-side.
- Nightly tasks can re-score cached scans (optional for v1).

## 10. Pricing & Checkout Updates
- Premium coaching price: `$500 USD` (card/PayPal) or `$350` for Bitcoin payments.
- Update copy wherever $200 is referenced, including the booking modal and course section.
- Surface legal links (Terms, Privacy, Disclaimer, Ad Disclosure) during checkout.

## 11. Next Steps
1. Update Tailwind theme, fonts, and shared layout to adopt the new palette and typography.
2. Rebuild the hero → meter → course → newsletter flow following the layout spec.
3. Hook `/api/scan` mock/demo response so the UI can render realistic content.
4. Draft legal pages and footer links; add schema.org JSON-LD and `<link rel="canonical">` tags.
5. Refresh assets in `public/` (favicon, og:image) and confirm metadata works in the Vite head.

---
*File updated to trigger deployment.*
