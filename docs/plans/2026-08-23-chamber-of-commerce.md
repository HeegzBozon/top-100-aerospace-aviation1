# Chamber of Commerce — Repositioning & Roadmap

**Date:** 2026-08-23
**Status:** Phase 1 (rename) shipped; vision captured for downstream phases.

## Premise

The operational cluster previously labeled ad-hoc (Bulletin Board / Conference Room / Backlog
as peer tabs with no parent) is repositioned as **the Chamber of Commerce** — the participation
and utility layer of the platform, sitting above the Fellow profile (Identity + Affiliation).

The destination is a **civic marketplace**: a reputation-gated, member-owned utility where
commerce happens *around* the institution, mediated by verification rather than by transaction.
Under that destination, "Chamber of Commerce" is the literal archetype, not a borrowed label.

## Governance invariant (the firewall)

> **The chamber convenes, verifies, and introduces. It never brokers, rates, or ranks by spend.**

Every commerce-adjacent feature must pass this test to enter the chamber. If a proposed feature
cannot be expressed as convene / verify / introduce, it does not get in.

This preserves the existing governance invariants:
- Discovery and directory ranking never read transaction, payment, availability, or sponsorship fields.
- Availability state never influences directory position.
- Commerce (the chamber) and measurement (discovery/scoring) stay on opposite sides of the firewall.

## The four chamber functions

| Function | Verb | Current surface | Future |
|-----------|------|-----------------|--------|
| Communicate | dispatch | Bulletin Board | — |
| Convene | show up | Conference Room (external authority events) | Ribbon Cuttings / Grand Openings (member-company milestones) |
| Build | prioritize | Backlog (strategic agenda) | Accelerator cohorts (ribbon cutting = cohort launch/graduation milestone) |
| Introduce | connect | Availability layer (profile-affiliated) | Job board; member services (consulting/agency) — introduction-only, zero take rate |

## Architecture decision: surface, not subsume

Availability's source of truth stays on the profile (identity-adjacent). The chamber's Introduce
function *reads* it; it does not own it. This keeps the firewall rule clean: availability is a
profile attribute, not a chamber-internal commerce signal. The chamber is the *venue* where
availability is exercised, not the *owner* of it.

## Phases

### Phase 1 — Chamber repositioning (shipped this turn)
- Cluster masthead renamed to "Chamber of Commerce" (persistent; the active feature is indicated
  by the switcher's active pill, no longer by the masthead label).
- `Building2` icon replaces the generic grid icon.
- The three tabs (Bulletin Board, Conference Room, Backlog) remain as the chamber's features.
- No entity, route, or behavior changes. Pure positioning.

### Phase 2 — Ribbon Cuttings / Grand Openings (planned)
- Activate the existing `Event.chamber_ritual` value `"Ribbon Cutting"` for member-company
  milestones (startup launches, demo days, accelerator cohort kickoffs/graduations).
- Reuse the Conference Room lifecycle (Upcoming → In Progress → Done) and convene pattern.
- Pair with `AcceleratorCohort` / `AcceleratorMilestone` entities already in the schema.
- A ribbon cutting is the *public milestone* where Build and Convene join.

### Phase 3 — Job board (planned)
- Chamber member utility. Member companies post; verified Fellows see.
- Pure utility, zero brokerage, no measurement entanglement.
- Likely a new `JobPosting`-shaped surface or activation of the existing `Job` entity, gated to
  verified members. No star ratings, no gig pricing, no take rate.

### Phase 4 — Member services reframing (planned)
- Reframe the existing service/availability machinery (`ServiceExchange`, `ServiceUnit`,
  `ProviderTier`, `ProviderVerification`, the "talent" component tree) as **chamber member
  services** — introduction-only, zero take rate, reputation-gated, no star ratings.
- Language audit: purge "gigs", "services", "freelance", star ratings from the availability layer
  per the brand guardrail. Reframe as member-to-member introductions.
- Availability stays a profile attribute the chamber surfaces (Phase 1 architecture decision).

## Scope guardrails (do not drift)
- Never let commerce features read from or write to measurement/scoring fields.
- Never introduce platform take rates, brokerage, or transaction-influenced ranking.
- Never use "followers/likes/rank-as-platform-verb/gigs/services/freelance/star ratings" language.
- Sponsor attribution remains "Patron of Record", never "Sponsored by".

## Touchpoints for Phase 1 (reference)
- `src/components/bulletin-board/BulletinBoardCluster.jsx` — masthead label + icon.
- `src/components/platform-board/BoardSwitcher.jsx` — feature switcher (labels unchanged; they are
  the chamber's features).
- `src/components/conference-room/ConferenceRoomView.jsx` — Conference Room feature (Convene).
- `src/components/platform-board/PlatformBoardView.jsx` — Backlog feature (Build).
- `src/pages/PlatformDevelopmentBoard.jsx` — standalone deep-link to the Backlog feature.