// The directory's intelligence layer.
//
// A name is filed under the words they were written with, and the field is wider than any
// one person's filing: a Fellow tagged Brazil is in Latin America whether or not anyone
// ever wrote that on their record. This is the curated reading that sits under the search
// and the cloud, so a term of art reaches the people it actually names.
//
// Two kinds of knowledge, both reviewed by hand, both kept here rather than in the records:
//
//   REGIONS   a concept and the places it holds. "Latin America" is not "South America":
//             the two lists are drawn separately, because Brazil is both and Guyana is
//             only the second. Asking for a region reads every member of it.
//   ALIASES   the same place written two ways — Colombia and Columbia, the United Kingdom
//             and Britain. A variant never rewrites a Fellow's record; it only widens what
//             a query lands on.
//
// The rule is deliberately one-directional: a broad term reaches its members, and a member
// never reaches its neighbours. Asking for Latin America answers with every country in it;
// asking for Brazil still answers with Brazil. Broadening is something the reader asked
// for by naming a region, never something the directory decides for them.
//
// This is a reading aid and nothing else. It never touches directory ordering, measurement,
// influence tier or scoring, and it never edits a tag or a country on a record.

export function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// The places, grouped by the concepts a reader actually asks for.
const REGIONS = [
  {
    key: 'latin-america',
    label: 'Latin America',
    aliases: ['latam', 'latin american', 'latinoamerica', 'latino america'],
    members: [
      'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
      'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Mexico',
      'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico', 'Uruguay', 'Venezuela',
    ],
  },
  {
    key: 'south-america',
    label: 'South America',
    aliases: ['south american', 'sudamerica'],
    members: [
      'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana',
      'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
    ],
  },
  {
    key: 'central-america',
    label: 'Central America',
    aliases: ['central american'],
    members: [
      'Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama',
    ],
  },
  {
    key: 'caribbean',
    label: 'Caribbean',
    aliases: ['west indies'],
    members: [
      'Bahamas', 'Barbados', 'Cuba', 'Dominican Republic', 'Haiti', 'Jamaica', 'Puerto Rico',
      'Trinidad and Tobago',
    ],
  },
  {
    key: 'north-america',
    label: 'North America',
    aliases: ['north american', 'norteamerica'],
    members: ['Canada', 'Mexico', 'United States'],
  },
  {
    key: 'europe',
    label: 'Europe',
    aliases: ['european', 'eu'],
    members: [
      'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia',
      'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
      'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal',
      'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
      'Ukraine', 'United Kingdom',
    ],
  },
  {
    key: 'middle-east',
    label: 'Middle East',
    aliases: ['middle eastern', 'mena', 'gulf'],
    members: [
      'Bahrain', 'Egypt', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman',
      'Qatar', 'Saudi Arabia', 'Turkey', 'United Arab Emirates',
    ],
  },
  {
    key: 'africa',
    label: 'Africa',
    aliases: ['african', 'sub saharan africa'],
    members: [
      'Algeria', 'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Morocco', 'Nigeria', 'Rwanda',
      'Senegal', 'South Africa', 'Tanzania', 'Tunisia', 'Uganda',
    ],
  },
  {
    key: 'south-asia',
    label: 'South Asia',
    aliases: ['south asian', 'indian subcontinent'],
    members: ['Afghanistan', 'Bangladesh', 'India', 'Nepal', 'Pakistan', 'Sri Lanka'],
  },
  {
    key: 'east-asia',
    label: 'East Asia',
    aliases: ['east asian', 'far east'],
    members: ['China', 'Hong Kong', 'Japan', 'Mongolia', 'South Korea', 'Taiwan'],
  },
  {
    key: 'southeast-asia',
    label: 'Southeast Asia',
    aliases: ['south east asia', 'asean'],
    members: ['Indonesia', 'Malaysia', 'Philippines', 'Singapore', 'Thailand', 'Vietnam'],
  },
  {
    key: 'oceania',
    label: 'Oceania',
    aliases: ['pacific', 'australasia'],
    members: ['Australia', 'Fiji', 'New Zealand', 'Papua New Guinea'],
  },
];

