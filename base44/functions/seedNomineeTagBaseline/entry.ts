import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The baseline tagging desk.
//
// Reads each profile against the four facets the directory is read by — Field, Role,
// Impact, Region — and files the words the record actually supports. A word is taken from
// the record's own fields where they say it outright, and read off the narrative where the
// record strongly implies it; a facet with nothing behind it is left empty on purpose,
// because a word invented to fill a facet is a false claim about a person.
//
// Nothing here is a measure. The rows are vocabulary for discovery only: no ordering,
// measurement, ranking or scoring reads them.

const MAX_BATCH = 8;
const LABEL_MAX = 34;
const PROFILE_MAX = 4200;
const CATEGORIES = ['skill', 'industry', 'achievement', 'attribute', 'technology', 'geography'];

const FACETS = [
  { key: 'field', categories: ['industry', 'technology'], fallback: 'industry', cap: 2 },
  { key: 'role', categories: ['skill'], fallback: 'skill', cap: 3 },
  { key: 'impact', categories: ['achievement', 'attribute'], fallback: 'achievement', cap: 2 },
  { key: 'region', categories: ['geography'], fallback: 'geography', cap: 2 },
];

const DISCIPLINES = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial Aviation',
  defense: 'Defense',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

// A field that was never written, or written as a placeholder, is not evidence.
const JUNK = /^(n\/?a|none|null|unknown|not found|tbd|candidate|\?+|-+|—+)$/i;

class CallerError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const tidy = (value) => String(value ?? '').replace(/\s+/g, ' ').trim().replace(/[.,;:]+$/, '');

const asLabel = (value) => {
  const text = tidy(value);
  if (!text || text.length > 60 || JUNK.test(text) || /^https?:/i.test(text)) return '';
  return text.length > LABEL_MAX ? text.slice(0, LABEL_MAX).trim() : text;
};

const keyOf = (value) => tidy(value).toLowerCase();

const facetOf = (category) => FACETS.find((facet) => facet.categories.includes(category))?.key || 'field';

const categoryOf = (facetKey, claimed) => {
  const facet = FACETS.find((entry) => entry.key === facetKey);
  if (!facet) return 'industry';
  return facet.categories.includes(claimed) ? claimed : facet.fallback;
};

// Every read is paged: a directory is never small enough to load in one request.
const readAll = async (entity, query, cap, fields) => {
  const rows = [];
  let cursor = null;
  while (rows.length < cap) {
    const page = await entity.filter(query, {
      limit: 400,
      sort: 'created_date',
      ...(fields ? { fields } : {}),
      ...(cursor ? { cursor } : {}),
    });
    const items = page?.items || [];
    rows.push(...items);
    if (!page?.has_more || !page?.next_cursor || items.length === 0) break;
    cursor = page.next_cursor;
  }
  return rows.slice(0, cap);
};

// One row kept per person per word; the rest of a repeated word is consolidated away.
const planDuplicates = (rows) => {
  const best = new Map();
  const drop = [];
  rows.forEach((row) => {
    const name = keyOf(row.tag_name);
    if (!row.nominee_id || !name) return;
    const composite = `${row.nominee_id}|${name}`;
    const held = best.get(composite);
    if (!held) {
      best.set(composite, row);
      return;
    }
    const rowVotes = Number(row.upvotes) || 0;
    const heldVotes = Number(held.upvotes) || 0;
    const stronger =
      rowVotes > heldVotes ||
      (rowVotes === heldVotes && String(row.created_date || '') < String(held.created_date || ''));
    if (stronger) {
      drop.push(held);
      best.set(composite, row);
    } else {
      drop.push(row);
    }
  });
  return { best, drop };
};

const removeRows = async (db, rows) => {
  let removed = 0;
  for (let index = 0; index < rows.length; index += 6) {
    const chunk = rows.slice(index, index + 6);
    const settled = await Promise.allSettled(chunk.map((row) => db.NomineeTag.delete(row.id)));
    settled.forEach((outcome) => {
      if (outcome.status === 'fulfilled') removed += 1;
    });
  }
  return removed;
};

// One word per place. A region is read from the record's own country, brought to its
// English name, and falls back to the continent where the record only gives a city, a
// sentence or two places at once.
const REGION_ALIASES = {
  usa: 'United States',
  'u.s.a': 'United States',
  'u.s': 'United States',
  us: 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  'u.k': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'great britain': 'United Kingdom',
  britain: 'United Kingdom',
  uae: 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  duitsland: 'Germany',
  deutschland: 'Germany',
  czechia: 'Czech Republic',
  holland: 'Netherlands',
  'the netherlands': 'Netherlands',
  eu: 'Europe',
  'european union': 'Europe',
};

