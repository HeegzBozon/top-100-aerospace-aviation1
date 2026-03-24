CLAUDE.md — TOP 100 Aerospace & Aviation Platform

This file is the harness context layer for AI agents operating on this codebase. Read this before touching any code. It is Stripe's rule file equivalent for this repo.

## What This Platform Is

TOP 100 Aerospace & Aviation is a reputation-weighted professional network and index for women in aerospace and aviation. It is not a social network. It is an institutional record — built on governance, tier-based authority, and archival permanence.

Core concepts every agent must understand:

- **Honorees** — verified professionals recognized by the community. The central entity.
- **Tiers** — 7-band influence system: Observer → Member → Verified Contributor → Honoree → Senior Honoree → Institutional Partner → Governing Council. Tier determines what a user can see, do, and create.
- **Endorsements** — structured credits (not likes). Each endorsement carries domain, type, and tier weight. They compound into a reputation score.
- **Feed** — reputation-weighted signal feed. Content ranked by author tier, content type, endorsement count, and recency. Not chronological.
- **Mission Rooms** — time-bound, objective-driven collaboration spaces. Not chat rooms.
- **Project Containers** — Basecamp-style execution containers with milestones, deliverables, roles, and sponsor visibility.
- **Authority Pieces** — the highest-signal content type. Long-form, tier-gated, archived as institutional record.
- **Sponsors** — patrons of record. They do not influence rankings. Governance is firewalled from commercial layer.

**MVP Launch Target: May 20, 2026**

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Base44 managed backend (entities, backend functions, integrations) |
| Data layer | Base44 SDK — entities defined in `entities/`, backend logic in `functions/` |
| Auth | Base44 managed auth |
| Repo sync | GitHub ↔ Base44 bidirectional sync |
| Styling | Tailwind only — no inline styles, no custom CSS unless design system requires it |

## Project Structure

```
src/
  pages/          ← Route-level views (thin — orchestrate, don't compute)
  components/     ← Reusable UI components (dumb by default — data in, events out)
  api/            ← Base44 SDK calls and entity queries
  hooks/          ← Custom React hooks for shared stateful logic
  lib/            ← Utility libraries
  utils/          ← Helper functions
entities/         ← Data model definitions
functions/        ← Serverless backend function definitions
```

## Code Retrieval — jCodemunch MCP

Use `jcodemunch-mcp` for all code lookups. Never read full files when MCP is available.

**Boot sequence (every session):**

1. Call `list_repos` — if the project is not indexed, call `index_folder` with the current directory
2. Use `search_symbols` / `get_symbol` to find and retrieve code by symbol name
3. Use `get_repo_outline` or `get_file_outline` to explore structure before diving in
4. Fall back to direct file reads only when editing or when MCP is unavailable

Never open an entire file just to find one function. Query by symbol first.

## Architecture Rules (Non-Negotiable)

1. Frontend/backend boundary is the Base44 SDK. Data logic goes in backend functions, not components.
2. Entities are the source of truth. Never duplicate entity state in component-level `useState`.
3. Pages are thin. They orchestrate. They don't compute or fetch directly.
4. Components are dumb by default. Data in, events out. No entity fetches inside components unless via a custom hook.
5. Every async operation has a loading state. No exceptions.
6. Error boundaries on everything that fetches external data.
7. Never write to `main` directly. Always on a feature branch. Branch naming: `feature/PLATFORM-{id}-{slug}`.

## Coding Standards

- Tailwind only for styling
- React hooks for shared stateful logic
- No `useEffect` without a dependency array
- No missing `key` props in lists
- No optimistic UI without error rollback
- Backend functions must have single responsibility
- Entity schema changes require a migration plan — flag before implementing

## Failure Modes to Flag on Sight

- Entity fetches inside render without `useEffect`
- `useEffect` with no dependency array (infinite loop risk)
- Data logic in page components
- Inline styles or custom CSS without design system justification
- PR against `main` without a feature branch

## Tier System (Reference)

```
Tier 0 — Observer              (public, read-only)
Tier 1 — Member                (basic access)
Tier 2 — Verified Contributor  (can post, endorse, create Mission Rooms)
Tier 3 — Honoree               (verified aerospace/aviation professional)
Tier 4 — Senior Honoree        (multi-cycle, high endorsement score)
Tier 5 — Institutional Partner (org-level membership)
Tier 6 — Governing Council     (platform governance authority)
```

Tier gates are enforced at the backend function level — never trust frontend-only checks.

## Governance Rules (Critical)

- Sponsors do not influence ranking outcomes
- Sponsor commercial layer is firewalled from selection panel
- Ranking formulas are not exposed publicly — influence tier bands are visible, weights are not
- Archival records are immutable once finalized per cycle
- Rapid Response Cells require Tier 4+ or Governing Council authorization to activate

