# Component Directory Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize `src/components/` to mirror the 8 Jira epics (PLATFORM-1 through PLATFORM-8) plus a shared capabilities layer.

**Architecture:** All component files move to `epics/<n>-<name>/<feature>/` or `capabilities/<name>/`. All imports use the `@/components/` alias (confirmed from codebase), so import rewriting is simple string replacement. Each feature folder gets an `index.js` barrel for stable imports going forward.

**Tech Stack:** React, Vite, `@/` path alias pointing to `src/`, Node.js scripts for migration.

**Design doc:** `docs/plans/2026-03-12-component-directory-restructure-design.md`

---

## Task 1: Check for filename conflicts before migrating

Multiple old directories merge into single new ones (e.g. `profile/` + `biographer/` + `passport/` → `profiles/`). Conflicts must be resolved manually before running the script.

**Files:**
- Run: `src/components/` (read-only scan)

**Step 1: Run the conflict checker**

```bash
node -e "
const fs = require('fs');
const path = require('path');

const MERGES = [
  ['profile', 'biographer', 'passport'],
  ['talent', 'sme'],
  ['leaderboard', 'standings', 'graph'],
  ['knowledge-graph', 'wiki'],
  ['signals'],
  ['launches'],
  ['publication', 'space'],
  ['missions', 'quests'],
  ['games', 'chess', 'arena'],
  ['events', 'afterparty', 'festival'],
  ['dashboard'],
  ['pi'],
  ['capital'],
  ['hypesquad'],
  ['rituals'],
  ['rrf'],
  ['nominations', 'submit'],
  ['voting'],
  ['scoring'],
  ['endorse'],
  ['sponsors'],
  ['payout'],
  ['tips'],
  ['chat', 'comms', 'notifications'],
  ['onboarding', 'linkedin'],
  ['calendar'],
  ['forum'],
  ['cards'],
  ['admin'],
  ['public'],
  ['hooks'],
  ['contexts'],
];

const base = 'src/components';
let hasConflict = false;

for (const group of MERGES) {
  const seen = {};
  for (const dir of group) {
    const full = path.join(base, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of fs.readdirSync(full)) {
      if (seen[file]) {
        console.log('CONFLICT:', file, 'in', seen[file], 'and', dir);
        hasConflict = true;
      } else {
        seen[file] = dir;
      }
    }
  }
}

if (!hasConflict) console.log('No conflicts found. Safe to migrate.');
"
```

**Step 2: Resolve any conflicts manually**

If conflicts are found, rename files in one of the source directories before proceeding. Naming convention: prefix with the old folder name (e.g. `BiographerProfileCard.jsx`).

**Step 3: Re-run until output is "No conflicts found. Safe to migrate."**

---

## Task 2: Create the migration script

**Files:**
- Create: `scripts/migrate-components.mjs`

**Step 1: Create the `scripts/` directory**

```bash
mkdir -p scripts
```

**Step 2: Write the script**

Create `scripts/migrate-components.mjs`:

