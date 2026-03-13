# Pages Directory Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize `src/pages/` from 129 flat files into an epic/capability hierarchy mirroring the component structure, without changing any URL routes.

**Architecture:** A Node.js migration script moves all page files into their new subdirectories and rewrites `src/pages.config.js` import paths in one pass. Routing keys (and therefore URLs) stay identical — only file locations change. `pages.config.js` becomes manually maintained (the auto-generated header is replaced with a manual maintenance note).

**Tech Stack:** Node.js (ESM), `fs`, `path` — no external dependencies.

---

### Task 1: Write the migration script

**Files:**
- Create: `scripts/migrate-pages.mjs`

**Context:**
- The design doc is at `docs/plans/2026-03-13-pages-directory-restructure-design.md` — full migration map is there.
- `src/pages.config.js` imports pages as `import X from './pages/X'`. After migration, moved pages import as `import X from './pages/epics/01-index-engine/X'` etc. Root pages stay as `./pages/X`.
- `pages.config.js` has a large auto-generated comment block (lines 1–49) that must be replaced with a manual maintenance note.
- Supports `--dry-run` flag (prints moves without executing).

**Step 1: Create the script**

```js
#!/usr/bin/env node
/**
 * Migrates src/pages/ from flat structure to epic/capability hierarchy.
 * Moves files and rewrites pages.config.js import paths.
 *
 * Usage:
 *   node scripts/migrate-pages.mjs --dry-run
 *   node scripts/migrate-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const CONFIG_FILE = join(ROOT, 'src', 'pages.config.js');

const DRY_RUN = process.argv.includes('--dry-run');

// Maps filename (without .jsx) → new subdirectory under src/pages/
// Files NOT in this map stay at src/pages/ root.
const MIGRATION_MAP = {
  // EPIC 01 — Index Engine
  'Profile':              'epics/01-index-engine',
  'ProfileView':          'epics/01-index-engine',
  'PublicProfile':        'epics/01-index-engine',
  'UserProfile':          'epics/01-index-engine',
  'EditProfile':          'epics/01-index-engine',
  'ClaimProfile':         'epics/01-index-engine',
  'Biographer':           'epics/01-index-engine',
  'Passport':             'epics/01-index-engine',
  'TalentExchange':       'epics/01-index-engine',
  'TalentExchangeLanding':'epics/01-index-engine',
  'TalentLanding':        'epics/01-index-engine',
  'SMEPortal':            'epics/01-index-engine',
  'MentorPortal':         'epics/01-index-engine',
  'AlumniRadar':          'epics/01-index-engine',
  'AlumniInResearch':     'epics/01-index-engine',
  'RadarDashboard':       'epics/01-index-engine',
  'RadarIntelligence':    'epics/01-index-engine',
  'StartupDirectory':     'epics/01-index-engine',
  'Demographics':         'epics/01-index-engine',

  // EPIC 02 — Signal Feed
  'SignalFeed':           'epics/02-signal-feed',
  'SignalAnalytics':      'epics/02-signal-feed',
  'SignalSearch':         'epics/02-signal-feed',
  'SignalTimeline':       'epics/02-signal-feed',
  'SignalReview':         'epics/02-signal-feed',
  'SignalEmbed':          'epics/02-signal-feed',
  'SignalEngineRoadmap':  'epics/02-signal-feed',
  'TrendingSignals':      'epics/02-signal-feed',
  'Article':              'epics/02-signal-feed',
  'Articles':             'epics/02-signal-feed',
  'SpaceNews':            'epics/02-signal-feed',
  'LaunchParty':          'epics/02-signal-feed',

  // EPIC 03 — Mission Rooms
  'MissionControl':       'epics/03-mission-rooms',
  'Quests':               'epics/03-mission-rooms',
  'HabitWizard':          'epics/03-mission-rooms',
  'GamesHub':             'epics/03-mission-rooms',
  'GamesLanding':         'epics/03-mission-rooms',
  'Arcade':               'epics/03-mission-rooms',
  'Play':                 'epics/03-mission-rooms',
  'TheHangar':            'epics/03-mission-rooms',
  'ChessClub':            'epics/03-mission-rooms',
  'ChessGame':            'epics/03-mission-rooms',
  'Arena':                'epics/03-mission-rooms',
  'Events':               'epics/03-mission-rooms',
  'EventPage':            'epics/03-mission-rooms',
  'DemoDayEvent':         'epics/03-mission-rooms',
  'Festival':             'epics/03-mission-rooms',
  'Afterparty':           'epics/03-mission-rooms',
  'GatherSpace':          'epics/03-mission-rooms',
  'Huddle':               'epics/03-mission-rooms',
  'Season4':              'epics/03-mission-rooms',
  'RaisingJupiter':       'epics/03-mission-rooms',

  // EPIC 04 — Project Containers
  'ClientDashboard':      'epics/04-project-containers',
  'EmployerDashboard':    'epics/04-project-containers',
  'FounderDashboard':     'epics/04-project-containers',
  'IntelligenceDashboard':'epics/04-project-containers',
  'InvestorDashboard':    'epics/04-project-containers',
  'ProviderDashboard':    'epics/04-project-containers',
  'PIPlanner':            'epics/04-project-containers',
  'FundraisingTracker':   'epics/04-project-containers',
  'CapitalExchange':      'epics/04-project-containers',
  'SWE5TestArchitecture': 'epics/04-project-containers',
  'SWE6QualificationPlan':'epics/04-project-containers',
  'SYS4IntegrationPlan':  'epics/04-project-containers',
  'SYS5SystemValidation': 'epics/04-project-containers',

  // EPIC 05 — Rapid Response Cells
  'HypeSquad':            'epics/05-rapid-response-cells',
  'HypeSquadWizard':      'epics/05-rapid-response-cells',
  'MilestoneDetail':      'epics/05-rapid-response-cells',
  'RecruitmentRun':       'epics/05-rapid-response-cells',
  'AcceleratorHub':       'epics/05-rapid-response-cells',

  // EPIC 06 — Nomination Engine
  'Nominations':          'epics/06-nomination-engine',
  'Nominee':              'epics/06-nomination-engine',
  'BatchNominations':     'epics/06-nomination-engine',
  'HowWePick':            'epics/06-nomination-engine',
  'Top100Nominees2025':   'epics/06-nomination-engine',
  'Top100Women2025':      'epics/06-nomination-engine',
  'Top100OS':             'epics/06-nomination-engine',
  'NomineesByDomain':     'epics/06-nomination-engine',
  'ArchiveLanding':       'epics/06-nomination-engine',
  'BallotBox':            'epics/06-nomination-engine',
  'RankedChoice':         'epics/06-nomination-engine',
  'VotingHub':            'epics/06-nomination-engine',
  'ResultsCountdown':     'epics/06-nomination-engine',

  // EPIC 07 — Endorsement System
  'Endorse':              'epics/07-endorsement-system',

  // EPIC 08 — Sponsor & Commercial
  'Sponsors':             'epics/08-sponsor-commercial',
  'SponsorPitch':         'epics/08-sponsor-commercial',
  'SponsorResources':     'epics/08-sponsor-commercial',
  'Tips':                 'epics/08-sponsor-commercial',
  'PayoutDashboard':      'epics/08-sponsor-commercial',
  'PayoutSettings':       'epics/08-sponsor-commercial',
  'PaymentCancel':        'epics/08-sponsor-commercial',
  'PaymentSuccess':       'epics/08-sponsor-commercial',
  'Shop':                 'epics/08-sponsor-commercial',

  // Capabilities — admin
  'Admin':                'capabilities/admin',
  'AdminAction':          'capabilities/admin',
  'FactoryReset':         'capabilities/admin',

  // Capabilities — calendar
  'Calendar':             'capabilities/calendar',
  'MyBookings':           'capabilities/calendar',
  'MyFavorites':          'capabilities/calendar',

  // Capabilities — comms
  'Comms':                'capabilities/comms',

  // Capabilities — onboarding
  'GetStarted':           'capabilities/onboarding',
  'InvestorOnboarding':   'capabilities/onboarding',
  'FounderApplication':   'capabilities/onboarding',
  'ProviderApplication':  'capabilities/onboarding',
  'AvailabilitySettings': 'capabilities/onboarding',

  // Capabilities — services/marketplace
  'JobDetail':                  'capabilities/services',
  'ServiceDetail':              'capabilities/services',
  'ServiceCategories':          'capabilities/services',
  'ServicePackagesMarketplace': 'capabilities/services',
  'ServicesLanding':            'capabilities/services',
  'CompareServices':            'capabilities/services',
  'ProviderInbox':              'capabilities/services',

  // Capabilities — resources
  'BusinessResources':    'capabilities/resources',
  'CareerResources':      'capabilities/resources',
  'EnterpriseResources':  'capabilities/resources',
  'HonoreeResources':     'capabilities/resources',
  'NomineeResources':     'capabilities/resources',
  'StudentResources':     'capabilities/resources',
  'FounderResources':     'capabilities/resources',

  // Capabilities — support
  'HelpCenter':           'capabilities/support',
  'Feedback':             'capabilities/support',

  // Capabilities — membership
  'Membership':           'capabilities/membership',
};

// Root pages (stay flat — NOT in MIGRATION_MAP):
// Home, Home2, Landing, NotFound, About, OriginStory, MissionVisionValues, PrivacyPolicy

console.log(DRY_RUN ? '\n=== DRY RUN ===\n' : '\n=== EXECUTING ===\n');

let moved = 0;

// 1. Move files
for (const [name, subdir] of Object.entries(MIGRATION_MAP)) {
  const src = join(PAGES_DIR, `${name}.jsx`);
  const destDir = join(PAGES_DIR, subdir);
  const dest = join(destDir, `${name}.jsx`);

  if (!existsSync(src)) {
    console.warn(`  SKIP (not found): ${name}.jsx`);
    continue;
  }

  console.log(`  MOVE: pages/${name}.jsx → pages/${subdir}/${name}.jsx`);

  if (!DRY_RUN) {
    mkdirSync(destDir, { recursive: true });
    renameSync(src, dest);
  }
  moved++;
}

console.log(`\n${moved} files ${DRY_RUN ? 'would be' : ''} moved.\n`);

if (DRY_RUN) {
  console.log('Re-run without --dry-run to apply.');
  process.exit(0);
}

// 2. Rewrite pages.config.js
let config = readFileSync(CONFIG_FILE, 'utf-8');

// Replace auto-generated header with manual maintenance note
const AUTO_GENERATED_HEADER = /\/\*\*[\s\S]*?\*\/\n/;
const MANUAL_HEADER = `/**
 * pages.config.js - Page routing configuration
 *
 * MANUALLY MAINTAINED. The @base44/vite-plugin does not auto-discover pages
 * in subdirectories — only the top-level pages/ folder is scanned.
 * When adding a new page, import it here and add it to the PAGES object.
 *
 * Routing keys (e.g. "Profile") determine the URL path (e.g. /Profile).
 * To change the main/landing page, update mainPage below.
 */\n`;

config = config.replace(AUTO_GENERATED_HEADER, MANUAL_HEADER);

// Rewrite import paths for moved files
for (const [name, subdir] of Object.entries(MIGRATION_MAP)) {
  const oldImport = `from './pages/${name}'`;
  const newImport = `from './pages/${subdir}/${name}'`;
  config = config.replace(oldImport, newImport);
}

writeFileSync(CONFIG_FILE, config, 'utf-8');
console.log('pages.config.js rewritten.\n');
console.log('Done. Verify with: npm run build');
```

