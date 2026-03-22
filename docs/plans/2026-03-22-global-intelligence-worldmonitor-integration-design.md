# Global Intelligence Page — World Monitor Integration Design

*Date: 2026-03-22*

## Overview

Integrate World Monitor (a real-time global intelligence platform) into the TOP 100 Aerospace & Aviation app as a new dedicated `GlobalIntelligence` page. Uses a hybrid approach: iFrame for the 3D globe/map (complex WebGL, not portable to React), native React components for live data feeds.

## World Monitor Deployment

World Monitor is deployed to Vercel at:
`https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app`

Source repo: `https://github.com/koala73/worldmonitor.git`
Local clone: `/Users/heegzbozon/Downloads/worldmonitor`

## Architecture

### New Page

`src/pages/GlobalIntelligence.jsx` — auto-registers at `/GlobalIntelligence` via the existing pages.config.js system.

### New Component Directory

`src/components/global-intelligence/` with an `index.js` barrel export.

### Two Zones

**Zone 1 — Globe iFrame (top)**
- Full-width iframe pointing to the WM Vercel deployment
- Height: ~500px on desktop, collapsible via toggle button
- On mobile: collapsed by default, expandable
- Shows a loading skeleton while the iframe loads

**Zone 2 — Data Panels (below)**
- Tabbed interface with 6 panels
- All data fetched directly from WM's public API endpoints
- Styled to match existing IntelligenceDashboard (same brandColors, glass-card, Framer Motion, shadcn/ui)
- Uses `useEffect` + `useState` pattern (consistent with rest of codebase)

## Components

| File | Purpose | WM API Endpoint |
|------|---------|-----------------|
| `WorldMonitorGlobe.jsx` | iFrame wrapper with loading state + collapse toggle | iFrame embed |
| `AviationNewsFeed.jsx` | Aviation news article cards | `GET /api/aviation/v1/list-aviation-news` |
| `LiveFlightsPanel.jsx` | Military aircraft tracking list | `GET /api/military/v1/list-military-flights` |
| `SatelliteTracker.jsx` | Orbital satellite positions | `GET /api/intelligence/v1/list-satellites` |
| `GpsJammingPanel.jsx` | GPS/GNSS interference alerts | `GET /api/intelligence/v1/list-gps-interference` |
| `RiskScoresPanel.jsx` | Country composite risk scores | `GET /api/intelligence/v1/get-risk-scores` |
| `NewsFeedDigest.jsx` | Aggregated 435+ RSS feed digest | `GET /api/news/v1/list-feed-digest` |

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: "Global Intelligence"  [Collapse Globe ▲]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│         World Monitor iFrame (500px)                │
│         3D globe, 45 data layers                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Tabs: Aviation | Flights | Satellites | Signals | Risk │
├─────────────────────────────────────────────────────┤
│                                                     │
│         Active tab panel (native React)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Styling Conventions

- Brand colors: `navyDeep: '#1e3a5a'`, `skyBlue: '#4a90b8'`, `goldPrestige: '#c9a87c'`, `cream: '#faf8f5'`
- Cards: `glass-card border-slate-200/50` class
- Animations: Framer Motion `initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}`
- Layout: `max-w-7xl mx-auto px-4 py-8 md:px-6`
- Loading state: `Loader2` icon from lucide-react with `animate-spin`

## API Integration

WM base URL stored as a constant `WM_BASE_URL` at the top of the page component. All fetch calls are plain `fetch()` GET requests — no auth required, WM APIs are public.

```js
const WM_BASE_URL = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
```

Response handling: standard `try/catch` with loading + error states per panel.

## Navigation

Add `GlobalIntelligence` to the app's sidebar navigation in the appropriate section (alongside other intelligence/dashboard pages).

## Non-Goals

- No modification to World Monitor source code
- No porting of WM's 3D globe/map to React
- No authentication passthrough to WM (public APIs)
- No real-time WebSocket connections (polling on tab focus is sufficient)