const titleCase = (value) =>
  tidy(value)
    .toLowerCase()
    .replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_, lead, letter) => lead + letter.toUpperCase());

const PLACE = /^[A-Za-zÀ-ÿ'’.\- ]{2,24}$/;

const canonicalRegion = (value) => {
  const text = tidy(value);
  if (!text) return '';
  return REGION_ALIASES[text.toLowerCase()] || titleCase(text);
};

const regionOf = (nominee) => {
  const country = tidy(nominee.country);
  if (REGION_ALIASES[country.toLowerCase()]) return REGION_ALIASES[country.toLowerCase()];
  if (PLACE.test(country)) return canonicalRegion(country);
  return canonicalRegion(nominee.continent);
};

// The words the record states outright, taken from its structured fields.
const directTags = (nominee) => {
  const out = [];
  const push = (value, category) => {
    const label = asLabel(value);
    if (label) out.push({ label, category, basis: 'stated', evidence: 'Filed from the record' });
  };

  push(regionOf(nominee), 'geography');

  const industry = asLabel(nominee.industry);
  push(industry || DISCIPLINES[nominee.discipline], 'industry');

  const role = asLabel(nominee.professional_role);
  push(role || nominee.title, 'skill');

  (Array.isArray(nominee.skills) ? nominee.skills : []).slice(0, 2).forEach((skill) => push(skill, 'skill'));

  return out;
};

const profileText = (nominee) => {
  const career = (Array.isArray(nominee.career_history) ? nominee.career_history : [])
    .slice(0, 6)
    .map((entry) => `${entry.role_title || ''} at ${entry.company_name || ''}`.trim())
    .filter(Boolean)
    .join('; ');

  const text = [
    `Name: ${nominee.name || ''}`,
    `Title: ${nominee.title || ''}`,
    `Organisation: ${nominee.company || nominee.organization || ''}`,
    `Industry: ${nominee.industry || ''}`,
    `Discipline: ${DISCIPLINES[nominee.discipline] || ''}`,
    `Role: ${nominee.professional_role || ''}`,
    `Based in: ${[nominee.country, nominee.continent].filter(Boolean).join(' / ')}`,
    `Summary: ${nominee.description || ''}`,
    `Biography: ${nominee.bio || nominee.bio_extended || ''}`,
    `Achievements: ${nominee.achievements || ''}`,
    `Impact: ${nominee.impact_summary || ''}`,
    `Skills: ${(Array.isArray(nominee.skills) ? nominee.skills : []).join(', ')}`,
    `Career: ${career}`,
  ]
    .filter((line) => tidy(line.split(': ').slice(1).join(': ')).length > 0)
    .join('\n');

  return text.slice(0, PROFILE_MAX);
};

const readProfile = async (base44, nominee, vocabulary) => {
  const vocabularyLine = vocabulary.length
    ? `\nDirectory vocabulary already in use (prefer these words where they fit):\n${vocabulary.join(' · ')}\n`
    : '';

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `You keep the tag desk of TOP 100 Aerospace & Aviation, a verified professional record for women in aerospace and aviation. You are filing directory words against one person's record.

Return the words that genuinely belong to four facets:
- field: the part of the industry they work in (category industry or technology)
- role: the work they do (category skill)
- impact: what the record shows they have built, changed or led (category achievement or attribute). An impact word names a result, never a discipline or a job title.
- region: where they are based (category geography), always the country's English name ("United States", "Germany"), or the continent when the record gives only a city or region

Rules:
- At most two words per facet. One is enough. An empty facet is the correct answer when the record does not support a word: never fill a facet to look complete.
- Each word is one to three words, title case, at most ${LABEL_MAX} characters, and specific: "Propulsion Systems", not "Engineering"; "Satellite Operations", not "Operations".
- basis "stated" only when the record says it outright. basis "inferred" only when the record strongly implies it without naming it.
- Never infer a credential, employer, award, degree or place the record does not support.
- evidence is the phrase from the record the word rests on, at most twelve words; for an inference, start it with "implied by".
- Never use the person's own name, a rank, a number, an honour such as "Top 100", or praise such as "Leader", "Expert" or "Innovative".
- Do not invent a near-duplicate of a word already listed in the directory vocabulary.
${vocabularyLine}
Record:
${profileText(nominee)}`,
    response_json_schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              facet: { type: 'string', enum: ['field', 'role', 'impact', 'region'] },
              label: { type: 'string' },
              category: { type: 'string', enum: CATEGORIES },
              basis: { type: 'string', enum: ['stated', 'inferred'] },
              evidence: { type: 'string' },
            },
            required: ['facet', 'label', 'category', 'basis', 'evidence'],
          },
        },
      },
      required: ['tags'],
    },
  });

  return Array.isArray(response?.tags) ? response.tags : [];
};

