# AI Crypto Risk Platform

The AI Crypto Risk site is a Vite + React frontend deployed on Vercel. It now includes the Scam Likely detector prototype, weekly Scam Watch newsletter delivery, Supabase authentication, and Stripe-powered subscription gating. A sticky header with a lightweight auth bar keeps sign-in/sign-up within easy reach on every page.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Supabase account (for database and auth)
- Stripe account (for subscription payments)
- Google Cloud account (for Gemini API, optional)

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file by copying `.env.example` and fill in the required API keys and environment variables:
    - `NEXT_PUBLIC_SITE_URL`: Public site URL (used for RSS + sitemap).
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
    - `NEXT_PUBLIC_STRIPE_MONTHLY_LINK`: Stripe payment link for the monthly plan.
    - `NEXT_PUBLIC_STRIPE_YEARLY_LINK`: Stripe payment link for the annual plan.
    - `NEXT_PUBLIC_STRIPE_LIFETIME_LINK`: Stripe payment link for the lifetime plan.
    - `GEMINI_API_KEY`: Your Google Cloud Gemini API key (optional).

### Running the Development Server

```bash
npm run dev
```

This starts the Next.js dev server on `http://localhost:3000`.

## Backend Setup

The backend runs entirely inside Next.js route handlers under `app/api` (legacy functions remain in `api/` while we migrate).

### Supabase

1.  Run the SQL statements in `supabase_setup.sql` in your Supabase SQL editor to create the necessary tables (`entitlements`, `subscribers`) and policies.
2.  Enable Row Level Security (RLS) on the tables.

### Stripe Webhooks

1.  Create a webhook endpoint in the Stripe Dashboard pointing to `https://aicryptorisk.com/api/stripe/webhook` (or your preview URL).
2.  Subscribe to the events handled by the app: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`.
3.  Copy the signing secret, then store it in your Vercel project as `STRIPE_WEBHOOK_SECRET`.

## Deployment

The site is configured for deployment on Vercel. Connect your GitHub repository to a new Vercel project. Vercel will automatically build and deploy the site upon pushes to the `main` branch.

## Key Technologies

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js Route Handlers on Vercel (Node.js)
- **Database & Auth**: Supabase
- **Payments**: Stripe
- **AI**: Google Gemini

## Local Development

```bash
npm install
npm run dev
```

Set the following environment variables in a `.env.local` file. Next.js exposes values prefixed with `NEXT_PUBLIC_` to the browser.

```ini
NEXT_PUBLIC_SITE_URL=https://aicryptorisk.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_MONTHLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_YEARLY_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LIFETIME_LINK=https://buy.stripe.com/...
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Scam Watch <alerts@yourdomain.com>
```

## Vercel Environment Variables

Configure these values for the production deployment. Client-side variables should use the `NEXT_PUBLIC_` prefix. Serverless functions require secure values without the prefix.

| Name | Usage |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base URL used by public links, RSS, and sitemap |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for browser auth |
| `NEXT_PUBLIC_STRIPE_MONTHLY_LINK` | Stripe payment link URL for the monthly plan |
| `NEXT_PUBLIC_STRIPE_YEARLY_LINK` | Stripe payment link URL for the annual plan |
| `NEXT_PUBLIC_STRIPE_LIFETIME_LINK` | Stripe payment link URL for the lifetime plan |
| `SUPABASE_URL` | Supabase URL used by server actions and route handlers |
| `SUPABASE_SERVICE_ROLE` | Service role key for server-side writes (never expose client-side) |
| `INGEST_API_KEY` | Bearer key required by the Make ingest and admin publish endpoints |
| `ENABLE_ADMIN_ROUTES` | Set to `true` only in secure environments to expose the `/admin` UI |
| `STRIPE_SECRET_KEY` | Stripe secret key used for API calls from serverless functions |
| `STRIPE_WEBHOOK_SECRET` | Signing secret used to verify incoming Stripe webhooks |
| `STRIPE_SUCCESS_URL` | (Optional) Success URL for Checkout sessions or payment links |
| `STRIPE_CANCEL_URL` | (Optional) Cancel URL for Checkout sessions or payment links |
| `ETHERSCAN_API_KEY` | API key used by the scam analysis endpoint |
| `GEMINI_API_KEY` | Server-side key for Gemini AI proxy |
| `RESEND_API_KEY` | Server-side key for the Resend email API |
| `RESEND_FROM_EMAIL` | Verified sender address used to deliver Scam Watch briefings |

## Supabase Schema

Run the SQL provided in `supabase_setup.sql` (or the snippets shared in the docs) to create:

- `profiles`
- `entitlements`
- `scans`
- `activate_entitlement` helper function

Row level security is enabled so users only see their own data. The service role key is required for the Vercel functions handling Stripe callbacks.

## Stripe Integration

1. Create three Stripe Payment Links or Checkout prices for the $5 monthly, $50 annual, and $150 lifetime plans. Copy each shareable URL into `NEXT_PUBLIC_STRIPE_MONTHLY_LINK`, `NEXT_PUBLIC_STRIPE_YEARLY_LINK`, and `NEXT_PUBLIC_STRIPE_LIFETIME_LINK`.
2. Generate a restricted secret key (or reuse your main secret key) and set it as `STRIPE_SECRET_KEY` in Vercel.
3. Add a webhook endpoint in the Stripe Dashboard pointing to `https://montecrypto.vercel.app/api/stripe/webhook` (or your preview URL). Subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed` events.
4. Copy the webhook signing secret and store it as `STRIPE_WEBHOOK_SECRET`.
5. (Optional) Store `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` if you want to override the URLs configured on your payment links.

