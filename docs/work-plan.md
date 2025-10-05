# Work Plan

## Recent Updates
- Confirmed blog ingestion pipeline end-to-end by sanitizing generator slugs, hardening publish flows, and forcing the admin blog list API to read fresh data from Supabase.

## Active Focus
1. Chrome extension: build and publish the AI Crypto Risk helper for browser-based contract lookups.
2. Affiliate referral system: finish design and implementation per the upcoming spec.

## Notes
- Blog generator SQL output now uses update-then-insert semantics so Supabase writes succeed without schema changes.
- Admin publish endpoints return clearer errors when a post is missing or already shipped, avoiding ambiguous Supabase responses in the UI.
