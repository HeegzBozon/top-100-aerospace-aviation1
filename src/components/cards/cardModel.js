// THE CARD LAYER'S SPINE
//
// A trading card is not a new kind of record. It is the public record, held as an object:
// the same name, the same portrait, the same measured work, cut to a fixed size. One
// function derives a card from a Nominee here, so the Star Atlas, the collection and — as
// this grows — a Fellow's own printed card all read one card rather than three opinions.
//
// A card carries no standing. It is a way of holding a record you have already read: a
// lit star, a visited exhibit. Nothing here is bought, won, weighted or ranked, and no
// card ever feeds discovery, measurement or an influence tier.

export const ACCENTS = {
  space_rd: { label: 'Space R&D', ink: '#9ec5e0' },
  commercial_aviation: { label: 'Commercial Aviation', ink: '#c9a87c' },
  defense: { label: 'Defense', ink: '#a8b8a0' },
  manufacturing: { label: 'Manufacturing', ink: '#d98a6a' },
  operations: { label: 'Operations', ink: '#c2b280' },
  engineering: { label: 'Engineering', ink: '#b3c7d6' },
  policy: { label: 'Policy', ink: '#cfc0a8' },
  entrepreneurship: { label: 'New Ventures', ink: '#d8a48a' },
};

// The discipline field is sparse on the legacy record, so the free-text industry and role
// carry the accent when it is unset. The card always takes a colour: none of them ranks.
export const accentFor = (n) => {
  if (ACCENTS[n?.discipline]) return { key: n.discipline, ...ACCENTS[n.discipline] };
  const t = `${n?.industry || ''} ${n?.title || ''} ${n?.professional_role || ''}`.toLowerCase();
  const pick = (key) => ({ key, ...ACCENTS[key] });
  if (/space|satellite|orbit|launch|rocket/.test(t)) return pick('space_rd');
  if (/aviation|airline|flight|pilot|airport|carrier/.test(t)) return pick('commercial_aviation');
  if (/defen|military|navy|army|air force|security/.test(t)) return pick('defense');
  if (/manufactur|supply|production|assembly/.test(t)) return pick('manufacturing');
  if (/engineer|design|systems|architecture/.test(t)) return pick('engineering');
  if (/policy|government|regulat|law|public/.test(t)) return pick('policy');
  if (/founder|ceo|startup|venture|entrepreneur/.test(t)) return pick('entrepreneurship');
  return pick('operations');
};

// A serial is cut from the record's own id, so the same person always holds the same card
// number and two copies of one record never disagree.
const hash = (s) => {
  let h = 0;
  const str = String(s || 'star');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
};
export const serialFor = (id) => String(hash(id) % 10000).padStart(4, '0');

// The tier is earned by the record the card carries, never bought and never awarded by a
// game: a laurel is a record with a photographed face, a measured contribution and a
// verified credential behind it.
export const TIERS = {
  laurel: { key: 'laurel', label: 'Laurel', note: 'Portrait, contribution and credential' },
  ledger: { key: 'ledger', label: 'Ledger', note: 'Contribution on the record' },
  archival: { key: 'archival', label: 'Archival', note: 'The record as filed' },
};

const metricRows = (m) => [
  ['Publications', m.research_publications],
  ['Citations', m.citations_count],
  ['Patents', m.patents_count],
  ['Missions', m.missions_flown],
  ['Flight Hrs', m.flight_hours],
].filter(([, value]) => Number(value) > 0).map(([label, value]) => ({ label, value: Number(value) }));

export const tierOf = (n) => {
  const m = n?.impact_metrics || {};
  const measured = metricRows(m).length > 0 || !!(n?.impact_summary || n?.bio);
  const faced = !!(n?.avatar_url || n?.photo_url);
  if (faced && measured && (n?.verified || n?.is_verified)) return TIERS.laurel;
  if (measured) return TIERS.ledger;
  return TIERS.archival;
};

export const cardOf = (n) => {
  const metrics = metricRows(n?.impact_metrics || {});
  return {
    id: n.id,
    name: n.name || 'Unnamed star',
    role: n.title || n.professional_role || '',
    org: n.company || n.organization || '',
    country: n.country || '',
    face: n.avatar_url || n.photo_url || '',
    line: n.description || n.impact_summary || '',
    serial: serialFor(n.id),
    tier: tierOf(n),
    accent: accentFor(n),
    // What the face has room for, and what the reverse prints in full.
    stats: metrics.slice(0, 3),
    record: { metrics, verified: !!(n?.verified || n?.is_verified) },
  };
};

// The collection a passport holds: the stars it has lit, in the order they were lit, read
// as cards. Only ids are carried on the passport, so this is where a card gains its face.
export const cardsFrom = (nominees) => (nominees || []).map(cardOf);