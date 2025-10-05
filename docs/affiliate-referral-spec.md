# Affiliate Referral Program Spec

## Requirements
- **Enrollment Toggle:** Add an optional "Join the referral program" checkbox to the onboarding flow for logged-in members. When selected, capture payout details (PayPal email) and surface the member’s unique referral URL.
- **Referral Attribution:** Track visitors arriving with `?ref=<code>` via Supabase `referral_clicks`. Persist attribution in a short-lived cookie/session so conversions still count if the user navigates around before purchasing.
- **Conversion Trigger:** Pay a $100 bounty when a referred lead purchases the paid course (same success event that currently unlocks the course). Only the first successfully converted affiliate should receive credit per customer.
- **Member Dashboard:** Give enrolled affiliates access to a lightweight dashboard (e.g. `/admin/referrals/me`) showing referral link, clicks, conversions, pending payouts, and payout history.
- **Admin Controls:** Extend the admin area to list all affiliates, their performance metrics, and allow staff to mark payouts as sent. Include filters for pending/paid status and CSV export.
- **Fraud Controls:** Prevent self-referrals, limit multiple payouts for the same buyer, and log manual adjustments. Provide audit trail entries for every payout or reversal.
- **Notifications:** Email affiliates when they earn a conversion, when a payout is scheduled, and when it is completed.
- **Compliance:** Store payout history with timestamps and staff operator IDs for accounting. Allow admins to deactivate referral accounts.

## Design Spec

### Data Model (Supabase)
- `referral_partners`
  - `id` (uuid, pk)
  - `user_id` (uuid, fk → profiles)
  - `referral_code` (text, unique slug)
  - `payout_email` (text, nullable)
  - `status` (enum: active, suspended, archived)
  - `joined_at`, `updated_at`
- `referral_clicks`
  - `id` (uuid)
  - `referral_code`
  - `visitor_fingerprint` (hashed cookie/session id)
  - `ip_hash`, `user_agent`
  - `clicked_at`
- `referral_conversions`
  - `id` (uuid)
  - `referral_partner_id`
  - `buyer_user_id`
  - `order_id` (from PayPal or course purchase flow)
  - `course_product_id`
  - `status` (pending, approved, rejected)
  - `converted_at`
- `referral_payouts`
  - `id` (uuid)
  - `referral_partner_id`
  - `conversion_id`
  - `amount_cents` (fixed at 10000)
  - `status` (pending, scheduled, paid, failed)
  - `payout_reference`
  - `handled_by` (staff user id/email)
  - `created_at`, `updated_at`, `paid_at`

Add Supabase RLS so partners can see only their own stats while admins (service role, allowlist) can view everything.

### Application Flow
1. **Onboarding Update:** On `/onboarding` (or equivalent modal), a new card invites users to join the referral program. Checking the box triggers a server action that generates a slug (`referral_code`) and inserts into `referral_partners`.
2. **Link Generation:** Referral link pattern: `https://aicryptorisk.com/course?ref=<code>`. Show in dashboard with copy button and share tips.
3. **Attribution Middleware:** When a visitor lands with `ref`, call an API route to log a click and set `referral_code` in a cookie (7-day expiry). Client-side helper reads cookie on checkout submission.
4. **Conversion Hook:** Modify the course purchase success handler (currently PayPal + Supabase entitlements) to:
   - Read the referral cookie or `ref` query.
   - Verify the code belongs to an active partner.
   - Ensure buyer is not the same as the referrer.
   - Upsert into `referral_conversions` with `status=pending`.
5. **Admin Review/Payout:** Admin UI surfaces pending conversions. Staff can approve (auto-creates `referral_payouts` row) or reject with reason. Approved conversions move to the partner dashboard as “Pending payout”.
6. **Payment Execution:** Manual step initially: staff pays via PayPal dashboard, then records `payout_reference` and marks payout as `paid`. Future automation could integrate PayPal Payouts API.
7. **Notifications:** Use existing Resend setup to email affiliates on key events (approved conversion, payout sent). Template referencing `referral_partners.payout_email`.

### UI Additions
- **Onboarding Tile:** Checkbox + short copy, with disclosure about $100 payouts and terms.
- **Affiliate Dashboard:** Card layout showing link, total clicks, conversions, pending payouts, history table. Badge when account is suspended.
- **Admin → Referrals:** New section alongside blog/newsletter tabs with metrics, filters, and detail modal per affiliate.
- **Terms Page:** Public `/referrals/terms` summarizing qualification rules.

### Security & Integrity
- Hash visitor fingerprints to avoid storing raw PII.
- Rate-limit referral enrollments, require verified emails.
- When suspending an affiliate, their code should stop attributing new conversions.
- Maintain audit log (`referral_audit_log`) if we need granular tracking of admin actions.

## Task List
1. **Schema Migration:** Create Supabase tables/enums/policies for partners, clicks, conversions, payouts.
2. **Onboarding Update:** Add referral checkbox + server action to register partners and surface referral link confirmation screen.
3. **Link & Tracking Utilities:** Implement API route and cookie helper for tracking clicks; update client routing to handle `?ref` and set cookies.
4. **Conversion Hook Integration:** Update course purchase flow to record conversions (and guard against duplicates/self-referrals).
5. **Member Dashboard:** Build `/admin/referrals/me` route rendering stats, payout history, copy link module.
6. **Admin Management UI:** Build `/admin/referrals` list view with filters, detail modals, approve/reject controls, payout marking workflow.
7. **Notifications:** Add Resend templates + server functions to announce approvals/payouts.
8. **QA & Policies:** Write Supabase RLS tests, add seed data, and document manual payout steps.
9. **Documentation:** Publish referral terms page and update README with referral program instructions.
10. **Future Automation (Backlog):** Evaluate PayPal Payouts integration and automated payout scheduling.