```js
#!/usr/bin/env node
/**
 * Component directory migration script.
 * Moves files to new epic/capability structure and rewrites @/components/ imports.
 *
 * Usage:
 *   node scripts/migrate-components.mjs --dry-run   (preview only)
 *   node scripts/migrate-components.mjs             (execute)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, renameSync, existsSync, rmdirSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMPONENTS = join(ROOT, 'src', 'components');
const SRC = join(ROOT, 'src');

const DRY_RUN = process.argv.includes('--dry-run');

// Full migration map: old dir (relative to src/components/) → new dir
const MIGRATION_MAP = {
  // EPIC-1: Index Engine
  'profile':         'epics/01-index-engine/profiles',
  'biographer':      'epics/01-index-engine/profiles',
  'passport':        'epics/01-index-engine/profiles',
  'talent':          'epics/01-index-engine/talent',
  'sme':             'epics/01-index-engine/talent',
  'leaderboard':     'epics/01-index-engine/discovery',
  'standings':       'epics/01-index-engine/discovery',
  'graph':           'epics/01-index-engine/discovery',
  'knowledge-graph': 'epics/01-index-engine/knowledge',
  'wiki':            'epics/01-index-engine/knowledge',

  // EPIC-2: Signal Feed
  'signals':         'epics/02-signal-feed/feed',
  'launches':        'epics/02-signal-feed/launches',
  'publication':     'epics/02-signal-feed/publication',
  'space':           'epics/02-signal-feed/publication',

  // EPIC-3: Mission Rooms
  'missions':        'epics/03-mission-rooms/missions',
  'quests':          'epics/03-mission-rooms/missions',
  'games':           'epics/03-mission-rooms/games',
  'chess':           'epics/03-mission-rooms/games',
  'arena':           'epics/03-mission-rooms/games',
  'events':          'epics/03-mission-rooms/events',
  'afterparty':      'epics/03-mission-rooms/events',
  'festival':        'epics/03-mission-rooms/events',

  // EPIC-4: Project Containers
  'dashboard':       'epics/04-project-containers/dashboard',
  'pi':              'epics/04-project-containers/planning',
  'capital':         'epics/04-project-containers/capital',

  // EPIC-5: Rapid Response Cells
  'hypesquad':       'epics/05-rapid-response-cells/hypesquad',
  'rituals':         'epics/05-rapid-response-cells/rituals',
  'rrf':             'epics/05-rapid-response-cells/rrf',

  // EPIC-6: Nomination Engine
  'nominations':     'epics/06-nomination-engine/nominations',
  'submit':          'epics/06-nomination-engine/nominations',
  'voting':          'epics/06-nomination-engine/voting',
  'scoring':         'epics/06-nomination-engine/scoring',

  // EPIC-7: Endorsement System
  'endorse':         'epics/07-endorsement-system/endorse',

  // EPIC-8: Sponsor & Commercial Layer
  'sponsors':        'epics/08-sponsor-commercial/sponsors',
  'payout':          'epics/08-sponsor-commercial/payout',
  'tips':            'epics/08-sponsor-commercial/tips',

  // Capabilities
  'chat':            'capabilities/comms',
  'comms':           'capabilities/comms',
  'notifications':   'capabilities/comms',
  'onboarding':      'capabilities/onboarding',
  'linkedin':        'capabilities/onboarding',
  'calendar':        'capabilities/calendar',
  'forum':           'capabilities/forum',
  'cards':           'capabilities/cards',
  'admin':           'capabilities/admin',
  'public':          'capabilities/public',
  'hooks':           'capabilities/hooks',
  'contexts':        'capabilities/contexts',
};

// ── Step 1: Move files ────────────────────────────────────────────────────────

console.log(DRY_RUN ? '\n=== DRY RUN: no files will be moved or written ===\n' : '\n=== EXECUTING MIGRATION ===\n');

for (const [oldDir, newDir] of Object.entries(MIGRATION_MAP)) {
  const oldPath = join(COMPONENTS, oldDir);
  const newPath = join(COMPONENTS, newDir);

  if (!existsSync(oldPath)) {
    console.log(`SKIP (not found): ${oldDir}`);
    continue;
  }

  const files = readdirSync(oldPath);
  console.log(`MOVE: components/${oldDir}/ → components/${newDir}/ (${files.length} files)`);

  if (!DRY_RUN) {
    mkdirSync(newPath, { recursive: true });
    for (const file of files) {
      renameSync(join(oldPath, file), join(newPath, file));
    }
    rmdirSync(oldPath);
  }
}

// ── Step 2: Rewrite imports ───────────────────────────────────────────────────

function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(entry.name))) results.push(full);
  }
  return results;
}

let totalFiles = 0;
let updatedFiles = 0;

for (const file of walkFiles(SRC)) {
  totalFiles++;
  let content = readFileSync(file, 'utf-8');
  let changed = false;

  for (const [oldDir, newDir] of Object.entries(MIGRATION_MAP)) {
    const oldImport = `@/components/${oldDir}/`;
    const newImport = `@/components/${newDir}/`;
    if (content.includes(oldImport)) {
      content = content.replaceAll(oldImport, newImport);
      changed = true;
    }
  }

  if (changed) {
    updatedFiles++;
    const rel = file.replace(ROOT + '/', '');
    console.log(`UPDATE imports: ${rel}`);
    if (!DRY_RUN) writeFileSync(file, content, 'utf-8');
  }
}

console.log(`\nDone. ${updatedFiles}/${totalFiles} files had imports updated.`);
if (DRY_RUN) console.log('Re-run without --dry-run to apply changes.');
```