**Step 2: Commit the script**

```bash
git add scripts/migrate-pages.mjs
git commit -m "chore: add migrate-pages script (dry-run only, not executed yet)"
```

---

### Task 2: Dry-run the migration

**Files:**
- Read only (no changes)

**Step 1: Run dry-run**

```bash
node scripts/migrate-pages.mjs --dry-run
```

Expected output: 121 files listed as `MOVE: pages/X.jsx → pages/epics/.../X.jsx` (or `capabilities/...`). No `SKIP` entries — all 121 mapped files exist. The 8 root files (Home, Home2, Landing, NotFound, About, OriginStory, MissionVisionValues, PrivacyPolicy) are NOT listed because they stay in place.

If you see any `SKIP (not found)` lines, the filename in MIGRATION_MAP doesn't match the actual file — fix the typo in the script before proceeding.

---

### Task 3: Execute the migration

**Files:**
- Move: all files in MIGRATION_MAP
- Modify: `src/pages.config.js`

**Step 1: Execute**

```bash
node scripts/migrate-pages.mjs
```

Expected: "121 files moved." + "pages.config.js rewritten."

**Step 2: Spot-check pages.config.js**

Open `src/pages.config.js` and verify:
- The old auto-generated comment block is gone, replaced with the manual maintenance note
- A few spot-check imports look correct, e.g.:
  - `import Profile from './pages/epics/01-index-engine/Profile'` ✅
  - `import Admin from './pages/capabilities/admin/Admin'` ✅
  - `import Home from './pages/Home'` ✅ (root, unchanged)