// What the record stated first, then what was read off it, never twice, and never more than
// a facet can carry.
const mergeTags = (direct, read, taken) => {
  const held = new Set(taken);
  const counts = new Map();
  const out = [];

  [...direct, ...read].forEach((tag) => {
    const facetKey = FACETS.some((facet) => facet.key === tag?.facet)
      ? tag.facet
      : facetOf(tag?.category);

    // A place is always filed as one English place name, whichever side it came from.
    const label = facetKey === 'region' ? asLabel(canonicalRegion(tag?.label)) : asLabel(tag?.label);
    if (!label) return;
    const key = keyOf(label);
    if (held.has(key)) return;

    const facet = FACETS.find((entry) => entry.key === facetKey);
    const used = counts.get(facetKey) || 0;
    if (used >= facet.cap) return;

    held.add(key);
    counts.set(facetKey, used + 1);
    out.push({
      label,
      facet: facetKey,
      category: categoryOf(facetKey, tag?.category),
      basis: tag?.basis === 'inferred' ? 'inferred' : 'stated',
      evidence: tidy(tag?.evidence).slice(0, 160) || 'Filed from the record',
    });
  });

  return out;
};

const pool = async (db, body) => {
  const cap = Math.min(Math.max(Number(body.limit) || 400, 50), 800);
  const nominees = await readAll(
    db.Nominee,
    {},
    2000,
    ['id', 'name']
  );
  const tags = await readAll(db.NomineeTag, { status: 'approved' }, 6000, ['nominee_id', 'tag_name', 'category']);

  const held = new Map();
  const tally = new Map();
  let duplicateRows = 0;

  tags.forEach((row) => {
    const name = tidy(row.tag_name);
    if (!row.nominee_id || !name) return;
    const key = name.toLowerCase();

    let mine = held.get(row.nominee_id);
    if (!mine) {
      mine = new Map();
      held.set(row.nominee_id, mine);
    }
    if (mine.has(key)) duplicateRows += 1;
    else mine.set(key, { label: name, category: row.category || 'industry' });

    const stat = tally.get(key) || { label: name, people: new Set() };
    stat.people.add(row.nominee_id);
    tally.set(key, stat);
  });

  const coverage = { field: 0, role: 0, impact: 0, region: 0 };
  const rows = nominees.map((nominee) => {
    const mine = held.get(nominee.id) || new Map();
    const facets = new Set([...mine.values()].map((tag) => facetOf(tag.category)));
    facets.forEach((facetKey) => {
      if (coverage[facetKey] !== undefined) coverage[facetKey] += 1;
    });
    return {
      id: nominee.id,
      name: tidy(nominee.name),
      labels: [...mine.values()].map((tag) => tag.label).sort((a, b) => a.localeCompare(b)),
      missing: FACETS.filter((facet) => !facets.has(facet.key)).length,
    };
  });

  const ranked = rows.sort((a, b) => b.missing - a.missing || a.name.localeCompare(b.name));

  return {
    total: rows.length,
    bare: rows.filter((row) => row.labels.length === 0).length,
    uncovered: rows.filter((row) => row.missing > 0).length,
    duplicate_rows: duplicateRows,
    coverage,
    vocabulary: [...tally.values()]
      .sort((a, b) => b.people.size - a.people.size || a.label.localeCompare(b.label))
      .slice(0, 60)
      .map((stat) => stat.label),
    nominees: ranked.slice(0, cap),
  };
};

