# Risky Kristy Newsletter Plan

## Current State
- A standalone Vite+React app lives at `public/risky-kristy_newsletter`, served as static assets without Supabase or MonteCrypto auth context.
- Landing page captures any email, flips a `localStorage` flag, then exposes the dashboard where visitors can trigger "Generate This Week's Briefing" which calls Gemini directly from the browser.
- Past briefings are hard-coded mock entries; no persistent storage exists for real newsletters.
- Scam Likely subscription copy in `src/components/scam_likely/ScamLikelyGate.jsx` and the repo `README.md` still advertise a `$5/month` plan, and the PayPal client/UI support only a single monthly price.

## Goals
- Bundle the Risky Kristy weekly newsletter with the Scam Likely service at $10/month or $100/year.
- Keep public users focused on archived newsletters and the paid value proposition while reserving AI-powered generation tools for the internal team.
- Ensure pricing, marketing copy, PayPal plans, and Supabase entitlements reflect the new offering.

## Recommended Direction
### 1. Integrate the newsletter experience into the main app
- Move newsletter components into `src/` so we can reuse Supabase auth, Tailwind config, and layout (header/footer) instead of shipping a second Vite build from `public/`.
- Expose two surfaces: a public-facing archive page and an authenticated admin workspace.

### 2. Gate AI generation behind admin access
- Reuse Supabase sessions inside the main app. Include a role/claims check (e.g., `profiles.role === 'admin'`) or a hard-coded allowlist of admin user IDs for now.
- Route non-admin subscribers to the archive page; only admins see the "Generate" controls and Gemini call results.
- Swap the current `localStorage`-based subscribe flow for either:
  - A simple email capture form that posts to our marketing tooling, then links to `/#newsletter`, or
  - A logged-in subscriber view that confirms newsletter access without toggling app state.

### 3. Persist generated briefings
- Create a `newsletters` table in Supabase to store `id`, `created_at`, `title`, `summary`, `threat_level`, `sources`, and `generated_by`.
- When an admin runs a scan, store the canonical payload so the archive surfaces real data in chronological order.
- Add lightweight moderation controls (e.g., mark as draft/published) if we want to curate before exposing publicly.

### 4. Update pricing & value proposition
- Revise Scam Likely marketing copy to emphasize "Scam Detection Toolkit" that now includes the weekly newsletter alert service.
- Update pricing references in:
  - `src/components/scam_likely/ScamLikelyGate.jsx`
  - `README.md`
  - Any marketing components (hero/benefits) mentioning the subscription.
- Adjust the CTA language inside the app to note the bundled newsletter.

### 5. Support monthly & annual PayPal plans
- Create new PayPal billing plans for `$10/month` and `$100/year` (same product) and capture both plan IDs.
- Update environment variable strategy to hold two plan IDs, e.g. `VITE_PAYPAL_MONTHLY_PLAN_ID`, `VITE_PAYPAL_ANNUAL_PLAN_ID` (and server-side equivalents).
- Extend `PayPalSubscriptionButton` to offer plan selection, pass the chosen `plan_id`, and persist the chosen billing cadence in Supabase metadata.
- Confirm the webhook handler doesn’t assume a single plan and continues to map PayPal events to the same `scam_likely` product entitlements.

### 6. Newsletter access for paying customers
- Add a newsletters entry point in the main navigation / benefits section linking subscribers to the archive.
- Protect the archive so only authenticated subscribers (active entitlement) can read full content while public visitors see teasers plus an upgrade prompt.
- Consider republishing condensed excerpts for marketing on the public site while keeping full detail behind the subscription paywall.

## Decisions & Clarifications
- Admin access will be guarded by a hard-coded allowlist of email addresses for the initial rollout (starting with `jason@abitofadvicellc.com`). We can migrate to a roles-based policy in `profiles` later.
- The newsletter archive and individual issues stay fully behind the Scam Likely paywall; public pages will only tease the value proposition.
- Keep the automation entirely in-house: schedule a Make (Integromat) scenario (or similar cron worker) each Friday to trigger our backend Gemini proxy, persist the generated briefing in Supabase, and dispatch emails through Resend. This preserves a single source of truth in Supabase and avoids third-party newsletter platforms.
- Gemini calls for newsletter and scam analysis will be proxied through our backend so API keys remain server-side. Admin UI hits an authenticated API route that performs the generation and persistence steps.

## Next Implementation Steps
1. Move `public/risky-kristy_newsletter` components into `src/components/newsletter/` and hook up routing for `NewsletterArchive` (subscriber view) and `NewsletterAdmin` (allowlisted emails only). ✅
2. Implement Supabase-backed gating: only active Scam Likely entitlements can access the archive, only allowlisted admins see generation controls. ✅
3. Design the `newsletters` Supabase schema (issue metadata + insights array + send status) and persist admin-generated briefings via a new API route that proxies Gemini. ✅
4. Build the Resend integration: backend endpoint that sends latest briefing to all entitled users, plus Make scenario scaffolding for automatic Friday runs. ✅ (API + admin controls landed; automation hook pending.)
5. Update pricing and marketing copy site-wide to reflect $10/mo or $100/yr, add the annual PayPal plan, and allow plan selection during checkout. ✅
6. Refresh docs (`README.md`, env var examples) with new plan IDs, Resend key guidance, and newsletter workflow instructions. ✅
7. Run end-to-end validation: admin generation → Supabase storage → Resend email → subscriber archive view → PayPal monthly & annual subscription flows. (Use `docs/e2e-validation-checklist.md`.)

## Progress Log
- ✅ Newsletter UI migrated into the main app with archive/admin views and shared components.
- ✅ Newsletter access now respects Supabase entitlements and a shared admin allowlist, with live Supabase fetching for published issues.
- ✅ Added `newsletters` table + RLS policies, `POST /api/newsletters/generate` Gemini proxy, and `POST /api/newsletters` persistence endpoint. Admin UI now calls these routes for generation and publishing.
- ✅ Resend integration available via `/api/newsletters/send`; admin panel now tracks the latest published briefing and lets you email subscribers. Supabase function `newsletter_recipient_emails` powers the recipient list.
- ✅ Pricing, marketing copy, and PayPal subscription flow now reflect the $10/month or $100/year Scam Watch membership with in-app plan selection.
- ✅ Added newsletter operations documentation and Resend environment guidance in `README.md` and `docs/newsletter-operations.md`.
- ✅ Admin access consolidated via floating modal; allowlist expanded for active team members and the archive references the single sign-in flow.
- ✅ Gemini briefings normalized so missing `title`, `summary`, or `howToAvoid` fields no longer block publishing.
- 🚧 Next: Run the production end-to-end validation (Step 7) and capture results.
