# Risky Kristy Newsletter — Build Log Part 2

## Recent Changes
- Updated site and Supabase configs to use `jason@aicryptorisk.com` as the verified sender address.
- Committed email updates locally (`Update Jason contact email`).
- Confirmed Resend delivery works with the new domain.
- Cloned `dzhng/deep-research` into `tools/deep-research` for local Node worker integration.
- `/api/newsletters/generate` rolls back to the Gemini-only workflow: Google search-powered summary with manual fallback (no deep research augmentation).
- Removed the DeepResearch augmentation pipeline; the admin view will only show Gemini insights and sources.

## Deep-Research Integration Plan (dzhng/deep-research)
1. **Repo Review** — Audit the TypeScript implementation to identify entry points (`src/index.ts`, report generator) and confirm dependency list (Firecrawl + OpenAI/Fireworks keys).
2. **Goal Alignment** — Frame the research prompt template around *"Identify crypto tokens flagged as scams with user loss reports"*; ensure the agent gathers source quotes with lost-funds evidence.
3. **Hosting Choice** — Decide between a managed call (invoke the CLI via Node worker) vs. containerized service using the provided Dockerfile. Account for Firecrawl rate limits and concurrency env var.
4. **Service Wrapper** — Design a `scamResearchService` that:
   - Accepts topics (e.g., "rug pulls March 2025"), breadth/depth params, and optional seed sources.
   - Invokes the deep-research run (child_process spawn or API once we expose one).
   - Parses the generated markdown into structured sections (coin, allegation, source URL, quote, timestamp, confidence).
5. **Data Flow** — Propose Supabase tables (`research_runs`, `scam_findings`) to store:
   - Raw markdown output + execution metadata (prompt, breadth/depth, duration).
   - Extracted findings with normalized token name, chain, loss description, source link, evidence snippet.
6. **Newsletter UX** — Extend the editor to surface suggested scam coins:
   - Admin view lists recent research runs, allows cherry-picking findings into the draft.
   - Provide citations (auto footnotes) that link back to original posts/articles.
7. **Automation Safeguards** — Define guardrails: sandbox the process, cap concurrent runs, retry logic for Firecrawl 429s, optional manual review flag if sources lack proof of losses.
8. **Validation Loop** — Pilot on known scams, compare captured evidence vs. manual research, tune breadth/depth defaults and prompt instructions for loss-report emphasis.

### Node Worker Notes
- Working copy lives under `tools/deep-research`; keep repo unmodified or track local patches separately to ease upstream pulls.
- Node version requirement: 22.x. Plan to manage via nvm or project-specific `.nvmrc` (repo already ships one).
- Required env vars: `FIRECRAWL_KEY`, optional `FIRECRAWL_BASE_URL`, `OPENAI_KEY` (or `OPENAI_ENDPOINT` + `CUSTOM_MODEL`), optional `FIREWORKS_KEY` for DeepSeek R1.
- Local setup: copy `tools/deep-research/.env.example` → `.env.local` before running scripts; secrets stay gitignored.
- Worker invocation strategy: spawn `npm start` (interactive) replaced with scripted runner that feeds query/breadth/depth, or import `deepResearch` directly via custom wrapper for non-interactive jobs.
- Output parsing: default markdown saved to `report.md`; we will pipe results to our Supabase persistence layer instead of relying on filesystem side effects.
- Added `scripts/run-deep-research.ts` to wrap the agent non-interactively. Run with `npx tsx scripts/run-deep-research.ts --query "<topic>" [--breadth N --depth N --mode report|answer --output path.md --verbose true]` once env vars are configured.
- Deep research metadata is rendered inside the admin preview & archive (coverage window, generated timestamp, findings, and raw URLs).

## Open Questions
- Which deployment path aligns with current infrastructure budget and team capacity?
- Do we need to store scrape artifacts (PDFs, web captures) or just citations + summaries?
- How will we handle rate limits / throttling across Serper, Jina, and Dashscope APIs?

## Next Actions
1. Document hosting approach (Node worker vs. container) and estimate Firecrawl/OpenAI cost envelope.
2. Draft Supabase ERD updates for `research_runs` + `scam_findings` tables.
3. Add Supabase persistence for deep-research runs (current metadata lives in the newsletter record only); consider dedicated tables if we need historical re-use.
