# Scale-Up Readiness Checklist

Keep this list handy as traction grows. Mark items off once they are fully handled in production.

## Platform & Infrastructure
- [ ] Vercel team plan reviewed (usage/limits, analytics seats, preview concurrency).
- [ ] Custom domains + DNS failover documented.
- [ ] Scheduled backups for Supabase (DB + storage) confirmed and tested.
- [ ] Rate limits, cold-start budgets, and queue alerts configured for all serverless APIs.
- [ ] Edge cache strategy defined (headers, revalidation, purge playbook).

## Security & Compliance
- [ ] Google Workspace admin controls locked down (MFA enforced, shared inbox policy).
- [ ] Supabase RLS rules peer-reviewed; audit logs enabled.
- [ ] Secrets inventory updated (Vercel envs, Supabase, Gemini, PayPal, Resend, Perplexity).
- [ ] Incident-response runbook drafted with on-call contact tree.
- [ ] Data retention policy written (scans, newsletters, billing artifacts).

## Product & Feature Readiness
- [ ] Free-tier onboarding flow documented with fallback paths.
- [ ] Scam Watch archive migration plan validated (import/export scripts).
- [ ] AI scan rate throttles tuned for projected users (per-IP, per-account).
- [ ] Backlog of "when-ready" features triaged (automation, exports, analytics dashboards).

## Operations & Support
- [ ] Support channels list (email, SMS, phone) and response SLAs published.
- [ ] Google Workspace shared inbox rules/labels set up for support@ and billing@.
- [ ] Escalation script for technical incidents (Vercel status, Supabase outages, Gemini quotas).
- [ ] CRM/feedback loop chosen (e.g., Notion, Linear, HubSpot) with intake form.
- [ ] Knowledge base / FAQ outline prepped for public release.

## Analytics & Experimentation
- [ ] GA4 and Vercel Analytics dashboards bookmarked; KPI definitions stored in docs.
- [ ] Event tracking plan (engagement, scan conversion, newsletter sign-ups) finalized.
- [ ] Consent management / cookie banner requirements assessed (EEA visitors).
- [ ] Attribution integrations reviewed (UTM governance, partner pixels).
- [ ] Experiment backlog created (pricing, onboarding copy, paywall prompts).

## Finance & Expenses
- [ ] Monthly expense tracker started (Vercel, Supabase, Google Workspace, APIs, domains).
- [ ] Forecast spreadsheet includes scaling tiers + buffer for Gemini/PayPal fees.
- [ ] Business bank + accounting software connected (QuickBooks, Wave, etc.).
- [ ] Tax considerations noted (sales tax, VAT for digital goods, 1099-K thresholds).
- [ ] Reserve fund target defined (months of runway/operating expense).

## Sales & Partnerships
- [ ] Enterprise outreach playbook outlined (brief deck, case study template).
- [ ] Partner referral agreements boilerplate drafted.
- [ ] Pricing review cadence set (quarterly check vs. conversion/take rate).
- [ ] Press/launch kit prepared (brand assets, product screenshots, founder bio).

## Legal & Policies
- [ ] Terms/Privacy/Disclaimer align with new offerings; change log kept.
- [ ] GDPR/CCPA data requests workflow documented.
- [ ] Ad disclosure + affiliate policy reviewed for new partners.
- [ ] Vendor contracts stored centrally with renewal reminders.

## Automation & Tooling
- [ ] Zapier/Make/cron jobs inventory compiled with owners + rollback plan.
- [ ] GitHub/Vercel CI status checks locked down (required reviews).
- [ ] Monitoring alerts wired to Slack/Email/SMS (uptime, Supabase errors, PayPal webhook failures).
- [ ] Load test script or plan ready (k6/Artillery) for key endpoints.

Update this checklist whenever new systems or expenses get introduced.
