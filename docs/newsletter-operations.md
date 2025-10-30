# Newsletter Operations Guide

## Environment variables
Set the following secrets before enabling automated delivery:

```
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Scam Watch <alerts@yourdomain.com>
```

Add their Vite counterparts only if the key must be exposed in the browser (not needed for the current flow).

## Admin workflow (local CLI)
- Run `node scripts/admin-cli.mjs newsletter generate [focus] > briefing.json` to create a draft briefing locally. The command depends on `GEMINI_API_KEY` and optional Perplexity variables.
- Inspect or edit the generated JSON, then publish with `node scripts/admin-cli.mjs newsletter publish briefing.json` (requires Supabase service-role + Resend secrets).
- Deliver the latest briefing via `node scripts/admin-cli.mjs newsletter send [newsletterId]`. If no ID is supplied the most recent published issue is emailed and `email_sent_at` is recorded automatically.

## Automation hand-off (Make/Zapier)
- Execute the CLI from a secure runner or replicate its logic with Supabase RPC calls if you require automation. No hosted `/api/newsletters/*` endpoints remain.
- Store secrets (Supabase service role, Resend, Gemini, Perplexity) in the orchestrator’s secret manager and rotate periodically.
- Monitor runs for non-zero exit codes so the team can intervene when Gemini, Perplexity, or Resend returns an error.

## Supabase helpers
Run the migration snippets in `supabase_setup.sql` to install:
- `public.newsletters` table (with RLS)
- `public.newsletter_recipient_emails()` security-definer function, used by the CLI to fetch active subscriber emails.
