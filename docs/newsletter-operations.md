# Newsletter Operations Guide

## Environment variables
Set the following secrets before enabling automated delivery:

```
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Scam Watch <alerts@yourdomain.com>
```

Add their Vite counterparts only if the key must be exposed in the browser (not needed for the current flow).

## Admin workflow
- Sign in with an allowlisted admin email so the Scam Watch admin tools appear under the Scam Likely section.
- Click **Generate Briefing** to run the Gemini-powered scan and review the draft insights.
- Publish the draft to push the briefing into Supabase and unlock subscriber access.
- Trigger **Send Newsletter Email** to broadcast the published issue through Resend. The call records `email_sent_at` on the `newsletters` row for auditing.

## Automation hand-off (Make/Zapier)
- Schedule a Friday scenario that calls `POST /api/newsletters/generate` followed by `POST /api/newsletters` and `/api/newsletters/send` once the briefing is approved.
- Pass the Supabase access token for an admin user in the `Authorization: Bearer <token>` header.
- Monitor the scenario for non-200 responses so the team can intervene when the Gemini API or Resend returns an error.

## Supabase helpers
Run the migration snippets in `supabase_setup.sql` to install:
- `public.newsletters` table (with RLS)
- `public.newsletter_recipient_emails()` security-definer function, used by `/api/newsletters/send` to fetch active subscriber emails.
