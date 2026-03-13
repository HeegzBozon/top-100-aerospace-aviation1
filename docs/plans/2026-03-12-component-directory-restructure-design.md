# Component Directory Restructure Design

**Date:** 2026-03-12
**Goal:** Align `src/components/` folder structure with the PRD/Jira epic hierarchy.

---

## Motivation

The current structure has 565 component files across 65 loosely-named directories that don't map to the product roadmap. This makes it hard for developers to know where to find or place components. The new structure mirrors the 8 Jira epics (PLATFORM-1 through PLATFORM-8) so the codebase and PRD stay in sync.

---

## New Directory Tree

```
src/components/
  epics/
    01-index-engine/
      profiles/         ← profile/, biographer/, passport/
      talent/           ← talent/, sme/
      discovery/        ← leaderboard/, standings/, graph/
      knowledge/        ← knowledge-graph/, wiki/

    02-signal-feed/
      feed/             ← signals/
      launches/         ← launches/
      publication/      ← publication/, space/

    03-mission-rooms/
      missions/         ← missions/, quests/
      games/            ← games/, chess/, arena/
      events/           ← events/, afterparty/, festival/

    04-project-containers/
      dashboard/        ← dashboard/
      planning/         ← pi/
      capital/          ← capital/

    05-rapid-response-cells/
      hypesquad/        ← hypesquad/
      rituals/          ← rituals/
      rrf/              ← rrf/

    06-nomination-engine/
      nominations/      ← nominations/, submit/
      voting/           ← voting/
      scoring/          ← scoring/

    07-endorsement-system/
      endorse/          ← endorse/

    08-sponsor-commercial/
      sponsors/         ← sponsors/
      payout/           ← payout/
      tips/             ← tips/

  capabilities/
    comms/              ← chat/, comms/, notifications/
    onboarding/         ← onboarding/, linkedin/
    calendar/           ← calendar/
    forum/              ← forum/
    cards/              ← cards/
    admin/              ← admin/
    public/             ← public/ (unauthenticated CTAs)
    performance/        ← LazyLoadWrapper, VirtualizedList, usePerformanceMonitor
    hooks/              ← hooks/, components/hooks/
    contexts/           ← contexts/

  ui/                   ← UNCHANGED (shadcn primitives)
  core/                 ← UNCHANGED (ErrorBoundary, ThemeContext, appConfig)
  layout/               ← UNCHANGED (app shell, nav, sidebar)
  landing/              ← UNCHANGED (marketing/pre-auth pages)
  home/                 ← UNCHANGED (homepage composition widgets)
  icons.jsx             ← UNCHANGED
```

---

## Migration Map (old → new)

