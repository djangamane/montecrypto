# MonteCrypto Membership E2E Validation Checklist

Use this script whenever you need to smoke-test the Scam Watch membership in production (Vercel) or staging.

## 1. Admin workflow
1. Sign in with an allowlisted admin email (see `config/newsletterAdminAllowlist.js`).
2. Scroll to **Scam Watch** → run **Generate Briefing**.
   - Confirm a draft appears with insights and sources populated by Gemini.
3. Click **Publish Draft**.
   - Verify the briefing shows in the archive and `email_sent_at` is still empty in Supabase.
4. Trigger **Send Newsletter Email**.
   - Confirm the UI reports the recipient count and Supabase row records `email_sent_at`.
   - Spot-check inbox delivery (Resend activity log or real mailbox).

## 2. Subscriber experience (monthly plan)
1. Sign out, visit the live site, and create a new Supabase user via the Auth panel.
2. Subscribe with the $10/month PayPal button.
   - On approval, the page should reload and unlock Scam Likely + Scam Watch.
3. Verify Supabase `entitlements` shows `status = active`, `product = scam_likely`, and `payment_reference` matches the PayPal subscription ID.
4. Open Scam Watch archive; ensure the latest briefing content is visible.

## 3. Subscriber experience (annual plan)
1. Repeat the flow with another test account using the $100/year toggle in the PayPal selector.
2. Confirm the entitlement metadata stores the new subscription ID and remains active after webhook callbacks.

## 4. Newsletter delivery (non-admin subscriber)
1. Stay signed in as the annual-plan user and confirm Scam Watch archive loads but admin controls are hidden.
2. Trigger a new newsletter (admin steps 1–4) and confirm the non-admin subscriber receives the emailed briefing, without access errors.

## 5. PayPal + Webhook regression checks
- Cancel a PayPal subscription from the dashboard; fire the webhook to ensure entitlements flip to `revoked`.
- Resume/reactivate and ensure status returns to `active`.

## 6. Resend + automation sanity
- In Resend, verify the message history and delivery metrics match expectations.
- If using Make/Zapier, run the scenario in test mode to ensure all API calls return `200` with the admin Bearer token.

Document results and any anomalies directly in `docs/risky-kristy-newsletter-plan.md` under Step 7.
