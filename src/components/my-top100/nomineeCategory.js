import { base44 } from '@/api/base44Client';
import { filterPoolNominees } from '@/components/my-top100/nomineePoolFilter';

// Build a map of season_id -> 'women' | 'men' | 'angels' from a seasons list.
// Order matters: "women" contains "men" as a substring, so check Angels → Women → Men.
export function buildSeasonCategoryMap(seasons) {
  const map = {};
  (seasons || []).forEach(s => {
    const nm = (s.name || '').toLowerCase();
    if (nm.includes('angel')) map[s.id] = 'angels';
    else if (nm.includes('women')) map[s.id] = 'women';
    else if (nm.includes('men')) map[s.id] = 'men';
  });
  return map;
}

// Resolve a nominee's category from its season, with a light text fallback
// for records missing a season_id.
export function getNomineeCategory(n, seasonCategoryMap = {}) {
  if (!n) return null;
  const sc = seasonCategoryMap[n.season_id];
  if (sc) return sc;
  const t = `${n.description || ''} ${n.industry || ''} ${n.category || ''}`.toLowerCase();
  if (t.includes('woman') || t.includes('female')) return 'women';
  if (t.includes('angel') || t.includes('investor')) return 'angels';
  return null;
}

// Dedupe a nominee list by normalized name, preserving the first occurrence
// (callers pass a -created_date sorted list so the most recent record wins).
export function dedupeByName(list) {
  const seen = new Set();
  return (list || []).filter(n => {
    const key = (n.name || '').trim().toLowerCase();
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Strip archive records and cross-season duplicates in one pass.
export function prepareNomineePool(rawList) {
  return dedupeByName(filterPoolNominees(rawList));
}

// Fetch nominees + seasons together and return the active, deduped pool plus
// the season→category map needed for Women/Men/Angels filtering.
export async function loadNomineePool() {
  const [raw, seasons] = await Promise.all([
    base44.entities.Nominee.list('-created_date', 2000),
    base44.entities.Season.list('name', 100),
  ]);
  return {
    pool: prepareNomineePool(raw),
    seasonCategory: buildSeasonCategoryMap(seasons),
  };
}