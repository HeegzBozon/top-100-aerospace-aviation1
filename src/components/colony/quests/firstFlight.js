// The First Flight (TOP100-NARRATIVE-001). A gameplay journey only: nothing here is read by
// measurement, scoring, directory placement or recognition, and the practice ballot is a
// tutorial that never reaches the official system.
import { PATHWAYS, ORIGIN } from './discovery';

export const REWARDS = {
  innovation: { label: 'Innovation Stamp', kind: 'stamp' },
  exploration: { label: 'Exploration Stamp', kind: 'stamp' },
  leadership: { label: 'Leadership Stamp', kind: 'stamp' },
  storytelling: { label: 'Storytelling Stamp', kind: 'stamp' },
  opportunity: { label: 'Opportunity Stamp', kind: 'stamp' },
  connection: { label: 'Connection Stamp', kind: 'stamp' },
  partnership: { label: 'Partnership Emblem', kind: 'emblem' },
  legacy: { label: 'Legacy Emblem', kind: 'emblem' },
  passport: { label: 'Campus Passport', kind: 'item' },
  wings: { label: 'Wings of Recognition', kind: 'wings' },
};

export const STAMPS = ['innovation', 'exploration', 'leadership', 'storytelling', 'opportunity', 'connection'];

// Each quest: who gives it, where, the line they say, and the choice that completes it.
export const QUESTS = [
  { id: 'q01', act: 1, npc: 'founder', place: 'Main Entrance', title: 'Aloha, Adventurer!', reward: 'passport',
    line: 'Aloha! This campus is a community shaping the future of flight. Take this Campus Passport. Walk with the arrows or the wheel, and press the centre at any door.',
    prompt: 'What brings you to the TOP 100 Universe?', choices: [...PATHWAYS.map(x => x.label), 'Just exploring'] },
  { id: 'q02', act: 1, npc: 'atlas', place: 'Main Campus', title: 'Find Your Bearings',
    line: 'Navigation online. Six districts surround this hall: the Expo, the Space Pavilion, the Summit, the Media Hub, the Career Center and the Lounge.',
    prompt: 'Select your first destination.', choices: ['Innovation Expo', 'Space Pavilion', 'Leadership Summit', 'Media Hub', 'Career Center', 'Networking Lounge'],
    rooms: ['innovation-expo', 'space-pavilion', 'leadership-summit', 'media-hub', 'career-center', 'networking-lounge'] },
  { id: 'q03', act: 1, npc: 'quinn', also: 'vera', place: 'Main Entrance', title: 'Every Voice Matters',
    line: 'Vera reviews nominations; I keep the ballot. Try a practice ballot. It is a tutorial only and never counts toward official results.',
    prompt: 'Practice ballot: which matters most when you weigh a nominee?', choices: ['Verified impact on the field', 'How many people know their name', 'Who nominated them'],
    correct: 0, explain: 'Verified impact. The institution measures the record, not popularity.' },
  { id: 'q04', act: 2, npc: 'nova', place: 'Innovation Expo', title: 'The Spark of Tomorrow', reward: 'innovation',
    line: 'Three breakthroughs are on the floor today: hydrogen propulsion, autonomous air traffic and reusable launch.',
    prompt: 'Choose the innovation that interests you most.', choices: ['Hydrogen propulsion', 'Autonomous air traffic', 'Reusable launch'] },
  { id: 'q05', act: 2, npc: 'orion', place: 'Space Pavilion', title: 'Beyond the Horizon', reward: 'exploration',
    line: 'Plan a mission with me. Artemis II carries a crew around the Moon; that is your milestone today.',
    prompt: 'Mission planning: what launches first?', choices: ['Crew and life support checks', 'The press release', 'The souvenir patch'], correct: 0,
    explain: 'Crew and systems first. Every mission starts with readiness.' },
  { id: 'q06', act: 2, npc: 'athena', place: 'Leadership Summit', title: 'The Leadership Signal', reward: 'leadership',
    line: 'Leadership is measured by what we make possible for others. Pick the principle you will carry out of this room.',
    prompt: 'Select a leadership principle.', choices: ['Make room for others', 'Own the hard call', 'Teach what you know'] },
  { id: 'q07', act: 2, npc: 'echo', place: 'Media Hub', title: 'Stories That Soar', reward: 'storytelling',
    line: 'Every honoree has a story on the record. Choose one kind to add to your passport collection.',
    prompt: 'Add a story to your collection.', choices: ['A first in flight', 'A mission that nearly failed', 'A mentor who opened the door'] },
  { id: 'q08', act: 2, npc: 'scout', place: 'Career Center', title: 'Your Next Mission', reward: 'opportunity',
    line: 'Three pathways run through this center: engineering, operations and entrepreneurship.',
    prompt: 'Bookmark one pathway.', choices: ['Engineering', 'Operations', 'Entrepreneurship'] },
  { id: 'q09', act: 2, npc: 'skye', place: 'Networking Lounge', title: 'Connections Across the Sky', reward: 'connection',
    line: 'Our community guidelines are simple: be generous, be specific, ask before you introduce. Introducing yourself is always optional.',
    prompt: 'Which guideline will you keep first?', choices: ['Be generous', 'Be specific', 'Ask before I introduce'] },
  { id: 'q10', act: 3, npc: 'sterling', place: 'Leadership Summit', title: 'Building Better Futures', reward: 'partnership',
    line: 'Organizations support TOP 100 as Sponsors of Record. Their support funds programs; it never buys placement.',
    prompt: 'Which community initiative would you learn about?', choices: ['Scholarships', 'Conference rooms', 'The archive'] },
  { id: 'q11', act: 3, npc: 'aurora', place: 'Media Hub', title: 'The Hall of Legends', reward: 'legacy',
    line: 'Recognition here is a measured record, kept across every season. Past honorees stand in this plaza.',
    prompt: 'What does recognition represent?', choices: ['A verified record of impact', 'A popularity contest', 'A paid placement'], correct: 0,
    explain: 'A verified record. Recognition is measured, never bought.' },
  { id: 'q12', act: 4, npc: 'founder', place: 'Main Entrance', title: 'The First Flight Ceremony', reward: 'wings', finale: true,
    line: 'Atlas confirms six Discovery Stamps and two emblems. Welcome, Campus Explorer. These Wings are a gameplay achievement, not an official TOP 100 honoree designation.',
    prompt: 'Accept your Wings?', choices: ['Accept the Wings of Recognition'] },
  ...ORIGIN,
];