| Old path | New path |
|----------|----------|
| `components/profile/` | `components/epics/01-index-engine/profiles/` |
| `components/biographer/` | `components/epics/01-index-engine/profiles/` |
| `components/passport/` | `components/epics/01-index-engine/profiles/` |
| `components/talent/` | `components/epics/01-index-engine/talent/` |
| `components/sme/` | `components/epics/01-index-engine/talent/` |
| `components/leaderboard/` | `components/epics/01-index-engine/discovery/` |
| `components/standings/` | `components/epics/01-index-engine/discovery/` |
| `components/graph/` | `components/epics/01-index-engine/discovery/` |
| `components/knowledge-graph/` | `components/epics/01-index-engine/knowledge/` |
| `components/wiki/` | `components/epics/01-index-engine/knowledge/` |
| `components/signals/` | `components/epics/02-signal-feed/feed/` |
| `components/launches/` | `components/epics/02-signal-feed/launches/` |
| `components/publication/` | `components/epics/02-signal-feed/publication/` |
| `components/space/` | `components/epics/02-signal-feed/publication/` |
| `components/missions/` | `components/epics/03-mission-rooms/missions/` |
| `components/quests/` | `components/epics/03-mission-rooms/missions/` |
| `components/games/` | `components/epics/03-mission-rooms/games/` |
| `components/chess/` | `components/epics/03-mission-rooms/games/` |
| `components/arena/` | `components/epics/03-mission-rooms/games/` |
| `components/events/` | `components/epics/03-mission-rooms/events/` |
| `components/afterparty/` | `components/epics/03-mission-rooms/events/` |
| `components/festival/` | `components/epics/03-mission-rooms/events/` |
| `components/dashboard/` | `components/epics/04-project-containers/dashboard/` |
| `components/pi/` | `components/epics/04-project-containers/planning/` |
| `components/capital/` | `components/epics/04-project-containers/capital/` |
| `components/hypesquad/` | `components/epics/05-rapid-response-cells/hypesquad/` |
| `components/rituals/` | `components/epics/05-rapid-response-cells/rituals/` |
| `components/rrf/` | `components/epics/05-rapid-response-cells/rrf/` |
| `components/nominations/` | `components/epics/06-nomination-engine/nominations/` |
| `components/submit/` | `components/epics/06-nomination-engine/nominations/` |
| `components/voting/` | `components/epics/06-nomination-engine/voting/` |
| `components/scoring/` | `components/epics/06-nomination-engine/scoring/` |
| `components/endorse/` | `components/epics/07-endorsement-system/endorse/` |
| `components/sponsors/` | `components/epics/08-sponsor-commercial/sponsors/` |
| `components/payout/` | `components/epics/08-sponsor-commercial/payout/` |
| `components/tips/` | `components/epics/08-sponsor-commercial/tips/` |
| `components/chat/` | `components/capabilities/comms/` |
| `components/comms/` | `components/capabilities/comms/` |
| `components/notifications/` | `components/capabilities/comms/` |
| `components/onboarding/` | `components/capabilities/onboarding/` |
| `components/linkedin/` | `components/capabilities/onboarding/` |
| `components/calendar/` | `components/capabilities/calendar/` |
| `components/forum/` | `components/capabilities/forum/` |
| `components/cards/` | `components/capabilities/cards/` |
| `components/admin/` | `components/capabilities/admin/` |
| `components/public/` | `components/capabilities/public/` |
| `components/hooks/` | `components/capabilities/hooks/` |
| `components/contexts/` | `components/capabilities/contexts/` |

---

## Import Rewrite Strategy

1. **Build a path map** — a Node script generates a JSON map of every file's old absolute path → new absolute path.
2. **Dry-run rewrite** — use the map to preview all `import` changes across `src/` before committing.
3. **Apply rewrite** — update all import statements in one pass (via `jscodeshift` or a simple `sed`/regex script).
4. **Barrel index files** — each feature folder gets an `index.js` that re-exports all components, so future imports are stable at the folder level:
   ```js
   // epics/01-index-engine/profiles/index.js
   export { default as ProfileCard } from './ProfileCard'
   export { default as NomineeGrid } from './NomineeGrid'
   ```

---

## Execution Order

Migrate one epic at a time to keep changes reviewable and CI green throughout:

1. EPIC-1: Index Engine
2. EPIC-2: Signal Feed
3. EPIC-3: Mission Rooms
4. EPIC-4: Project Containers
5. EPIC-5: Rapid Response Cells
6. EPIC-6: Nomination Engine
7. EPIC-7: Endorsement System
8. EPIC-8: Sponsor & Commercial Layer
9. Capabilities layer
10. Verify build, fix any remaining broken imports

---

## What Stays Untouched

- `src/components/ui/` — shadcn primitives
- `src/components/core/` — ErrorBoundary, ThemeContext, appConfig
- `src/components/layout/` — app shell, nav, sidebar
- `src/components/landing/` — marketing/pre-auth pages
- `src/components/home/` — homepage composition widgets
- `src/components/icons.jsx`
- `src/pages/` — no changes to pages
- `src/hooks/`, `src/lib/`, `src/utils/`, `src/api/` — no changes
