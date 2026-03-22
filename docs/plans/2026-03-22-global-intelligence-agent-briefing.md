# 🛰️ GlobalIntelligence Page — Agent Briefing

**Project:** TOP 100 Aerospace & Aviation App
**Repo:** `HeegzBozon/top-100-aerospace-aviation1`
**Date:** 2026-03-22

---

## What We Built

A new **GlobalIntelligence** page was added to the existing Base44 app. It is a dedicated page (not embedded into any existing page) that combines:

1. **An iFrame globe** — a live embed of the deployed World Monitor app
2. **Native data panels** — news feed, live flights, satellite tracking, GPS jamming alerts, military posture, country risk scores, and market/finance radar — all rendered directly inside the Base44 app

---

## What World Monitor Is

World Monitor (`koala73/worldmonitor`) is a standalone real-time geopolitical intelligence dashboard. It includes:

- A 3D interactive globe (Three.js)
- Live flight tracking
- Satellite tracking
- GPS jamming heatmap
- Military posture indicators
- Country risk scoring
- Finance/market radar
- News aggregation

It was cloned from GitHub, then **deployed to Vercel** as a separate app. The Vercel deployment URL is used as the iFrame `src` in the GlobalIntelligence page.

---

## Architecture Decision

| Decision | Choice | Reason |
|----------|--------|--------|
| Page structure | New dedicated page | Avoids crowding existing pages |
| Globe integration | iFrame | WM is a full Vite/TS app — component extraction would require major refactoring |
| Data panels | Native (re-implemented) | Cleaner control, no cross-origin issues, matches Base44 design system |
| WM hosting | Vercel (separate deployment) | Required for iFrame to work in production |

---

## Key Files Added

```
src/
  pages/
    GlobalIntelligence.jsx        ← Main page component
  components/
    global-intelligence/
      GlobeEmbed.jsx              ← iFrame wrapper for WM
      LiveFlightsPanel.jsx
      SatellitePanel.jsx
      GpsJammingPanel.jsx
      MilitaryPosturePanel.jsx
      CountryRiskPanel.jsx
      FinanceRadarPanel.jsx
      NewsPanel.jsx
docs/
  plans/
    2026-03-22-global-intelligence-page.md
    2026-03-22-global-intelligence-worldmonitor-integration-design.md
```

---

## Environment Variable

The iFrame URL is controlled by:

```
VITE_WORLDMONITOR_URL=https://<your-vercel-deployment>.vercel.app
```

Set this in your `.env` (local) and in Vercel environment settings (production).

---

## What the Agent Needs to Do Next

If you are continuing this work, your tasks are:

1. **Wire up the router** — add `GlobalIntelligence` to the app's route config (check `src/App.jsx` or wherever routes are defined)
2. **Add nav link** — add a "Global Intelligence" entry to the sidebar/nav
3. **Set the env var** — add `VITE_WORLDMONITOR_URL` pointing to the live WM Vercel URL
4. **Style consistency** — match the dark/slate theme of the existing app
5. **Test iFrame** — confirm the globe loads and isn't blocked by CSP or CORS headers

---

## Status at Handoff

- ✅ World Monitor cloned
- ✅ World Monitor deployed to Vercel
- ✅ GlobalIntelligence page components scaffolded
- ✅ Design docs written
- ✅ All committed and pushed to `main`
- ⏳ Router + nav wiring — **not yet done**
- ⏳ Env var set in Vercel for the Base44 app — **not yet done**
