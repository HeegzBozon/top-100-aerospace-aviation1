#!/usr/bin/env node
// ── BALLOT PARITY CHECK ─────────────────────────────────────────────────────
//
// The monitors disagreed once because the units of a ballot were written down twice: one
// table called a sitting five marks, the other seven, and each surface divided a total by
// whatever figure it happened to hold. Nothing in the build could catch that, because both
// halves were legal code.
//
// This check is the guard. It reads the two places the units are declared — the client's
// canonical module (src/lib/ballotMeasurement.js) and the server's (base44/shared/
// ballotMeasurement.ts) — and fails if they have drifted apart, then fails again if a
// monitor surface has started keeping a target table or a divisor of its own.
//
// Run: npm run check:ballot

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

const failures = [];
const fail = (message) => failures.push(message);

// The three units both sides must agree on, read as written.
const UNITS = ['CARDS_PER_SITTING', 'MARKS_PER_SITTING', 'NOMINEE_TOUCHES_PER_MARK'];

function unitsIn(path) {
  const source = read(path);
  const found = {};
  for (const name of UNITS) {
    const match = source.match(new RegExp(`export const ${name}\\s*=\\s*(\\d+)`));
    if (!match) fail(`${path} no longer declares ${name}.`);
    else found[name] = Number(match[1]);
  }
  return found;
}

const client = unitsIn('src/lib/ballotMeasurement.js');
const server = unitsIn('base44/shared/ballotMeasurement.ts');

for (const name of UNITS) {
  if (client[name] !== undefined && server[name] !== undefined && client[name] !== server[name]) {
    fail(`${name} has drifted: client says ${client[name]}, server says ${server[name]}.`);
  }
}

// A sitting has to add up to what the recorder actually writes, and the recorder is the only
// authority on that: the number of neutrals a set carries is guarded in the function itself,
// and the pairs it applies follow from that guard. This is the check that would have caught
// five marks in the writer against seven in the reading — the whole of the split the two
// monitors once reported.
function recordedSitting() {
  const path = 'base44/functions/submitAnchorVote/entry.ts';
  const source = read(path);

  const guard = source.match(/neutrals\.length\s*!==\s*(\d+)/);
  if (!guard) {
    fail(`${path} no longer guards the neutral count, so a set's shape can no longer be read.`);
    return null;
  }

  // Each neutral is weighed against the top, and each neutral against the bottom.
  const perNeutral = (source.match(/neutrals\.forEach\(\(nid\)\s*=>\s*apply\(/g) || []).length;
  // The top is weighed against the bottom once.
  const once = (source.match(/^\s*apply\([^)]*\);\s*$/gm) || []).length;

  if (!perNeutral || !once) {
    fail(`${path} no longer applies its pairs where this check reads them.`);
    return null;
  }

  const neutrals = Number(guard[1]);
  return {
    cards: neutrals + 2,
    marks: neutrals * perNeutral + once,
    from: `${neutrals} neutrals, ${perNeutral} pair${perNeutral === 1 ? '' : 's'} each, ${once} more`,
  };
}

const recorded = recordedSitting();
if (recorded) {
  if (recorded.marks !== client.MARKS_PER_SITTING) {
    fail(
      `The recorder writes ${recorded.marks} marks to a sitting (${recorded.from}), but ` +
        `MARKS_PER_SITTING is ${client.MARKS_PER_SITTING}.`
    );
  }
  if (recorded.cards !== client.CARDS_PER_SITTING) {
    fail(
      `The recorder sets ${recorded.cards} cards to a sitting, but CARDS_PER_SITTING is ` +
        `${client.CARDS_PER_SITTING}.`
    );
  }
}

// The surfaces that read a ballot. None of them may hold a target table, a per-set figure
// or a divisor: every figure has to arrive from the canonical module.
const SURFACES = [
  'src/components/voting/monitor/SignalProgress.jsx',
  'src/components/voting/LiveBallotFeed.jsx',
  'src/components/admin/selection/SignalProgress.jsx',
  'src/components/admin/selection/MonitorStats.jsx',
];

// Anything that looks like a local unit or a local target.
const FORBIDDEN = [
  { pattern: /COMPARISONS_PER_SET/, why: 'a per-set figure of its own' },
  { pattern: /SIGNAL_TARGETS|SIGNAL_SCENARIOS/, why: 'a target table of its own' },
  { pattern: /appearances:\s*\d+/, why: 'a card-appearance target of its own' },
  { pattern: /\/\s+5\b(?!\d)/, why: 'a division by a hard-coded five-mark set' },
];

for (const path of SURFACES) {
  if (!existsSync(join(root, path))) {
    fail(`${path} is missing. Update this check if the surface was renamed.`);
    continue;
  }
  const source = read(path);
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(source)) {
      fail(`${path} keeps ${rule.why}. Read it from src/lib/ballotMeasurement.js instead.`);
    }
  }
}

if (existsSync(join(root, 'src/components/admin/selection/signalConfig.js'))) {
  fail('src/components/admin/selection/signalConfig.js is back. There is one target table, in the canonical module.');
}

if (failures.length) {
  console.error('Ballot parity check failed:\n');
  failures.forEach((message) => console.error(`  • ${message}`));
  console.error('\nOne definition, one table: src/lib/ballotMeasurement.js and base44/shared/ballotMeasurement.ts.');
  process.exit(1);
}

console.log(
  `Ballot parity holds — ${client.CARDS_PER_SITTING} cards, ${client.MARKS_PER_SITTING} marks, ` +
    `${client.NOMINEE_TOUCHES_PER_MARK} nominee touches per mark, read from one module by every monitor.`
);