---

## Task 3: Dry-run the migration

**Step 1: Run in dry-run mode**

```bash
node scripts/migrate-components.mjs --dry-run
```

Expected output: lists every file move and every import update — no files are changed.

**Step 2: Review the output**

Scan for anything unexpected:
- Files listed under the wrong epic
- Import paths that look wrong
- Any `SKIP (not found)` lines for directories you expected to exist (check for typos in the map)

Fix any issues in `scripts/migrate-components.mjs` before proceeding.

---

## Task 4: Execute the migration

**Step 1: Run the migration**

```bash
node scripts/migrate-components.mjs
```

Expected: same output as dry-run but files are now moved and imports rewritten.

**Step 2: Verify the directory structure was created**

```bash
find src/components/epics -type d | sort
find src/components/capabilities -type d | sort
```

Expected: all 8 epic folders with their feature subdirectories, plus all capability folders.

**Step 3: Verify old directories are gone**

```bash
ls src/components/
```

Expected: only `epics/`, `capabilities/`, `ui/`, `core/`, `layout/`, `landing/`, `home/`, `icons.jsx` remain.

---

## Task 5: Verify the build

**Step 1: Run the Vite build**

```bash
npm run build 2>&1 | head -60
```

Expected: build completes with no errors. Warnings about unused variables are OK.

**Step 2: If build fails, fix broken imports**

Build errors will show the exact file and missing import. Common causes:
- A file was imported with a path like `@/components/profile` (no trailing slash, no filename) — these won't be caught by the script. Fix manually.
- Relative imports inside components (e.g. `import X from '../profile/Y'`) — fix by changing to `@/components/epics/01-index-engine/profiles/Y`.

Run `npm run build` again after each fix until it passes.

**Step 3: Scan for any remaining old-path imports**

```bash
grep -r "@/components/profile/" src/ --include="*.jsx" --include="*.js" -l
grep -r "@/components/signals/" src/ --include="*.jsx" --include="*.js" -l
grep -r "@/components/nominations/" src/ --include="*.jsx" --include="*.js" -l
```

Expected: no output (all old paths have been rewritten).

---

## Task 6: Handle the `performance/` directory

The `performance/` directory components (`LazyLoadWrapper.jsx`, `VirtualizedList.jsx`, `usePerformanceMonitor.jsx`) live inside `src/components/public/` mixed with public-facing components. They need to be separated.

**Step 1: Create the performance capability directory**

```bash
mkdir -p src/components/capabilities/performance
```

**Step 2: Move the performance files**

```bash
mv src/components/capabilities/public/LazyLoadWrapper.jsx src/components/capabilities/performance/
mv src/components/capabilities/public/VirtualizedList.jsx src/components/capabilities/performance/
mv src/components/capabilities/public/usePerformanceMonitor.jsx src/components/capabilities/performance/
```

**Step 3: Rewrite the three affected imports**

```bash
grep -r "LazyLoadWrapper\|VirtualizedList\|usePerformanceMonitor" src/ --include="*.jsx" --include="*.js" -l
```

For each file listed, update the import path from `capabilities/public/` to `capabilities/performance/`.

**Step 4: Run the build again**

