# Profile Cluster — Hero's Journey Reorganization

**Date:** 2026-08-22
**Scope:** `BulletinBoardCluster` and the Profile page module layout below the masthead.
**Goal:** Reorganize the cluster from content-type taxonomy (Author/Profile) into an intent-and-sequence journey (Orient → Act → Be Recognized) so a Fellow never lands on a static dashboard but on *the next thing they're meant to do*.

---

## 1. The frame — three acts

| Act | Question it answers | Surface |
|------|---------------------|---------|
| **I — The Call** | Where am I, and what's expected of me this cycle? | Compass rail (30%, always visible) |
| **II — The Work** | Do the work that defines you here. | Main pane — four journey-verb tabs (70%) |
| **III — The Return** | Be seen, be endorsed, bring others in. | Return band (footer of pane) |

The cluster is one cohesive framed unit (sand container, "Bulletin Board" kicker, hairline) — already built. This plan only reshuffles **what lives inside** the rail and the pane, and adds the "next move" engine.

---

## 2. Act I — Compass rail (the 30%)

The arrival state, not a menu. Always visible. Replaces the current ad-hoc stack with a deliberate sequence:

1. **Status** — the hero's current state (curated picker). *Exists.*
2. **Season countdown** — the ticking clock; urgency is the engine. *Exists (`SeasonCountdown`).*
3. **The Record** — visits, endorsements, Fellow-since. Owner-only feedback. *Exists (`FellowStatsBox`).*
4. **Network snapshot** — connections / community at a glance. *Exists (`ConnectionsRail` summary).*
5. **Pinned + Newsletter** — what's happening this cycle (nominations closing, voting opens). *Exists (`AnnouncementsRail`, `CommunityBulletinsRail`).*
6. **Public URL + Share** — the bridge out. *Exists (masthead currently; mirror or keep).*
7. **Compose rail** — the single compose entrypoint stays at the top of the rail (the call to act).

> The compass answers "who am I here and what's the deadline" without making the Fellow hunt.

---

## 3. Act II — The Work (main pane, four tabs)

Renamed from content-nouns to **journey verbs**, in the order a Fellow earns their place. The two-tier toggle (Author/Profile) is retired.

| # | Tab | Verb | Contents | Source module(s) |
|---|-----|------|----------|------------------|
| 1 | **Compose** | speaks | Dispatches / Notes / Gallery (bulletin tools, allowlist-driven) | `BulletinToolTabs` (Author tier today) |
| 2 | **The Eight** | chooses | Ordinal 8-slot list; vacancy as the call to action | `TheEight` + `Top100Rail` (migrates out of masthead cluster) |
| 3 | **Flightography** | proves | Career history, education, skills, contributions | `FlightographyModule` + `NomineeContributionsSection` + `ResearchStatsCard` (Profile tier today) |
| 4 | **Card** | is recognized | Trading card, theme, stats, share | `ShareableProfileCard` / `TradingCard` (Profile tier today) |

Each tab has a **designed empty state** (not placeholder text) that names the single next action.

### Tab empty-state chain

- **Compose** empty → *"File your first dispatch."* → opens composer
- **The Eight** with open slots → *"Fill position N of your Eight."* → links to nominate flow with slot prefilled
- **Flightography** empty → *"Add your career history."* → opens Flightography editor
- **Card** not shared → *"Share your card."* → opens share drawer

---

## 4. Act III — The Return (band under the pane)

Reputation and community, not navigation chrome. Currently buried in the left rail; surfaced as a horizontal band beneath the pane (or a 5th tab if vertical space is tight):

- **Endorsements wall** — authored reputation entries (`EndorsementWall`)
- **Community Bulletins** — Fellow-authored network feed (`CommunityBulletinsRail` preview)
- **Mail / Messages** — inbound reputation and connection traffic

> These are the "return" — being seen, being endorsed, bringing others in.

---

## 5. The engine — "Your next move"

A single card pinned to the **top of the pane**, above the tabs. It surfaces the highest-leverage *unfinished* step and always advances the journey:

**Resolution order (first unfinished step wins):**

1. No published dispatches → *"File your first dispatch"*
2. The Eight has open slots → *"Fill position N of your Eight"*
3. Flightography empty → *"Add your career history"*
4. Card never shared → *"Share your card"*
5. No endorsements written → *"Endorse a fellow Fellow"*
6. All complete → *"Your profile is complete — explore the directory"*