When the webhook fires, Stripe events are verified and mapped to Supabase entitlements via the `activate_entitlement` helper.

## Newsletter Workflow

Refer to `docs/newsletter-operations.md` for end-to-end guidance on generating, publishing, and emailing Scam Watch briefings. The short version:

- Admins can generate and publish issues from the Scam Likely section once their email is allowlisted.
- `/api/newsletters/send` delivers the latest published issue through Resend and records `email_sent_at` for auditing.
- Automations (Make/Zapier/Cron) should call the generate → publish → send endpoints with an admin Supabase token to run fully hands-free.

## Blog Content Workflow

- Planning happens in Google Sheets; export the working sheet as CSV when seeding new posts.
- The Gemini-powered blog generator lives in `tools/blog-generator/`. Run `npm run dev:blog-tool` for local tweaks, or `npm run build:blog-tool` to emit the static bundle into `public/tools/blog-generator/`.
- A starter CSV template (`sample_posts.csv`) ships alongside the tool so teammates can duplicate the expected headers without sharing live drafts.
- The Next.js admin surface at `/admin/tools/blog-generator` iframes the built bundle; run `npm run build:blog-tool` before visiting locally so the static assets exist.
- When generating drafts you can copy Markdown, JSON, cURL, or an upsert-ready SQL statement—paste the SQL straight into Supabase if you prefer working in the dashboard.
- POST the payload to Supabase (`posts` table via REST) or paste it into the SQL editor; drafts then appear at `/admin/blog` inside the Next.js admin surface.
- Publishing from `/admin/blog` flips `status` to `published`, stamps `publish_at`, and triggers the live listing on `/blog`, `/blog/[slug]`, RSS, and sitemap.
- Keep the Supabase service-role key and `INGEST_API_KEY` scoped to automation only; they should never ship to the browser.

## Testing the Flow

1. Create a Supabase user via the in-app Auth panel.
2. From the Pricing section, choose a plan and continue to the Stripe checkout page. Complete payment using a test card if you are in test mode.
3. Verify the entitlement row in Supabase changes to `status = active` with `payment_provider = stripe` and the appropriate reference ID.
4. In the Stripe dashboard, trigger test events (invoice paid/failed, subscription canceled) to ensure `/api/stripe/webhook` keeps entitlements in sync.

## Deployment Checklist

- [ ] Supabase tables and policies created.
- [ ] Vercel env vars populated for both client and serverless functions.
- [ ] Stripe payment links and webhook set up for the correct environment (test vs live).
- [ ] `SUPABASE_SERVICE_ROLE` stored in Vercel only.
- [ ] Run `npm run build` locally to confirm the bundle succeeds.
- [ ] Deploy to Vercel and test the full subscription lifecycle end-to-end.
# Deployment Notes

If Vercel stops picking up commits automatically, reconnect the GitHub repo in the project settings or run `npx vercel --prod` to trigger a manual deployment.
