import { base44 } from '@/api/base44Client';

// Star Atlas: honorees discovered by reading their stories. Gameplay only — a lit star
// carries zero weight in nominations, voting, measurement or tiers, and never implies endorsement.
export const STAR_XP = 40;
export const STAR_FIELDS = ['id', 'name', 'title', 'company', 'industry', 'country', 'avatar_url', 'photo_url', 'description', 'bio', 'linkedin_proudest_achievement', 'impact_summary', 'discipline'];

// Average adult reading pace; each card holds long enough to be read, never less than 4s.
const WPM = 230;
export const dwellMs = (text) => Math.max(4000, Math.round(((text || '').split(/\s+/).length / WPM) * 60000) + 1200);

// Story sections cut into glass-sized cards on sentence boundaries (~260 chars each).
export function storyCards(n) {
  const out = [];
  storyOf(n).forEach(({ label, text }) => {
    let buf = '';
    (text.match(/[^.!?]+[.!?]*\s*/g) || [text]).forEach(s => {
      if (buf && (buf + s).length > 260) { out.push({ label, text: buf.trim() }); buf = ''; }
      buf += s;
    });
    if (buf.trim()) out.push({ label, text: buf.trim() });
  });
  return out.map((c, i, all) => ({ ...c, part: all.filter(x => x.label === c.label).length > 1 ? all.slice(0, i + 1).filter(x => x.label === c.label).length : 0 }));
}

// Curated reflections: what stood out. Never free text.
export const REFLECTIONS = [
  { key: 'path', label: 'Their path into the field' },
  { key: 'work', label: 'The work itself' },
  { key: 'impact', label: 'Who they lift with them' },
];

// Draft themes matched against the free-text industry field (discipline is mostly unset).
export const DRAFT_THEMES = [
  { key: 'space', title: 'Explorers of the Final Frontier', pattern: 'space|satellite|orbit|launch' },
  { key: 'aviation', title: 'Keepers of Flight', pattern: 'aviation|airline|flight|pilot|airport' },
  { key: 'aerospace', title: 'Engineers of the Airframe', pattern: 'aerospace|engineering|defen' },
  { key: 'medicine', title: 'Healers of the High Frontier', pattern: 'medic|health' },
  { key: 'learning', title: 'Teachers and Researchers', pattern: 'academ|educat|research|universit' },
];

export const DISCIPLINE_TITLES = {
  space_rd: 'Explorers of Space R&D', commercial_aviation: 'Keepers of Commercial Flight', defense: 'Guardians of Defense',
  manufacturing: 'Builders of the Airframe', operations: 'Masters of Operations', engineering: 'Engineers of the Frontier',
  policy: 'Shapers of Policy', entrepreneurship: 'Founders of New Ventures',
};

export const storyOf = (n) => [
  n.description && { label: 'In one line', text: n.description },
  n.linkedin_proudest_achievement && { label: 'Proudest work', text: n.linkedin_proudest_achievement },
  (n.impact_summary || n.bio) && { label: 'The story', text: (n.impact_summary || n.bio).slice(0, 600) },
].filter(Boolean);

export const litIn = (passport, c) => (c.nominee_ids || []).filter(id => passport?.stars?.[id]).length;

export async function loadStars(ids) {
  if (!ids?.length) return [];
  const page = await base44.entities.Nominee.filter({ id: { $in: ids } }, { limit: ids.length, fields: STAR_FIELDS });
  const rows = page.items || page;
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  return ids.map(id => byId[id]).filter(Boolean);
}