Each step resolves to a single CTA that opens the relevant tab / composer / editor / share drawer. Once satisfied, it yields to the next. This turns the cluster from a place you *wander* into a sequence you *walk*.

---

## 6. Module move map (concrete)

| Module | Now | Becomes |
|--------|-----|---------|
| Status | Compose rail | Compass rail, #1 |
| Season countdown | Compose rail / SeasonBand | Compass rail, #2 |
| FellowStatsBox (Record) | Left rail | Compass rail, #3 |
| ConnectionsRail | Left rail | Compass rail, #4 (summary) |
| AnnouncementsRail (Pinned) | Left rail | Compass rail, #5 |
| CommunityBulletinsRail | Left rail | Compass rail, #5 + Return band preview |
| Public URL + Share | Masthead | Compass rail, #6 (mirror) |
| Compose entrypoint | Compose rail top | Compass rail, #7 (stays) |
| BulletinToolTabs (Dispatch/Notes/Gallery) | Author tier | **Compose tab** |
| TheEight / Top100Rail | Masthead cluster | **The Eight tab** (migrates in) |
| FlightographyModule + Contributions + ResearchStats | Profile tier | **Flightography tab** |
| ShareableProfileCard / TradingCard | Profile tier | **Card tab** |
| EndorsementWall | Left rail | **Return band** |
| Mail / Messages | Left rail | **Return band** |
| ClusterTierToggle (Author/Profile) | Pane header | **Retired** — replaced by 4 verb tabs |
| "Your next move" | — | **New** — top of pane |

> The masthead stays **pure identity** (the hero portrait: cover, avatar, name, headline, location, public URL, Update). The Eight migrates *out* of the masthead cluster into the journey pane where it belongs as an act, not chrome.

---

## 7. Governance & invariants preserved

- Identity header locked to position 1; verification to position 2. Unchanged.
- The Eight: 8 slots, public, ordered, empty slots render as visible placeholders. Vacancy is the CTA. Unchanged.
- Personal list entries carry zero measurement weight. Unchanged.
- Flightography renders below the fold (it's tab 3, below Compose and The Eight). Preserved.
- Influence tier bands visible, weights not. No scoring fields feed the "next move" logic (it reads only completion booleans, never transactional/payment/availability/sponsorship fields).
- Empty states are designed, not placeholder text.
- Personalization remains accent + ordering variants only; the four-tab structure is fixed (not Fellow-reorderable) since it's the journey spine.

---

## 8. Implementation phases

**Phase 1 — Tab spine (no module moves yet)**
- Replace `ClusterTierToggle` + two-tier render with a 4-tab verb nav: Compose / The Eight / Flightography / Card.
- Wire existing components into each tab (BulletinToolTabs → Compose; TheEight → The Eight; FlightographyModule → Flightography; TradingCard → Card).
- Keep the compass rail as the current 30% stack (Compose rail + leftRail) for now.

**Phase 2 — Compass rail curation**
- Reorder the 30% rail into the deliberate Act I sequence (Status → Season → Record → Network → Pinned/Newsletter → URL → Compose).
- Extract the relevant modules from `FellowLeftRail` into the ordered compass rail.

**Phase 3 — The "next move" engine**
- Build `NextMove` card: compute first-unfinished-step from profile completion booleans, render single CTA, wire to tab/composer/editor/share.

**Phase 4 — Return band**
- Move EndorsementWall + Community Bulletins preview + Mail into a band beneath the pane.

**Phase 5 — Masthead slimming**
- Migrate The Eight out of the masthead `InstrumentCluster` into the pane's "The Eight" tab; leave masthead as pure identity.

---

## 9. Open questions

1. **Eight in masthead vs pane** — confirm The Eight leaves the masthead cluster (recommended; it's an act, not identity chrome). If kept in masthead, the pane's "The Eight" tab links up instead of duplicating.
2. **Return band vs 5th tab** — horizontal band under the pane, or a 5th "Community" tab? Band keeps the journey verb set at 4 (cleaner); tab keeps everything in one nav. Recommend band.
3. **"Next move" persistence** — should acknowledging a step hide it, or just deprioritize? Recommend: satisfying it auto-advances (no dismiss button); the card always shows the current top unfinished step.