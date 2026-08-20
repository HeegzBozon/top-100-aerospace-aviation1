# PRD — SEO, Governance & Route Surface Remediation
**Date:** 2026-08-20
**Source:** External audit (crawler + metadata pass, 2026-08-19)
**Status:** Planned — not yet implemented

---

## 1. Problem statement

The highest-authority public statement about what TOP 100 does currently contradicts the institutional argument the company is raising on.

The platform-generated meta description, served on ~100 routes, reads: *"the premier global platform **recognizing** the most influential professionals… transparent nominations, live voting, and **real-time rankings**—celebrating excellence…"* — truncated mid-word at `"recognizing t."`

This is what Google renders, what LinkedIn unfurls when a Fellow shares their profile, what Slack shows when an investor pastes a link, and what an LLM returns when asked what TOP 100 is. The governance whitepaper says *measurement*. The public metadata says *rankings*.

Secondary but higher-severity: ~15 internal/operational routes are reachable and gated only client-side.

**Verified 2026-08-20:** `site:top100aero.space` returns the offending string live on `/top100women2025` and `/ServiceDetail`. Root `index.html` description is already on-thesis; the ~100-route override is platform-generated.

---

## 2. Scope boundary — critical

Findings split into two buckets. Mixing them wastes a sprint.

### Bucket A — Fixable in app code (this repo)
Everything in §4. We own these.

### Bucket B — Base44 platform settings (dashboard only, NOT code)
| Item | Where | Why not code |
|---|---|---|
| The "recognizing…real-time rankings" description on ~100 routes | Base44 dashboard → app Settings → description field | `base44/config.jsonc` has no description key. The platform reads its own app-settings string and slices it to ~155 chars with no word-boundary handling. No app file overrides it on non-root routes. |
| Mid-word truncation logic | Base44 platform SEO generator | Not in our source tree. |

**Action for Bucket B:** the app owner edits the app description in the Base44 dashboard. Because the platform truncates at ~155 chars, **the first 155 characters must be self-contained and on-thesis** — truncation then becomes harmless.

Proposed dashboard description (front-loaded, no em dash, 152 chars before any cut):

> The verified professional index for aerospace and aviation. Community nomination, blind voting, permanent record. We don't rank. We measure. 300+ Fellows across 40+ countries and 70+ disciplines.

First 152 chars survive truncation intact and end on "We measure."

---

## 3. Confirmed findings vs. audit

| # | Finding | Verdict | Bucket |
|---|---|---|---|
| P0-1 | Global description is off-thesis ("recognizing", "rankings") | **Confirmed live.** Root `index.html` already correct; the ~100-route override is platform-generated | B (+ A for em dash) |
| P0-2 | Description truncates mid-word, no unique indexable content per route | **Confirmed** | B |
| P0-3 | ~15 internal routes advertised + client-only gating | **Confirmed as routes + client-only noindex.** Server-side enforcement **unverified** | A (verify) |
| P0-4 | Route sprawl, case-variant collisions, routable `/NotFound` | **Confirmed** | A |
| H-1 | No canonical public governance URL; `/HowWePick` is a redirect stub with zero content | **Confirmed** | A |
| H-2 | Vendor internals leaked in image URLs | **Confirmed, corrected scope:** `og:image` uses `media.base44.com`; the leak is in favicon, JSON-LD `logo`, and `LandingFooter` logo — all hardcode `qtrypzzcjebvfcihiynt.supabase.co/…/base44-prod/68996845be6727838fdb822e/` | A |
| H-3 | Em dash in `og:image:alt` | **Confirmed** (`index.html` L38) | A |
| H-4 | `meta-keywords` stuffed and off-thesis | **Confirmed** (L24) | A |
| — | "Footer links to /Admin, /FactoryReset…" | **Corrected.** `LandingFooter.jsx` links only About/Methodology/Categories/Sponsors/Press/Governance/Contact. The 100-link index the crawler saw is the platform's prerendered SPA-fallback route list, not an app component. Admin exposure is real; the footer is not the source. | — |

---

## 4. Workstreams

### WS-1 — Security verification (blocks everything else)
**Owner:** security-guardian + Katja · **Priority:** P0

`index.html` L152–201 injects `<meta name="robots">` at runtime for ~40 route patterns. This is an SEO hint, not access control. Routes exist in `App.jsx` and resolve for any authenticated user.

Verify, per route, whether protection is server-side (entity RLS / backend function role checks) or client-side only (a role check inside the component):

`/Admin` · `/AdminAction` · `/FactoryReset` · `/BatchNominations` · `/onboarding-admin` · `/Publisher` · `/Comms` · `/Demographics` · `/AnalyticsDashboard` · `/IntelligenceDashboard` · `/GlobalIntelligence` · `/team-manager` · `/linkedin-manager` · `/art-command-center` · `/AgentSkillRegistry` · `/email-preview` · `/session-portal`

**Highest risk:** `factoryReset` and `clearUsers` / `clearSeasonData` / `resetAllScores` backend functions. If these are callable without a server-side admin check, that is a data-loss vector, not a UI bug.