```bash
npm run build 2>&1 | head -30
```

Expected: no new errors.

---

## Task 7: Add barrel index files

Each feature folder gets an `index.js` that re-exports all components. This ensures future imports are stable at the folder level.

**Step 1: Write the barrel generator script**

Create `scripts/generate-barrels.mjs`:

```js
#!/usr/bin/env node
/**
 * Generates index.js barrel files for every feature folder under epics/ and capabilities/.
 * Safe to re-run: overwrites existing index.js files.
 *
 * Usage: node scripts/generate-barrels.mjs
 */

import { readdirSync, writeFileSync, statSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS = join(__dirname, '..', 'src', 'components');

function getFeatureDirs(base) {
  const results = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(base, entry.name);
    // Check if this is a leaf feature dir (contains .jsx/.js files directly)
    const files = readdirSync(full).filter(f => ['.jsx', '.js', '.tsx', '.ts'].includes(extname(f)) && f !== 'index.js');
    if (files.length > 0) results.push({ dir: full, files });
    // Also recurse
    results.push(...getFeatureDirs(full));
  }
  return results;
}

const epicsBase = join(COMPONENTS, 'epics');
const capsBase = join(COMPONENTS, 'capabilities');

const allDirs = [...getFeatureDirs(epicsBase), ...getFeatureDirs(capsBase)];

for (const { dir, files } of allDirs) {
  const rel = dir.replace(COMPONENTS + '/', '');
  const exports = files.map(f => {
    const name = basename(f, extname(f));
    return `export { default as ${name} } from './${name}';`;
  }).join('\n');

  const indexPath = join(dir, 'index.js');
  writeFileSync(indexPath, exports + '\n', 'utf-8');
  console.log(`Generated: components/${rel}/index.js (${files.length} exports)`);
}

console.log(`\nDone. ${allDirs.length} barrel files generated.`);
```

**Step 2: Run the generator**

```bash
node scripts/generate-barrels.mjs
```

Expected: prints one line per feature directory. No errors.

**Step 3: Verify a sample barrel file looks correct**

```bash
cat src/components/epics/01-index-engine/profiles/index.js
```

Expected: one `export { default as X } from './X'` line per component in that folder.

---

## Task 8: Final verification

**Step 1: Run the full build**

```bash
npm run build 2>&1
```

Expected: exits with code 0, no errors.

**Step 2: Run the dev server and spot-check**

```bash
npm run dev
```

Open the app in a browser and click through a few pages to confirm nothing is visually broken.

**Step 3: Verify the final directory tree matches the design**

```bash
find src/components -type d | sort
```

Compare against the tree in `docs/plans/2026-03-12-component-directory-restructure-design.md`.

**Step 4: Confirm no stale old-path imports remain**

```bash
node -e "
const { readdirSync, readFileSync } = require('fs');
const { join, extname } = require('path');

const OLD_DIRS = ['profile','biographer','passport','talent','sme','leaderboard','standings','graph','knowledge-graph','wiki','signals','launches','publication','space','missions','quests','games','chess','arena','events','afterparty','festival','dashboard','pi','capital','hypesquad','rituals','rrf','nominations','submit','voting','scoring','endorse','sponsors','payout','tips','chat','comms','notifications','onboarding','linkedin','calendar','forum','cards','admin','public','hooks','contexts'];

function walk(dir) {
  const r = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) r.push(...walk(f));
    else if (['.js','.jsx','.ts','.tsx'].includes(extname(e.name))) r.push(f);
  }
  return r;
}

let found = false;
for (const file of walk('src')) {
  const content = readFileSync(file, 'utf-8');
  for (const dir of OLD_DIRS) {
    if (content.includes('@/components/' + dir + '/')) {
      console.log('STALE IMPORT in', file, '→', dir);
      found = true;
    }
  }
}
if (!found) console.log('All clean — no stale imports found.');
"
```

Expected: `All clean — no stale imports found.`
