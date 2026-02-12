# Development Guide

Internal setup documentation for the AI Crypto Risk platform.

## Prerequisites

- Node.js (v18+)
- npm
- Supabase account (database and auth)
- Stripe account (subscription payments)
- Google Cloud account (Gemini API, optional)

## Installation

```bash
git clone https://github.com/djangamane/montecrypto.git
cd montecrypto
npm install
cp .env.example .env.local
```

## Environment Variables

### Client-Side (NEXT_PUBLIC_ prefix)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Base URL for RSS, sitemap, public links |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_STRIPE_MONTHLY_LINK` | Stripe payment link — monthly plan |
| `NEXT_PUBLIC_STRIPE_YEARLY_LINK` | Stripe payment link — annual plan |
| `NEXT_PUBLIC_STRIPE_LIFETIME_LINK` | Stripe payment link — lifetime plan |

### Server-Side (Vercel only, never expose to browser)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase URL for route handlers |
| `SUPABASE_SERVICE_ROLE` | Service role key for server-side writes |
| `STRIPE_SECRET_KEY` | Stripe secret for serverless functions |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for Stripe webhook verification |
| `STRIPE_SUCCESS_URL` | (Optional) Checkout success redirect |
| `STRIPE_CANCEL_URL` | (Optional) Checkout cancel redirect |
| `ETHERSCAN_API_KEY` | API key for scam analysis endpoint |
| `GEMINI_API_KEY` | Server-side Gemini AI key |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_FROM_EMAIL` | Verified sender for Scam Watch briefings |

## Running Locally

```bash
npm run dev
```

Starts the Next.js dev server on http://localhost:3000.

## Supabase Schema

Run `supabase_setup.sql` in the Supabase SQL editor to create:

- `profiles`
- `entitlements`
- `scans`
- `activate_entitlement` helper function

Row Level Security is enabled — users only see their own data. The service role key is required for Vercel functions handling Stripe callbacks.

## Stripe Integration

1. Create three Stripe Payment Links for $5/mo, $50/yr, and $150 lifetime plans.
2. Copy URLs into the corresponding `NEXT_PUBLIC_STRIPE_*` env vars.
3. Set `STRIPE_SECRET_KEY` in Vercel.
4. Add a webhook endpoint: `https://montecrypto.vercel.app/api/stripe/webhook`
5. Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
6. Store the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Newsletter Workflow

```bash
# Generate a draft
node scripts/admin-cli.mjs newsletter generate

# Publish
node scripts/admin-cli.mjs newsletter publish ./briefing.json

# Send
node scripts/admin-cli.mjs newsletter send [newsletterId]
```

See `docs/newsletter-operations.md` for full details.

## Blog Content Workflow

1. Blog generator lives in `tools/blog-generator/`
2. Run `npm run dev:blog-tool` for local development
3. Run `npm run build:blog-tool` to emit static bundle to `public/tools/blog-generator/`
4. Ingest drafts: `node scripts/admin-cli.mjs blog ingest ./draft.json`
5. Publish: `node scripts/admin-cli.mjs blog publish <post-id>`

## Testing the Flow

1. Create a Supabase user via the Auth panel.
2. Choose a plan from the Pricing section and complete Stripe checkout (test card in test mode).
3. Verify the `entitlements` row shows `status = active`.
4. Trigger test Stripe events to confirm webhook keeps entitlements in sync.

## Deployment

Configured for Vercel. Connect your GitHub repo to a Vercel project. Pushes to `main` trigger automatic deployments.

### Checklist

- [ ] Supabase tables and policies created
- [ ] Vercel env vars populated
- [ ] Stripe payment links and webhook configured
- [ ] `SUPABASE_SERVICE_ROLE` stored in Vercel only
- [ ] `npm run build` succeeds locally
- [ ] Full subscription lifecycle tested end-to-end

If Vercel stops picking up commits, reconnect the GitHub repo in project settings or run `npx vercel --prod`.
