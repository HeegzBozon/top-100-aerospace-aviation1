# CLAUDE.md

Project conventions for Claude Code and contributors.

## Component Architecture

### 3-Tier Hierarchy

```
src/components/
  epics/          ← Tier 1: Jira epic buckets (01–08)
    NN-name/
      feature/    ← Tier 2: feature groupings within an epic
        *.jsx     ← Tier 3: individual components
  capabilities/   ← Shared cross-cutting components (not owned by one epic)
  ui/             ← shadcn primitives (DO NOT MODIFY)
  core/           ← ErrorBoundary, ThemeContext, appConfig
  layout/         ← App shell, nav, sidebar
  landing/        ← Marketing / pre-auth pages
  home/           ← Homepage composition widgets
```

### Decision Rule: Where Does a New Component Go?

| Question | Answer | Location |
|---|---|---|
| Does it belong to exactly one epic? | Yes | `epics/NN-name/feature/` |
| Is it shared across multiple epics? | Yes | `capabilities/` |
| Is it a primitive UI element (button, input, etc.)? | Yes | `ui/` — shadcn only, do not add here |

### Epic → Jira Mapping

| Folder | Jira Epic | Description |
|---|---|---|
| `epics/01-index-engine/` | PLATFORM-1 | Index Engine |
| `epics/02-signal-feed/` | PLATFORM-2 | Signal Feed |
| `epics/03-mission-rooms/` | PLATFORM-3 | Mission Rooms |
| `epics/04-project-containers/` | PLATFORM-4 | Project Containers |
| `epics/05-rapid-response-cells/` | PLATFORM-5 | Rapid Response Cells |
| `epics/06-nomination-engine/` | PLATFORM-6 | Nomination Engine |
| `epics/07-endorsement-system/` | PLATFORM-7 | Endorsement System |
| `epics/08-sponsor-commercial/` | PLATFORM-8 | Sponsor & Commercial Layer |

### Import Convention

Always import from the **barrel** (`index.js` at the feature folder level), never from a direct file path.

```js
// CORRECT — import from the barrel
import { ProfileCard } from '@/components/epics/01-index-engine/profiles'
import { SignalFeed } from '@/components/epics/02-signal-feed/feed'
import { ChatPanel } from '@/components/capabilities/comms'

// WRONG — do not import direct file paths
import { ProfileCard } from '@/components/epics/01-index-engine/profiles/ProfileCard'
```

### How to Add a New Component

1. **Determine placement** using the decision rule above.
2. **Create the file** in the appropriate feature folder:
   ```
   src/components/epics/03-mission-rooms/events/AfterpartyBanner.jsx
   ```
3. **Export it from the feature barrel** (`index.js` in that folder):
   ```js
   // src/components/epics/03-mission-rooms/events/index.js
   export { AfterpartyBanner } from './AfterpartyBanner'
   ```
4. **Import via the barrel** in consuming files:
   ```js
   import { AfterpartyBanner } from '@/components/epics/03-mission-rooms/events'
   ```

### What NOT to Do

- **Do not add components to `ui/`** — that folder is reserved for shadcn primitives only.
- **Do not import direct file paths** — always go through the barrel `index.js`.
- **Do not place epic-specific components in `capabilities/`** — if it only belongs to one epic, keep it in `epics/`.
- **Do not create new top-level folders** under `src/components/` without team discussion.
