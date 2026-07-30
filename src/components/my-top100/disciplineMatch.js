// Keyword-aware discipline matching. The Nominee.discipline field is optional
// and often unset on imported records, so we fall back to scanning the
// nominee's text fields for related keywords.

const DISCIPLINE_KEYWORDS = {
  space_rd: ['space', 'nasa', 'rocket', 'orbital', 'satellite', 'launch', 'spacex', 'blue origin', 'planetary', 'astrophys', 'cosmonaut', 'astronaut'],
  commercial_aviation: ['aviation', 'airline', 'pilot', 'aircraft', 'boeing', 'airbus', 'airport', 'flight ops', 'aerial'],
  defense: ['defense', 'military', 'dod', 'armed forces', 'weapon', 'missile', 'national security', 'air force'],
  manufacturing: ['manufactur', 'supply chain', 'production', 'fabrication', 'industrial', 'assembly', 'composites'],
  operations: ['operations', 'mission ops', 'flight ops', 'logistics', 'mission control', 'ground ops'],
  engineering: ['engineer', 'design', 'systems engineering', 'aerospace engineer', 'mechanical engineer'],
  policy: ['policy', 'regulation', 'regulatory', 'faa', 'government', 'advocacy', 'law', 'legislation', 'public sector'],
  entrepreneurship: ['founder', 'ceo', 'startup', 'entrepreneur', 'venture', 'co-founder', 'incubator'],
};

export function matchDiscipline(nominee, disciplineKey) {
  if (!disciplineKey || disciplineKey === 'all') return true;
  if (nominee.discipline === disciplineKey) return true;
  const text = `${nominee.industry || ''} ${nominee.professional_role || ''} ${nominee.title || ''} ${nominee.description || ''} ${nominee.category || ''} ${nominee.bio || ''}`.toLowerCase();
  const keywords = DISCIPLINE_KEYWORDS[disciplineKey] || [];
  return keywords.some(k => text.includes(k));
}

// Stable Fisher–Yates shuffle used for the default "random" sort so the
// order is random but does not reshuffle on every render.
export function stableShuffle(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}