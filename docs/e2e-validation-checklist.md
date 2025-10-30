# AI Crypto Risk Membership E2E Validation Checklist

Use this script whenever you need to smoke-test the Scam Watch membership in production (Vercel) or staging.

## 1. Admin workflow (local CLI)
1. Run `node scripts/admin-cli.mjs newsletter generate > briefing.json`.
   - Confirm the JSON file contains three insights and credible sources.
2. Publish the draft with `node scripts/admin-cli.mjs newsletter publish briefing.json`.
   - Verify the briefing appears in Supabase `newsletters` with `status = published` and `email_sent_at` still empty.
3. Trigger `node scripts/admin-cli.mjs newsletter send`.
   - Confirm the script reports the recipient count and Supabase updates `email_sent_at`.
   - Spot-check delivery via Resend activity log or a real mailbox.

## 2. Subscriber experience (monthly plan)
1. Sign out, visit the live site, and create a new Supabase user via the Auth panel.
2. Choose the $5/month Stripe option and continue to checkout.
   - After completing payment, you should be redirected back and Scam Likely + Scam Watch should unlock automatically.
3. Verify Supabase `entitlements` shows `status = active`, `product = scam_likely`, and `payment_provider = stripe` with the subscription ID as `payment_reference`.
4. Open Scam Watch archive; ensure the latest briefing content is visible.

## 3. Subscriber experience (annual plan)
1. Repeat the flow with another test account using the $50/year Stripe option.
2. Confirm the entitlement metadata stores the new subscription ID and remains active after webhook callbacks.

## 4. Newsletter delivery (non-admin subscriber)
1. Stay signed in as the annual-plan user and confirm Scam Watch archive loads.
2. Trigger the CLI workflow again and confirm the non-admin subscriber receives the emailed briefing without access errors.

## 5. Stripe + Webhook regression checks
- Cancel a Stripe subscription from the dashboard; send a test webhook (or wait for the real event) to ensure entitlements flip to `revoked`.
- Resume/reactivate the subscription and verify status returns to `active` with the new period end synced.

## 6. Resend + automation sanity
- In Resend, verify the message history and delivery metrics match expectations.
- If using Make/Zapier, run the job that wraps the CLI (or equivalent RPC calls) in test mode to ensure all commands exit successfully.

Document results and any anomalies directly in `docs/risky-kristy-newsletter-plan.md` under Step 7.
