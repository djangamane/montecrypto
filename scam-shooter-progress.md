# Scam Shooter Integration – Progress & Changelog

## What we implemented
- Added a Scam Shooter marketing/landing page (`/scam-shooter` in the Next app) with hero, pricing (Stripe links), CTAs, and login/back links.
- Added a thank-you redirect page (`/thank-you`) to unlock access locally after Stripe purchase, with email capture fallback.
- Renamed game branding in the Vite app to “Scam Shooter” and added a practice mode card in Training.
- Lesson gating: mandatory per-level video before missions; training links use YouTube; missions use local lesson files.
- Arcade variety: improved question sampling to avoid repeats across levels; expanded question pools.
- New sprites: player/enemy/coin/projectile now use real assets; copied to `public/assets`.
- Added CTA swap on the marketing header: “Play Scam Shooter!” with the red blob icon pointing to `/scam-shooter`.

## Recent adjustments
- Restored full hero image on `/scam-shooter` after alignment tweaks; simplified background.
- Updated the coin sprite to the new BTC asset (`sprite_btc2.png` in `public/assets`).
- Added email fallback on the thank-you page to store `minerverse_paid` and `minerverse_email` locally.

## Known items
- Simulator lint warnings/errors remain unchanged; not addressed in this pass.
- Paid flag is client-side only; replace with backend verification/webhooks later.