const propose = async (base44, db, body) => {
  const ids = [...new Set((Array.isArray(body.nominee_ids) ? body.nominee_ids : []).filter((id) => typeof id === 'string' && id))].slice(0, MAX_BATCH);
  if (ids.length === 0) throw new CallerError('Name the profiles to read');

  const page = await db.Nominee.filter({ id: { $in: ids } }, { limit: ids.length });
  const nominees = page?.items || [];
  if (nominees.length === 0) throw new CallerError('No profile matched', 404);

  const tagRows = await readAll(db.NomineeTag, { nominee_id: { $in: ids } }, 2000);
  const carried = new Map();
  const taken = new Map();
  tagRows.forEach((row) => {
    if (row.status !== 'approved') return;
    const name = tidy(row.tag_name);
    if (!name) return;
    const list = carried.get(row.nominee_id) || [];
    list.push(name);
    carried.set(row.nominee_id, list);
    const keys = taken.get(row.nominee_id) || new Set();
    keys.add(name.toLowerCase());
    taken.set(row.nominee_id, keys);
  });

  const vocabulary = (Array.isArray(body.vocabulary) ? body.vocabulary : [])
    .map((word) => tidy(word))
    .filter((word) => word && word.length <= 48)
    .slice(0, 60);

  const proposals = [];
  for (let index = 0; index < nominees.length; index += 4) {
    const chunk = nominees.slice(index, index + 4);
    const settled = await Promise.allSettled(
      chunk.map(async (nominee) => {
        const direct = directTags(nominee);
        let read = [];
        let readFailed = false;
        try {
          read = await readProfile(base44, nominee, vocabulary);
        } catch (error) {
          readFailed = true;
          console.error(`Baseline read failed for ${nominee.id}:`, error?.message);
        }
        const tags = mergeTags(direct, read, taken.get(nominee.id) || new Set());
        return {
          nominee_id: nominee.id,
          name: tidy(nominee.name),
          carried: [...(carried.get(nominee.id) || [])].sort((a, b) => a.localeCompare(b)),
          tags,
          skipped_facets: FACETS.filter((facet) => !tags.some((tag) => facetOf(tag.category) === facet.key)).map((facet) => facet.key),
          read_failed: readFailed,
        };
      })
    );
    settled.forEach((outcome) => {
      if (outcome.status === 'fulfilled') proposals.push(outcome.value);
    });
  }

  return { proposals };
};

const writeTags = async (db, body, user) => {
  const incoming = Array.isArray(body.proposals) ? body.proposals.slice(0, 200) : [];
  const byNominee = new Map();

  incoming.forEach((entry) => {
    const id = typeof entry?.nominee_id === 'string' ? entry.nominee_id : '';
    if (!id) return;
    (Array.isArray(entry?.tags) ? entry.tags : []).slice(0, 12).forEach((tag) => {
      const label = asLabel(tag?.label);
      if (!label) return;
      const keys = byNominee.get(id) || new Map();
      const key = keyOf(label);
      if (!keys.has(key)) {
        keys.set(key, {
          label,
          category: CATEGORIES.includes(tag?.category) ? tag.category : 'industry',
          basis: tag?.basis === 'inferred' ? 'inferred' : 'stated',
          evidence: tidy(tag?.evidence).slice(0, 160),
        });
      }
      byNominee.set(id, keys);
    });
  });

  const ids = [...byNominee.keys()];
  if (ids.length === 0) throw new CallerError('No words to file');

  const rows = await readAll(db.NomineeTag, { nominee_id: { $in: ids } }, 4000);
  const { drop } = planDuplicates(rows);
  const existing = new Set(
    rows
      .filter((row) => row.status === 'approved')
      .map((row) => `${row.nominee_id}|${keyOf(row.tag_name)}`)
  );

  const creates = [];
  let skipped = 0;

  byNominee.forEach((tags, id) => {
    tags.forEach((tag, key) => {
      const composite = `${id}|${key}`;
      if (existing.has(composite)) {
        skipped += 1;
        return;
      }
      existing.add(composite);
      creates.push({
        nominee_id: id,
        tag_name: tag.label,
        category: tag.category,
        status: 'approved',
        origin: 'baseline',
        basis: tag.basis,
        evidence: tag.evidence,
        suggested_by: user.email,
        upvotes: 0,
      });
    });
  });

  if (creates.length > 0) await db.NomineeTag.bulkCreate(creates);
  const removed = await removeRows(db, drop);

  return { added: creates.length, skipped, removed, profiles: ids.length };
};

const dedupeAll = async (db) => {
  const rows = await readAll(db.NomineeTag, {}, 6000);
  const { drop } = planDuplicates(rows);
  const removed = await removeRows(db, drop);
  const people = new Set(rows.map((row) => row.nominee_id).filter(Boolean));
  return { scanned: rows.length, removed, profiles: people.size };
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Administrators only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'pool');
    const db = base44.asServiceRole.entities;

    if (action === 'pool') return Response.json(await pool(db, body));
    if (action === 'propose') return Response.json(await propose(base44, db, body));
    if (action === 'write') return Response.json(await writeTags(db, body, user));
    if (action === 'dedupe') return Response.json(await dedupeAll(db));

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || 'The tag baseline could not run' }, { status: error.status || 500 });
  }
}