## Epic Dependency Chain

```
EPIC-1 (Index Layer)          ← Build first. Blocks everything.
  ↓
EPIC-2 (Feed Layer)           ← Depends on EPIC-1
  ↓
EPIC-3 (Mission Rooms)        ← Depends on EPIC-1 + EPIC-2
  ↓
EPIC-4 (Project Containers)   ← Depends on EPIC-1 + EPIC-2 + EPIC-3
  ↓
EPIC-5 (Rapid Response Cells) ← Depends on EPIC-1 + EPIC-2 + EPIC-4
EPIC-8 (Sponsor Layer)        ← Depends on EPIC-1
```

Do not implement stories whose epic dependencies are incomplete. Check linked tickets for `AI:Skip` label before starting any story.

## Jira Harness Labels

| Label | Meaning |
|---|---|
| `AI:Ready` | Safe to execute — no blocking dependencies |
| `AI:InProgress` | Agent is currently running on this ticket |
| `AI:Review` | PR open, awaiting human review |
| `AI:Skip` | Do not execute — blocked or not yet ready |

**Harness workflow:**

1. Fetch tickets labeled `AI:Ready` from PLATFORM project
2. Read ticket description + linked tickets for full context
3. Check epic dependency chain above before starting
4. If ticket not in active sprint → move to active sprint
5. Move ticket label from `AI:Ready` → `AI:InProgress` + Update Jira status → In Progress
6. Implement on branch `feature/PLATFORM-{id}-{slug}`
7. Open PR → add PR link as comment to Jira ticket
8. Move ticket label from `AI:InProgress` → `AI:Review`
9. Move Jira status → Test
10. Wait for human review before merging

## Board Governance

### WIP Limits

| Column | Max | Notes |
|---|---|---|
| DEFINE | 2 | Don't let planning pile up |
| READY | 5 | Groomed sprint buffer — not infinite backlog |
| BUILD | 3 | One per concurrent thread max |
| REVIEW | 2 | REVIEW + AI:REVIEW statuses both count against this |
| TEST | 2 | Don't let verified work rot waiting for deploy |

Limits are enforced via Jira column constraints. Harness must check WIP before pulling a new ticket — if BUILD ≥ 3, halt and surface to human.

### Stage Gates

Work cannot advance to the next column without meeting the gate.

| From → To | Gate |
|---|---|
| DEFINE → READY | Acceptance criteria written. Entity schema identified. No open architectural questions. |
| READY → BUILD | Feature branch created (`feature/PLATFORM-{id}-{slug}`). Never on `main`. |
| BUILD → REVIEW | Code complete. Compiles. No lint errors. PR opened. PR link on Jira ticket. |
| REVIEW → TEST | PR approved (human) or AI:Review cleared. No unresolved comments. |
| TEST → DEPLOYED | All acceptance criteria verified. Happy path smoke test passes. No regressions. |

Harness must not transition a ticket past a gate it cannot verify. If blocked, comment + apply `AI:Skip`.

### Definition of Done

A ticket is **DONE** when it is **DEPLOYED** — defined as all three:

1. **Merged to `main`** — PR merged, branch deleted
2. **Pushed to Base44 production** — GitHub sync confirmed in Base44 editor
3. **Smoke-verified live** — happy path works end-to-end in the running app

Not merged ≠ Done. Not synced ≠ Done. Not verified ≠ Done.
Any ticket moved to DEPLOYED without all three is a false close — flag it.

## Key Routes (Current)

```
/profiles/:id          ← Unified honoree profile (role-based views)
/sponsors/:sponsor_id  ← Sponsor patron-of-record page
/feed                  ← Reputation-weighted signal feed
/missions/:id          ← Mission Room
/projects/:id          ← Project Container
```

Legacy routes being deprecated: `/Profile`, `/PublicProfile`, `/Nominee`
Active migration: PLATFORM-66

## Brand & Tone

- Institutional, not social
- Authority-first, not engagement-first
- Blues + institutional palette
- Never "followers" — always "endorsers" or "community"
- Never "likes" — always "endorsements"
- Sponsor attribution: "Patron of Record" not "Sponsored by [advertiser]"

## Contact / Escalate

If a ticket is ambiguous, underdefined, or blocked by a missing dependency:

- Do NOT guess or proceed
- Add a comment to the Jira ticket describing the blocker
- Apply `AI:Skip` label
- Stop and surface to human review

---

*Last updated: March 2026 (Board Governance added) | Project: pineappleempire-team.atlassian.net | PLATFORM project*