export const ACTS = { 1: 'Act I · Welcome to the Universe', 2: 'Act II · The Six Districts', 3: 'Act III · The Legacy of Flight', 4: 'Act IV · Earn Your Wings', 5: 'Arc II · The Origin Story' };

export const isDone = (p, id) => !!p?.quests?.[id];
export const earned = (p) => QUESTS.filter(q => q.reward && isDone(p, q.id)).map(q => q.reward);
export const finaleReady = (p) => QUESTS.filter(q => q.id !== 'q12' && REWARDS[q.reward]?.kind !== 'item')
  .filter(q => q.reward).every(q => isDone(p, q.id));
export const stampCount = (p) => STAMPS.filter(s => earned(p).includes(s)).length;

// Why a quest can't start yet, or null when it can.
export function lockReason(p, q) {
  if (q.id !== 'q01' && !isDone(p, 'q01')) return 'Meet the Founder at the Main Entrance first.';
  if (q.finale && !finaleReady(p)) return 'Collect all six Discovery Stamps and both emblems first.';
  // The Origin Story opens after Echo's First Flight step, or at once for a storyteller.
  if (q.act === 5 && !isDone(p, 'q07') && !(p?.pathways || []).includes('story')) return 'Visit Echo in the Media Hub first.';
  return null;
}

// The quest a character currently offers, if any.
export const questFor = (npcId, p) => QUESTS.find(q => (q.npc === npcId || q.also === npcId) && !isDone(p, q.id));

export function title(p) {
  if (isDone(p, 'q12')) return 'Campus Explorer';
  return Object.keys(p?.quests || {}).length ? 'Explorer' : 'Visitor';
}

// The next step to show on the tracker.
// Campus XP: gameplay only, derived from completed quests, never stored or measured.
export const XP_PER_LEVEL = 300;
export const questXp = (q) => 100 + (q.reward && REWARDS[q.reward]?.kind !== 'item' ? 50 : 0) + (q.finale ? 250 : 0);
export function xpOf(p) {
  // Each Star Atlas star lit adds 40 XP.
  const xp = QUESTS.filter(q => isDone(p, q.id)).reduce((t, q) => t + questXp(q), 0) + Object.keys(p?.stars || {}).length * 40;
  return { xp, level: Math.floor(xp / XP_PER_LEVEL) + 1, into: xp % XP_PER_LEVEL };
}
export const nextQuest = (p) => QUESTS.find(q => !isDone(p, q.id) && !lockReason(p, q)) || null;