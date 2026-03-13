#!/usr/bin/env node
/**
 * Generates index.js barrel files for every feature folder under epics/ and capabilities/.
 * Safe to re-run: overwrites existing index.js files.
 *
 * Usage: node scripts/generate-barrels.mjs
 */

import { readdirSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS = join(__dirname, '..', 'src', 'components');

function getFeatureDirs(base) {
  const results = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(base, entry.name);
    const allEntries = readdirSync(full);
    // Skip if a hand-crafted index.jsx already exists (it owns its own barrel exports)
    if (allEntries.includes('index.jsx')) {
      results.push(...getFeatureDirs(full));
      continue;
    }
    // Check if this dir contains .jsx/.js files directly (leaf feature dir)
    const files = allEntries.filter(f => ['.jsx', '.js', '.tsx', '.ts'].includes(extname(f)) && f !== 'index.js');
    if (files.length > 0) results.push({ dir: full, files });
    // Always recurse to catch nested feature dirs
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
