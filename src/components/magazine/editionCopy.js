import { countryToContinentMap, getContinent } from '@/components/publication/countryToContinentMap';

// The editing layer for the edition.
//
// The dull, consequential judgement calls that decide whether a name reads as a
// record or as a person on a page: what a role field actually says, whether a line
// belongs to the honoree or to the institution, where a name works from. Nothing
// here invents a fact. Every string is either the record's own words, cleaned, or a
// count measured off the records.

// Sentinel strings the pool carries where a field was never filled. They must never
// print, in any edition, on any page.
const JUNK = /^(not[- ]?found|n\/?a|unknown|none|null|nil|no data|tbd|\s*[-—–.]?\s*)$/i;

// Trimmed, collapsed, capped at a word boundary, and empty when there is nothing to
// say. A cap keeps a stand a line; it never truncates mid-word.
export function clean(value, max = 0) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text || JUNK.test(text)) return '';
  if (!max || text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  const kept = (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.·—–-]+$/, '');
  return `${kept}…`;
}

// A role field is sometimes a whole opening paragraph, written in her own voice.
// The stand takes the first clause and drops the first-person lead-in, so a byline
// reads as a line rather than as a sentence that begins in the middle of an answer.
export function standFrom(nominee = {}) {
  const role = clean(nominee.professional_role || nominee.title);
  const org = clean(nominee.company || nominee.organization);
  const parts = [role ? standLine(role) : '', org].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return clean(nominee.industry, 46) || clean(nominee.country) || '';
}

function standLine(role) {
  const stripped = role
    .replace(/^(i\s*(am|['’]m)\s*(currently\s*)?(an?|the)\s+)/i, '')
    .replace(/^(currently|presently)\s+/i, '')
    .replace(/^as an? [^,]{0,40},\s*/i, '');
  const first = stripped.split(/\.\s/)[0] || stripped;
  const line = clean(first, 74);
  return line ? line.charAt(0).toUpperCase() + line.slice(1) : '';
}

// The honoree's own line, when the record kept one: first person, and never a stub.
// It goes on the page as a quote in her voice, attributed to her, which is the one
// thing a directory of names can print that a data table cannot.
export function voiceOf(nominee = {}) {
  const text = clean(nominee.description);
  if (!text) return '';
  return /^(i\s|i['’]m|i\s*am|my\s|we\s)/i.test(text) ? clean(text, 240) : '';
}

// The institutional read: the long-form copy, chunked so a page carries paragraphs
// rather than one wall of text.
export function paragraphs(text, per = 3) {
  const body = clean(text);
  if (!body) return [];
  const sentences = body.match(/[^.!?]+[.!?]*/g) || [body];
  const out = [];
  for (let i = 0; i < sentences.length; i += per) {
    out.push(sentences.slice(i, i + per).join(' ').replace(/\s+/g, ' ').trim());
  }
  return out.filter(Boolean);
}

// The field a name is read under, for the measured spread only. The pool's industry
// strings are free text, so they are read by keyword; a name nothing matches stands
// in the wider field rather than being forced into one that is not hers.
const FIELDS = [
  { name: 'Space & Exploration', test: /space|orbit|satellite|astronaut|launch|rocket|lunar|mars/i },
  { name: 'Aviation & Flight Operations', test: /aviation|airline|air ?craft|flight|airport|aerodrome|drone|uav|helicopter|pilot/i },
  { name: 'Research & Education', test: /academ|university|research|professor|student|phd|educat|school/i },
  { name: 'Policy, Health & Community', test: /policy|law|legal|govern|regulat|diplom|advocacy|health|medic|outreach|communit|sustainab|diversity|inclusion/i },
  { name: 'Engineering, Data & Manufacturing', test: /engineer|manufactur|material|supply|maintenance|mro|technical|technolog|software|data|robot/i },
];

export function fieldOf(industry) {
  const text = clean(industry);
  if (!text) return 'The Wider Field';
  const match = FIELDS.find((field) => field.test.test(text));
  return match ? match.name : 'The Wider Field';
}

// The edition's regions. The platform's map resolves a country to a continent; the
// index reads those in five groups, the way an atlas is bound — Asia and Oceania
// travel together, so a region of one name never has to stand as a chapter.
const REGION_GROUPS = {
  'Asia': 'Asia & Oceania',
  'Oceania': 'Asia & Oceania',
};

// The country field is a free-text place: sometimes a city, sometimes two countries,
// sometimes a sentence about where she is from ("currently based in USA (originally
// from Iraq and New Zealand)"). It is read the way a reader would read it — the first
// place the record names that the platform's own map knows, and nothing else. What
// the map does not carry is reported as beyond the map rather than guessed at.
const MAP_LOWER = Object.fromEntries(
  Object.entries(countryToContinentMap).map(([name, continent]) => [name.toLowerCase(), { name, continent }]),
);
const MAP_KEYS_BY_LENGTH = Object.keys(MAP_LOWER).sort((a, b) => b.length - a.length);

const COUNTRY_ALIASES = {
  usa: 'United States', 'u.s.a': 'United States', 'us': 'United States',
  'united states of america': 'United States',
  'greater phoenix area': 'United States', 'washington dc-baltimore area': 'United States',
  suisse: 'Switzerland', macedonia: 'North Macedonia', holland: 'Netherlands',
  mexique: 'Mexico', uae: 'United Arab Emirates',
  'south korea': 'Korea South', 'republic of korea': 'Korea South',
  'türkiye': 'Turkey', turkiye: 'Turkey',
  england: 'United Kingdom', scotland: 'United Kingdom', wales: 'United Kingdom', 'great britain': 'United Kingdom',
};

export function resolveCountry(value) {
  const text = clean(value).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const parts = text.split(/[/,;]|\band\b|&|\s[-–]\s/i).map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const key = part.toLowerCase();
    const alias = COUNTRY_ALIASES[key];
    if (alias) return alias;
    if (MAP_LOWER[key]) return MAP_LOWER[key].name;
    // A place named inside the field ("Greater Phoenix Area", "Almuñécar, Andalusia,
    // Spain") still resolves — and resolves to the same name its alias does, so one
    // country is one country in the index.
    const within = MAP_KEYS_BY_LENGTH.find((known) => key.includes(known));
    if (within) return COUNTRY_ALIASES[within] || MAP_LOWER[within].name;
  }
  return text;
}

// The country as the edition prints it: the place the record names, resolved to the
// name the map knows when it can be, so one country is one country in the index.
export function countryOf(nominee = {}) {
  return resolveCountry(nominee.country);
}

// The region a name works from, read off the country on her record through the
// platform's own map, in the edition's regional groups.
export function regionOf(country) {
  const continent = getContinent(resolveCountry(country));
  if (!continent) return 'Beyond the Map';
  return REGION_GROUPS[continent] || continent;
}

export function listNames(names = [], max = 4) {
  const list = names.filter(Boolean);
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length <= max) return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
  return `${list.slice(0, max).join(', ')} and ${list.length - max} more`;
}