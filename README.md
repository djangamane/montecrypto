# MonteCrypto Platform

The MonteCrypto site is a Vite + React frontend deployed on Vercel. It now includes the Scam Likely detector prototype, weekly Scam Watch newsletter delivery, Supabase authentication, and PayPal subscription gating.

## Local Development

```bash
npm install
npm run dev
```

Set the following environment variables in a `.env.local` file (Vite reads variables prefixed with `VITE_`).

```ini
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_or_live_client_id
VITE_PAYPAL_MONTHLY_PLAN_ID=your_paypal_10usd_monthly_plan_id
VITE_PAYPAL_ANNUAL_PLAN_ID=your_paypal_100usd_annual_plan_id
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Scam Watch <alerts@yourdomain.com>
```

## Vercel Environment Variables

Configure these values for the production deployment. Client-side variables should use the same `VITE_` prefix. Serverless functions require secure values without the prefix.

| Name | Usage |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL for browser clients |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for browser auth |
| `VITE_PAYPAL_CLIENT_ID` | PayPal REST client ID exposed to the browser |
| `VITE_PAYPAL_MONTHLY_PLAN_ID` | PayPal monthly subscription plan ID |
| `VITE_PAYPAL_ANNUAL_PLAN_ID` | PayPal annual subscription plan ID |
| `SUPABASE_URL` | Supabase URL used by serverless functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for entitlement updates (never expose client-side) |
| `PAYPAL_API_BASE` | `https://api-m.paypal.com` for live, `https://api-m.sandbox.paypal.com` for sandbox |
| `PAYPAL_CLIENT_ID` | PayPal REST client ID for server-side API calls |
| `PAYPAL_CLIENT_SECRET` | PayPal REST client secret |
| `PAYPAL_MONTHLY_PLAN_ID` | Same monthly plan ID used by the client button |
| `PAYPAL_ANNUAL_PLAN_ID` | Same annual plan ID used by the client button |
| `PAYPAL_WEBHOOK_ID` | ID returned when you register the webhook in the PayPal dashboard |
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

Row level security is enabled so users only see their own data. The service role key is required for the Vercel functions handling PayPal callbacks.

## PayPal Integration

1. Create a PayPal REST app (sandbox and live) and capture the client/secret.
2. Create a product and both plans: $10/month and $100/year. Record each `plan_id` (e.g. `P-XXXXXXXX`).
3. Register the webhook at `https://montecrypto.vercel.app/api/paypal/webhook` (or your preview URL) for subscription events and copy the `webhook_id`.
4. Deploy to Vercel so the `/api/paypal/subscription` and `/api/paypal/webhook` functions can validate purchases and update Supabase entitlements.

## Newsletter Workflow

Refer to `docs/newsletter-operations.md` for end-to-end guidance on generating, publishing, and emailing Scam Watch briefings. The short version:

- Admins can generate and publish issues from the Scam Likely section once their email is allowlisted.
- `/api/newsletters/send` delivers the latest published issue through Resend and records `email_sent_at` for auditing.
- Automations (Make/Zapier/Cron) should call the generate → publish → send endpoints with an admin Supabase token to run fully hands-free.

## Testing the Flow

1. Create a Supabase user via the in-app Auth panel.
2. Subscribe through the PayPal button (sandbox or live). On approval, the app calls `/api/paypal/subscription` to validate the subscription and mark the entitlement as active.
3. Verify the entitlement row in Supabase changes to `status = active`.
4. Trigger webhook events from the PayPal dashboard (or cancel the subscription) to ensure `/api/paypal/webhook` revokes access when payments stop.

## Deployment Checklist

- [ ] Supabase tables and policies created.
- [ ] Vercel env vars populated for both client and serverless functions.
- [ ] PayPal plan and webhook set up for the correct environment (sandbox vs live).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` stored in Vercel only.
- [ ] Run `npm run build` locally to confirm the bundle succeeds.
- [ ] Deploy to Vercel and test the full subscription lifecycle end-to-end.