// The same place, written two ways. One group is one place: any variant reaches the rest.
const ALIASES = [
  ['United States', 'United States of America', 'USA', 'US'],
  ['United Kingdom', 'UK', 'Great Britain', 'Britain', 'England'],
  ['United Arab Emirates', 'UAE', 'Dubai', 'Abu Dhabi'],
  ['Colombia', 'Columbia'],
  ['Netherlands', 'Holland'],
  ['South Korea', 'Korea', 'Republic of Korea'],
  ['North Korea', 'DPRK'],
  ['Czech Republic', 'Czechia'],
  ['Turkey', 'Turkiye'],
  ['Germany', 'Deutschland'],
  ['Switzerland', 'Suisse'],
  ['Saudi Arabia', 'KSA'],
  ['Russia', 'Russian Federation'],
  ['Hong Kong', 'Hongkong'],
  ['New Zealand', 'Aotearoa'],
  ['South Africa', 'RSA'],
];

const ALIAS_GROUPS = ALIASES.map((group) => group.map(normalize));

// A needle shorter than this may only match a whole word: "us" is a country and also the
// first two letters of Australia, and the cloud must never answer with the wrong continent.
const WHOLE_WORD_BELOW = 4;

function includesTerm(haystack, needle) {
  if (!haystack || !needle) return false;
  if (haystack === needle) return true;
  if (needle.length >= WHOLE_WORD_BELOW) return haystack.includes(needle);
  return haystack.split(' ').includes(needle);
}

// The fields a query is read against. Places are here because a record may carry its
// country without ever being tagged with it.
const SEARCH_FIELDS = [
  'name', 'title', 'professional_role', 'company', 'organization', 'country',
];

// One normalized string per person, built once per pool rather than per keystroke.
export function searchText(nominee) {
  const parts = [];
  SEARCH_FIELDS.forEach((field) => {
    const value = nominee?.[field];
    if (value) parts.push(normalize(value));
  });
  return parts.join(' \u0001 ');
}

// What a query means: the literal term, the variants it is written as, and the members of
// any region it names. Null when there is nothing to read by.
export function planSearch(rawQuery) {
  const query = normalize(rawQuery);
  if (!query) return null;

  const terms = new Set([query]);
  const regions = [];

  REGIONS.forEach((region) => {
    const names = [region.label, ...(region.aliases || [])].map(normalize);
    const named = names.some(
      (name) => name === query || (query.length >= 5 && name.startsWith(query))
    );
    if (!named) return;
    regions.push({ key: region.key, label: region.label, members: region.members });
    region.members.forEach((member) => terms.add(normalize(member)));
  });

  // The variants of everything collected so far, then a second pass so a half-typed
  // variant ("columb") still reaches the place it is spelled as.
  [...terms].forEach((term) => {
    ALIAS_GROUPS.forEach((group) => {
      if (group.includes(term)) group.forEach((variant) => terms.add(variant));
    });
  });
  [...terms].forEach((term) => {
    if (term.length < 4) return;
    ALIAS_GROUPS.forEach((group) => {
      if (group.some((variant) => variant.startsWith(term))) {
        group.forEach((variant) => terms.add(variant));
      }
    });
  });

  return { query, terms: [...terms], regions };
}

// Whether a person answers the query, by their own words (the record) or by the words the
// directory filed them under (their tags). Either one is enough.
export function matchesPlan(plan, text, tagKeys) {
  if (!plan) return true;
  if (text && plan.terms.some((term) => includesTerm(text, term))) return true;
  if (!tagKeys) return false;
  for (const key of tagKeys) {
    const tag = normalize(key);
    if (!tag) continue;
    if (plan.terms.some((term) => includesTerm(tag, term))) return true;
  }
  return false;
}

// Every key the same place may be filed under: the label as written, and its variants. So a
// press on Colombia also answers the people filed under Columbia, without either record
// being rewritten.
export function sameLabels(label) {
  const written = (label || '').trim().toLowerCase();
  const keys = new Set(written ? [written] : []);
  const normalized = normalize(label);
  if (normalized) keys.add(normalized);
  ALIAS_GROUPS.forEach((group) => {
    if (normalized && group.includes(normalized)) group.forEach((variant) => keys.add(variant));
  });
  return [...keys];
}

// The member places of the regions a query named, in the order the region lists them.
export function regionMembers(plan) {
  if (!plan?.regions?.length) return [];
  const seen = new Set();
  const members = [];
  plan.regions.forEach((region) => {
    region.members.forEach((member) => {
      const key = normalize(member);
      if (seen.has(key)) return;
      seen.add(key);
      members.push({ key, label: member });
    });
  });
  return members;
}