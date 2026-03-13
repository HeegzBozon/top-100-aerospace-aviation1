#!/usr/bin/env node
/**
 * Consolidates direct-file component imports to barrel (folder-level) imports.
 *
 * Converts:
 *   import ProfileCard from '@/components/epics/01-index-engine/profiles/ProfileCard'
 * To:
 *   import { ProfileCard } from '@/components/epics/01-index-engine/profiles'
 *
 * Usage:
 *   node scripts/consolidate-imports.mjs --dry-run
 *   node scripts/consolidate-imports.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const COMPONENTS = join(SRC, 'components');

const DRY_RUN = process.argv.includes('--dry-run');

// Build a set of all barrel-exported names per folder
// e.g. { 'epics/01-index-engine/profiles': Set(['ProfileCard', 'NomineeGrid', ...]) }
function buildBarrelMap() {
  const map = new Map();

  function walk(dir, rel = '') {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, relPath);
      } else if (entry.name === 'index.js') {
        const content = readFileSync(full, 'utf-8');
        const names = new Set();
        // Match: export { default as SomeName } from './SomeName'
        for (const m of content.matchAll(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/g)) {
          names.add(m[1]);
        }
        if (names.size > 0) map.set(rel, names);
      }
    }
  }

  walk(join(COMPONENTS, 'epics'), 'epics');
  walk(join(COMPONENTS, 'capabilities'), 'capabilities');
  return map;
}

// Walk all source files
function walkFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full));
    else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(entry.name))) results.push(full);
  }
  return results;
}

// Regex: import DefaultName from '@/components/epics/.../FileName'
// Groups: [1]=identifier, [2]=folder path (without filename), [3]=filename
const IMPORT_RE = /import\s+(\w+)\s+from\s+'(@\/components\/(?:epics|capabilities)\/[^']+\/(\w+))'/g;

const barrelMap = buildBarrelMap();

console.log(DRY_RUN ? '\n=== DRY RUN ===\n' : '\n=== EXECUTING ===\n');
console.log(`Barrel folders indexed: ${barrelMap.size}`);

let totalRewrites = 0;
let totalFiles = 0;
let skipped = 0;

for (const file of walkFiles(SRC)) {
  let content = readFileSync(file, 'utf-8');
  let changed = false;

  const newContent = content.replace(IMPORT_RE, (match, identifier, fullPath, filename) => {
    // Only rewrite if identifier matches filename exactly
    if (identifier !== filename) {
      skipped++;
      return match;
    }

    // Derive the folder key (strip @/components/ prefix and /filename suffix)
    const folderKey = fullPath
      .replace('@/components/', '')
      .replace(`/${filename}`, '');

    // Only rewrite if a barrel exists and exports this name
    const barrel = barrelMap.get(folderKey);
    if (!barrel || !barrel.has(identifier)) {
      skipped++;
      return match;
    }

    totalRewrites++;
    changed = true;
    const newImport = `import { ${identifier} } from '@/components/${folderKey}'`;
    const rel = file.replace(ROOT + '/', '');
    console.log(`  ${rel}: ${identifier} → barrel`);
    return newImport;
  });

  if (changed) {
    totalFiles++;
    if (!DRY_RUN) writeFileSync(file, newContent, 'utf-8');
  }
}

console.log(`\nDone. ${totalRewrites} imports rewritten across ${totalFiles} files. ${skipped} skipped (aliased or not in barrel).`);
if (DRY_RUN) console.log('Re-run without --dry-run to apply.');
