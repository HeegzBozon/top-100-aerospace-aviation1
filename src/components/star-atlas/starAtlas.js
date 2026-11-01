import { base44 } from '@/api/base44Client';

// Star Atlas: honorees discovered by reading their stories. Gameplay only — a lit star
// carries zero weight in nominations, voting, measurement or tiers, and never implies endorsement.
export const STAR_XP = 40;
export const READ_MS = 6000;
export const STAR_FIELDS = ['id', 'name', 'title', 'company', 'avatar_url', 'photo_url', 'description', 'bio', 'linkedin_proudest_achievement', 'impact_summary', 'discipline'];

// Curated reflections: what stood out. Never free text.
export const REFLECTIONS = [
  { key: 'path', label: 'Their path into the field' },
  { key: 'work', label: 'The work itself' },
  { key: 'impact', label: 'Who they lift with them' },
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