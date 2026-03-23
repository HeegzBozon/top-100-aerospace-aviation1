// ICAO hex prefix → operator + country enrichment
// Based on ICAO Annex 10 aircraft address block allocations.
// No external dependency — ships with the bundle.

const HEX_OPERATORS = [
  // ── United States ──────────────────────────────────────────
  { prefix: 'AE', operator: 'US Military',      country: 'USA', flag: '🇺🇸', type: 'military' },
  { prefix: 'AF', operator: 'US Military',      country: 'USA', flag: '🇺🇸', type: 'military' },
  // ── United Kingdom ─────────────────────────────────────────
  { prefix: '43C', operator: 'RAF',             country: 'GBR', flag: '🇬🇧', type: 'military' },
  { prefix: '43D', operator: 'Royal Navy',      country: 'GBR', flag: '🇬🇧', type: 'military' },
  { prefix: '43E', operator: 'UK Military',     country: 'GBR', flag: '🇬🇧', type: 'military' },
  // ── France ────────────────────────────────────────────────
  { prefix: '3A', operator: 'French Air Force', country: 'FRA', flag: '🇫🇷', type: 'military' },
  { prefix: '3B', operator: 'French Navy',      country: 'FRA', flag: '🇫🇷', type: 'military' },
  // ── Germany ───────────────────────────────────────────────
  { prefix: '3F', operator: 'Luftwaffe',        country: 'DEU', flag: '🇩🇪', type: 'military' },
  // ── Italy ─────────────────────────────────────────────────
  { prefix: '33', operator: 'Italian Air Force',country: 'ITA', flag: '🇮🇹', type: 'military' },
  // ── Spain ─────────────────────────────────────────────────
  { prefix: '34', operator: 'Spanish Air Force',country: 'ESP', flag: '🇪🇸', type: 'military' },
  // ── Canada ────────────────────────────────────────────────
  { prefix: 'C0', operator: 'RCAF',             country: 'CAN', flag: '🇨🇦', type: 'military' },
  // ── Australia ─────────────────────────────────────────────
  { prefix: '7C', operator: 'RAAF',             country: 'AUS', flag: '🇦🇺', type: 'military' },
  // ── Israel ────────────────────────────────────────────────
  { prefix: '50', operator: 'IAF',              country: 'ISR', flag: '🇮🇱', type: 'military' },
  // ── Brazil ────────────────────────────────────────────────
  { prefix: 'E4', operator: 'Brazilian Air Force', country: 'BRA', flag: '🇧🇷', type: 'military' },
  // ── India ─────────────────────────────────────────────────
  { prefix: '80', operator: 'Indian Air Force', country: 'IND', flag: '🇮🇳', type: 'military' },
  // ── Pakistan ──────────────────────────────────────────────
  { prefix: '70', operator: 'PAF',              country: 'PAK', flag: '🇵🇰', type: 'military' },
  // ── China ─────────────────────────────────────────────────
  { prefix: '78', operator: 'PLAAF',            country: 'CHN', flag: '🇨🇳', type: 'military' },
  // ── Russia ────────────────────────────────────────────────
  { prefix: '15', operator: 'VKS',              country: 'RUS', flag: '🇷🇺', type: 'military' },
  // ── Netherlands ───────────────────────────────────────────
  { prefix: '48', operator: 'Royal Netherlands AF', country: 'NLD', flag: '🇳🇱', type: 'military' },
  // ── Belgium ───────────────────────────────────────────────
  { prefix: '44', operator: 'Belgian Air Component', country: 'BEL', flag: '🇧🇪', type: 'military' },
  // ── Poland ────────────────────────────────────────────────
  { prefix: '48D', operator: 'Polish Air Force', country: 'POL', flag: '🇵🇱', type: 'military' },
  // ── Turkey ────────────────────────────────────────────────
  { prefix: '69', operator: 'Turkish Air Force', country: 'TUR', flag: '🇹🇷', type: 'military' },
  // ── Norway ────────────────────────────────────────────────
  { prefix: '47F', operator: 'Royal Norwegian AF', country: 'NOR', flag: '🇳🇴', type: 'military' },
  // ── Japan ─────────────────────────────────────────────────
  { prefix: '87', operator: 'JASDF',            country: 'JPN', flag: '🇯🇵', type: 'military' },
  // ── South Korea ───────────────────────────────────────────
  { prefix: '71', operator: 'ROKAF',            country: 'KOR', flag: '🇰🇷', type: 'military' },
  // ── NATO / AWACS ──────────────────────────────────────────
  { prefix: '4C', operator: 'NATO',             country: 'NATO', flag: '🔵', type: 'military' },
];

// Sort longest prefix first so '43C' matches before '43'
const SORTED = [...HEX_OPERATORS].sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Given an icao24 hex string, return enrichment data.
 * Returns empty object if no match (unknown/civilian).
 */
export function enrichFlight(icao24) {
  if (!icao24) return {};
  const hex = icao24.toUpperCase();
  const match = SORTED.find(op => hex.startsWith(op.prefix));
  if (!match) return {};
  return {
    operator: match.operator,
    operatorCountry: match.country,
    operatorFlag: match.flag,
    aircraftRole: match.type,
  };
}