**Exit criteria:** every destructive backend function validates caller role server-side; every admin route's data access is RLS-enforced. If gating is client-only, this becomes the sprint's top story ahead of all SEO work.

**Acceptance test:** authenticate as a `role: "user"` account, call each destructive function directly, and confirm rejection.

---

### WS-2 — Metadata hygiene (code half)
**Owner:** RWY · **Priority:** P0 · **File:** `index.html`

1. **Remove em dash** from `og:image:alt` (L38) and `description` (L23) — replace with period or comma. Brand-controlled strings carry no em dashes.
2. **Replace `meta-keywords`** (L24). Google has ignored it since 2009, but LLM crawlers read it and diligence readers view-source. Current value reinforces the ranking frame. Either delete outright (preferred) or reduce to thesis-aligned terms with no "index/top/ranking" framing.
3. **Proxy vendor image URLs.** Replace all `qtrypzzcjebvfcihiynt.supabase.co/…` references with a `top100aero.space` path:
   - `index.html` L19 (favicon)
   - `index.html` L57 (JSON-LD `logo`)
   - `src/components/landing/LandingFooter.jsx` L25
   Serve the logo from `public/brand/logo.png` and reference `/brand/logo.png`.
4. **Per-share OG differentiation** (deferred, next sprint): every share currently uses one identical logo card. Fellow announcements and articles should carry distinct images.

---

### WS-3 — Canonical governance page
**Owner:** Katja + brand-director · **Priority:** High

`/HowWePick` is currently a 15-line redirect stub to `/Top100OS` — it prerenders zero words about governance, despite being the URL that carries the governance argument.

Create `/governance` as a real static-content route carrying:
- The four structural separation conditions
- The non-endorsement statement, at a canonical public address
- Explicit statement that selection is blind to billing at the data layer
- How nomination → blind pairwise voting → permanent record works

Link from: `LandingFooter` (replace the modal-only "Governance" button with a real route link), `/HowWePick` (convert stub → redirect to `/governance` or merge), and the Ground Control non-endorsement block.

**Why this matters commercially:** `/community-round`, `/payment-plan`, `/Membership`, `/Shop`, `/SponsorPitch` sit in the same nav graph as `/nominate`, `/VotingHub`, `/RankedChoice`. A Wefunder reader verifying separation has nowhere to land today.

**Consider static-serving it** (`public/governance/index.html`), same pattern as Ground Control — this is a diligence page that must be readable without JS.

---

### WS-4 — Route manifest & consolidation
**Owner:** product-owner · **Priority:** Next sprint

Classify all ~100 routes as **keep / redirect / gate / delete**. Expected public surface: ~20 routes.

Confirmed collisions needing 301s:
- `/Season4` vs `/season4` — two separate pages, case-variant
- `/`, `/Home`, `/Landing` — three homepages (partially handled: `/Home` and `/Landing` already `Navigate` to `/`)
- `/nominate` · `/Nominations` · `/BatchNominations`
- `/Article` vs `/Articles`
- `/top100-tv` vs `/top100-tv-channels`
- `/AnalyticsDashboard` · `/IntelligenceDashboard` · `/GlobalIntelligence`
- `/Calendar` vs `/events`
- `/Arcade` · `/GamesLanding` · `/play` · `/Arena` · `/ChessClub` · `/ChessGame` · `/common-ground-sim`

Also: **`/NotFound` is a routable, indexable URL** — a real page that crawls as a soft-404. Must return a proper 404 status, not render as content.

Naming convention splits PascalCase (legacy) vs kebab-case (recent), which dates build order rather than describing the product. Standardize on kebab-case for all public routes; redirect PascalCase.

---

## 5. Sequencing

| When | Workstream | Rationale |
|---|---|---|
| **Immediately** | WS-1 security verification | Potential data-loss vector. Blocks all else. |
| **Immediately** | Bucket B dashboard description swap | Single field edit, largest surface owned. Stops the bleeding. |
| **This week** | WS-2 metadata hygiene | Single-file changes, low risk. |
| **This week** | WS-3 governance page | Unblocks Wefunder diligence. |
| **Next sprint** | WS-4 route manifest | Requires classification decisions across ~100 routes. |

---

## 6. Explicitly not covered — needs a live browser pass

Not verifiable from crawler/metadata inspection or source review:
rendered layout and mobile breakpoints · console errors and failed API calls · **actual auth enforcement on admin routes (WS-1)** · form submission on `/nominate`, `/subscribe`, `/rsvp`, `/Feedback` · Stripe path `/payment-plan` → `/PaymentSuccess` / `/PaymentCancel` · bundle size and LCP · keyboard and screen-reader accessibility.

Run these through the Base44 Testing Agent (test-tube icon, side panel) with plain-English goals.

---

## 7. Core thesis

The metadata problem and the governance problem are one problem. The platform's per-route generator broadcasts "rankings" on every crawl, share, and LLM fetch while the institutional argument says "measure." The root description is already correct in code; the ~100-route override is a dashboard field.

**Fix the string before the next investor pastes the link.**