**Step 3: Commit**

```bash
git add src/pages/ src/pages.config.js
git commit -m "refactor: reorganize pages/ to mirror Jira epic structure

- Move 121 page files into epics/ and capabilities/ subdirectories
- 8 global pages (Home, Landing, NotFound, etc.) stay at root
- pages.config.js manually maintained going forward (base44 plugin
  does not scan subdirectories)
- All routing keys and URL routes unchanged"
```

---

### Task 4: Verify the build

**Files:**
- Read only

**Step 1: Run the build**

```bash
npm run build
```

Expected: build completes with no errors. Vite may print some warnings about bundle size — those are fine. Any `Cannot find module` errors mean a file wasn't moved or an import wasn't rewritten — fix those before proceeding.

**Step 2: Start the dev server and spot-check**

```bash
npm run dev
```

Open `http://localhost:5173` — the app should load. Navigate to a few routes manually (e.g. `/Profile`, `/Admin`, `/SignalFeed`) and confirm they render without errors.

**Step 3: Commit if any fixes were needed**

If you had to fix any import issues:

```bash
git add -A
git commit -m "fix: correct import paths after pages migration"
```

---

### Task 5: Push to GitHub

**Step 1: Push**

```bash
git push origin main
```

Expected: push succeeds, no conflicts.
