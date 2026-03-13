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
