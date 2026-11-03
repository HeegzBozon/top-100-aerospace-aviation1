// THE CABINET BADGES.
//
// A second collection, kept apart from the six Discovery Stamps. These are struck at the
// machines in the east wing: they live on the device the way a house record does, they are
// gameplay only, and no part of them is ever read by discovery, measurement, ranking,
// directory placement or recognition.
const KEY = 'arcade-progress-v1';
const CHANGED = 'arcade-progress';

export const ARCADE_XP_PER_PLAY = 15;
export const ARCADE_XP_PLAYS_CAP = 20;
export const ARCADE_XP_SORTIE = 60;

const blank = () => ({ plays: {}, records: {}, sorties: 0 });

export function readProgress() {
  try {
    const held = JSON.parse(localStorage.getItem(KEY) || 'null');
    return held && typeof held === 'object' ? { ...blank(), ...held } : blank();
  } catch {
    return blank();
  }
}

function writeProgress(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // A machine with no store keeps no cabinet badge.
  }
  try {
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // nothing listening, nothing to tell
  }
  return next;
}

export { CHANGED as ARCADE_PROGRESS_EVENT };

export const playsOf = (p) => Object.values(p?.plays || {}).reduce((t, n) => t + (n || 0), 0);
export const recordsOf = (p) => p?.records || {};

// The three scored cabinets, and the fourth machine — the simulator — which keeps no score.
export const SCORED_CABINETS = ['sentinel', 'belt-run', 'guardian'];

// The collection. Each badge names the machine or the habit it was struck for.
export const ARCADE_BADGES = [
  { id: 'insert-coin', label: 'Insert Coin', blurb: 'Take any machine in the east wing.', icon: 'gamepad',
    earnt: (p) => playsOf(p) >= 1 },
  { id: 'line-holder', label: 'Line Holder', blurb: 'Set a record on Sentinel.', icon: 'shield',
    earnt: (p) => (recordsOf(p).sentinel || 0) > 0 },
  { id: 'belt-runner', label: 'Belt Runner', blurb: 'Set a record on Belt Run.', icon: 'rocket',
    earnt: (p) => (recordsOf(p)['belt-run'] || 0) > 0 },
  { id: 'sky-guard', label: 'Sky Guard', blurb: 'Set a record on Guardian.', icon: 'trophy',
    earnt: (p) => (recordsOf(p).guardian || 0) > 0 },
  { id: 'hall-sweep', label: 'Hall Sweep', blurb: 'Play all three cabinets and the simulator.', icon: 'layers',
    earnt: (p) => SCORED_CABINETS.every((id) => (p?.plays?.[id] || 0) > 0) && (p?.plays?.['the-sim'] || 0) > 0 },
  { id: 'first-sortie', label: 'First Sortie', blurb: 'Take the simulator up.', icon: 'plane',
    earnt: (p) => (p?.sorties || 0) >= 1 },
  { id: 'season-ticket', label: 'Season Ticket', blurb: 'Ten turns at the cabinets.', icon: 'sparkle',
    earnt: (p) => playsOf(p) >= 10 },
];

export const earnedIds = (p) => ARCADE_BADGES.filter((b) => b.earnt(p)).map((b) => b.id);

// Campus XP from the hall. Small, capped, and added to the quest XP the passport derives.
export function arcadeXpOf(p) {
  const plays = Math.min(playsOf(p), ARCADE_XP_PLAYS_CAP) * ARCADE_XP_PER_PLAY;
  return plays + ((p?.sorties || 0) > 0 ? ARCADE_XP_SORTIE : 0);
}

// The East Wing quests are not given by a character: they complete themselves the moment
// the milestone is struck at a machine, so the passport reads the hall without polling it.
export const ARCADE_MILESTONES = {
  q13: (p) => playsOf(p) >= 1,
  q14: (p) => SCORED_CABINETS.some((id) => (recordsOf(p)[id] || 0) > 0),
  q15: (p) => (p?.sorties || 0) >= 1,
};

export const arcadeQuestDone = (id) => {
  const test = ARCADE_MILESTONES[id];
  return test ? test(readProgress()) : false;
};

export function notePlay(cabinetId) {
  if (!cabinetId) return readProgress();
  const p = readProgress();
  return writeProgress({ ...p, plays: { ...p.plays, [cabinetId]: (p.plays[cabinetId] || 0) + 1 } });
}

export function noteRecord(cabinetId, score) {
  if (!cabinetId || !Number.isFinite(score) || score <= 0) return readProgress();
  const p = readProgress();
  const best = Math.max(p.records[cabinetId] || 0, Math.floor(score));
  return writeProgress({ ...p, records: { ...p.records, [cabinetId]: best } });
}

export function noteSortie() {
  const p = readProgress();
  return writeProgress({ ...p, sorties: (p.sorties || 0) + 1 });
}

export function clearProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
  try {
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // nothing listening
  }
}