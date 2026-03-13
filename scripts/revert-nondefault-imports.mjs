#!/usr/bin/env node
// Reverts barrel imports for components that don't have export default
// (i.e. aren't in the regenerated barrels) back to direct file imports.

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const COMPONENTS = join(SRC, 'components');

// Build map of what each barrel now exports
const barrelMap = new Map();

function walkBarrels(dir, rel) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      walkBarrels(full, r);
    } else if (e.name === 'index.js') {
      const content = readFileSync(full, 'utf-8');
      const names = new Set();
      for (const m of content.matchAll(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/g)) {
        names.add(m[1]);
      }
      const key = r.replace('/index.js', '').replace('index.js', '');
      if (names.size > 0) barrelMap.set(key, names);
    }
  }
}

walkBarrels(join(COMPONENTS, 'epics'), 'epics');
walkBarrels(join(COMPONENTS, 'capabilities'), 'capabilities');

// Walk all source files
function walkFiles(dir) {
  const results = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) results.push(...walkFiles(full));
    else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(e.name))) results.push(full);
  }
  return results;
}

// Match: import { Name } from '@/components/epics/.../feature'  (no trailing filename)
const RE = /import\s*\{\s*(\w+)\s*\}\s*from\s*'(@\/components\/(?:epics|capabilities)\/[^'\/]+(?:\/[^'\/]+)*?)'/g;

let fixed = 0;
let filesChanged = 0;

for (const file of walkFiles(SRC)) {
  const content = readFileSync(file, 'utf-8');
  let changed = false;

  const newContent = content.replace(RE, (match, name, barrelPath) => {
    const key = barrelPath.replace('@/components/', '');
    const exports = barrelMap.get(key);
    // If barrel doesn't export this name, revert to direct import
    if (!exports || !exports.has(name)) {
      changed = true;
      fixed++;
      const rel = file.replace(ROOT + '/', '');
      console.log(`REVERT: ${rel} — import { ${name} } from '${barrelPath}' → direct`);
      return `import ${name} from '${barrelPath}/${name}'`;
    }
    return match;
  });

  if (changed) {
    filesChanged++;
    writeFileSync(file, newContent, 'utf-8');
  }
}

console.log(`\nReverted ${fixed} imports across ${filesChanged} files.`);
