// The cast's shared mission brief: one private read of what the player has chosen to share,
// held as a gentle SWOT so every character can offer the right next question at the right
// time. Built only from the passport and the player's own profile gaps. It is a guide for
// the player, never a judgment, and is never read by measurement, scoring or selection.
import { PATHWAYS, pathwayLabel } from './quests/discovery';
import { DISCOVERY_FIELDS } from './conciergeDiscovery';

const shared = (p) => Object.values(p?.discoveries || {}).filter(d => d.status !== 'declined');

export function buildBrief(passport, missingFields = []) {
  const items = shared(passport);
  const pathways = passport?.pathways || [];
  return {
    strengths: items.filter(d => d.status === 'approved' || d.status === 'saved').map(d => `${d.label}: ${d.value}`),
    opportunities: pathways.map(k => PATHWAYS.find(p => p.key === k)).filter(Boolean).map(p => `${p.label} (${p.place})`),
    gaps: [
      ...missingFields.map(k => DISCOVERY_FIELDS[k]?.label).filter(Boolean),
      ...(!items.some(d => d.prompt_key) ? ['Origin story'] : []),
    ],
    pending: items.filter(d => d.status === 'pending').length,
    pathways,
  };
}

// Plain-language summary handed to the concierge, so it knows what the cast knows.
export const briefSummary = (b) => !b ? 'No passport yet.' : [
  `Shared strengths: ${b.strengths.join('; ') || 'none yet'}.`,
  `Chosen pathways: ${b.pathways.map(pathwayLabel).join(', ') || 'none yet'}.`,
  `Open gaps the player may want help with: ${b.gaps.join(', ') || 'none'}.`,
  b.pending ? `${b.pending} discovery item(s) are waiting for the player's review.` : '',
].filter(Boolean).join(' ');

// Which gap each character is the right one to raise, and where the answer goes.
const COACHING = [
  { npc: 'echo', gap: 'Origin story', line: 'Your record has no origin story yet. Want to sit for a short interview?', action: { key: '__brief', label: 'Begin my origin story', panel: 'quest' } },
  { npc: 'scout', gap: 'What I want to work on next', line: 'I can help you put the work you want next into words.', action: { key: '__brief', label: 'Talk it through with the concierge', panel: 'concierge' } },
  { npc: 'skye', gap: "Who I'd like to meet", line: "Who would you most like to meet here? Saying it helps the right introductions find you.", action: { key: '__brief', label: 'Name who I want to meet', panel: 'concierge' } },
  { npc: 'founder', gap: 'About me', line: 'Your record could use a few words about what drives you.', action: { key: '__brief', label: 'Write my About me with the concierge', panel: 'concierge' } },
  { npc: 'echo', gap: 'Six word story', line: 'Every career fits in six words. Want to find yours?', action: { key: '__brief', label: 'Find my six words', panel: 'concierge' } },
];

// The one right-time prompt a character offers, or null. Pending reviews come first.
export function coachingFor(npcId, brief) {
  if (!brief) return null;
  if (npcId === 'founder' && brief.pending) {
    return { line: `You have ${brief.pending} item(s) waiting in your passport. Nothing reaches your record until you approve it.`, action: { key: '__brief', label: 'Review my passport', panel: 'passport' } };
  }
  return COACHING.find(c => c.npc === npcId && brief.gaps.includes(c.gap)) || null;
}