# Fellow Edition — The Publisher Sitting

## Vision
The fourth role-play sitting. **Photographer** (visual), **Biographer** (words),
**Presenter** (motion — the reel), and now **Publisher** (the bound issue).

Each Fellow gets a paginated publication surface — a bound, page-turn
magazine artifact composed entirely from data they already entered. Zero
new data entry. The magazine is assembled, not authored.

## What's built (this pass)
- `FellowEdition` entity — per-Fellow, per-cycle published editions
- `editionConfig.js` — governed spread registry (cover locks first,
  colophon locks last, Fellow-configurable middle)
- `FlipbookReader.jsx` — react-pageflip engine, responsive portrait +
  double-page, swipe + click + keyboard nav, page counter, share
- 8 spread components: Cover, Masthead, Editor's Letter, The Eight,
  Dispatches, Flightography, Documents, Colophon
- `/editions/:id` route — full-screen reader

## What's deferred
- **The Publisher sitting** (wizard step for composing the edition —
  choose spreads, order, cover, status)
- **Embed code** + deep-linkable share URL (server-served for crawlability)
- **PDF export** for conference handouts
- **Multi-issue archive** view per Fellow
- **Archived immutability** guard (server-side in save function)
- **Reel crossover** — same data, Presenter renders the 60s teaser,
  Publisher renders the bound edition

## Governance
The edition is pure expression. It composes and orders. It never alters
verification display, never feeds measurement, never brokers. The Eight
positions still read as positions. The firewall is untouched.

## Spread registry (locked positions)
- `cover` — locked to position 1
- `colophon` — locked to last position
- Fellow-configurable middle: masthead, editors_letter, the_eight,
  dispatches, flightography, documents

## Data sources (no new input)
- Cover → verified asset library (edition.cover_asset_id or settings)
- Masthead → nominee identity fields + settings six_word_story
- Editor's Letter → settings.about_me / nominee.bio
- The Eight → UserTop100List rankings (fellow_email)
- Dispatches → Bulletin records (author_email, published)
- Flightography → nominee.career_history, impact_metrics, achievements
- Documents → nominee links (linkedin, website, additional_links)
- Colophon → edition metadata, verification state reference