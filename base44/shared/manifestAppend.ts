// A Fellow's Manifest carries the names they put forward.
//
// There is one Manifest, not one per cohort: Women and Men stand on the same ordered list,
// and an angel is a designation carried on the entry rather than a ballot of its own. So
// every name a Fellow nominated is appended after the names already ordered — never
// inserted, never displacing one — and only once: an intake row that has already reached
// the list adds nothing the second time it is read, which is what makes a backfill safe to
// run again.
//
// A seed is not a vote. Nothing here writes a ballot: a ballot is cast on the Crosscheck
// alone, and neither a nomination nor a Manifest edit creates one.

const VOTABLE = ['active', 'approved', 'winner', 'finalist'];
const RETIRED = ['rejected', 'archived'];
// The list's own ceiling, matching the Manifest's measure.
const CEILING = 250;

const norm = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const pageItems = (page) => (Array.isArray(page) ? page : page?.items || []);

async function readAll(service, name, query) {
  const all = [];
  let cursor = null;
  let rounds = 0;
  while (rounds !== 20) {
    rounds += 1;
    const options: Record<string, unknown> = { sort: '-created_date', limit: 200 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities[name].filter(query, options).catch(() => null);
    all.push(...pageItems(page));
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
}

// Which reading of the field a record belongs to. Women is tested before Men because
// "women" carries "men" inside it.
function categoryOf(season) {
  const words = `${season?.name || ''} ${season?.cohort_label || ''} ${season?.cohort_key || ''}`.toLowerCase();
  if (words.includes('angel')) return 'angels';
  if (words.includes('women') || words.includes('woman')) return 'women';
  if (words.includes('men')) return 'men';
  return null;
}

async function nomineeMap(service, ids) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const found = [];
  const chunks = Math.ceil(unique.length / 100);
  for (let index = 0; index !== chunks; index += 1) {
    const chunk = unique.slice(index * 100, index * 100 + 100);
    const rows = await service.entities.Nominee.filter({ id: { $in: chunk } }).catch(() => []);
    found.push(...pageItems(rows));
  }
  const map = new Map();
  found.forEach((record) => {
    if (VOTABLE.includes(record.status)) map.set(record.id, record);
  });
  return map;
}

// The nominations a Fellow filed, oldest first — the order they put the names forward in.
async function intakeFor(service, email) {
  const spellings = Array.from(new Set([String(email || '').trim(), norm(email)].filter(Boolean)));
  if (!spellings.length) return [];
  const rows = await readAll(service, 'NominationIntake', { nominator_email: { $in: spellings } });
  return rows
    .filter((row) => row.nominee_id && !RETIRED.includes(String(row.status || '').toLowerCase()))
    .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
}

// Append, in place of nothing: the Fellow's existing order is kept exactly as it stands.
export async function appendNominationsToManifest(service, email) {
  const holder = norm(email);
  if (!holder) return { added: 0, created: false, list_id: null };

  const spellings = Array.from(new Set([String(email || '').trim(), holder].filter(Boolean)));
  const accounts = pageItems(await service.entities.User.filter({ email: { $in: spellings } }).catch(() => []));
  const account = accounts[0] || null;
  // A Manifest belongs to a Fellow with an account. A visitor's filing is kept in the
  // intake for review, and no account is invented for them.
  if (!account) return { added: 0, created: false, list_id: null };

  const intake = await intakeFor(service, email);
  if (!intake.length) return { added: 0, created: false, list_id: null };

  const [records, seasons, lists] = await Promise.all([
    nomineeMap(service, intake.map((row) => row.nominee_id)),
    service.entities.Season.list('name', 100).catch(() => []),
    service.entities.UserTop100List
      .filter({ user_email: { $in: spellings } }, { sort: '-created_date', limit: 1 })
      .catch(() => []),
  ]);

  const categoryBySeason: Record<string, string> = {};
  (seasons || []).forEach((season) => {
    const category = categoryOf(season);
    if (category) categoryBySeason[season.id] = category;
  });

  const list = pageItems(lists)[0] || null;
  const existing = Array.isArray(list?.rankings) ? list.rankings : [];
  const seenIds = new Set(existing.map((entry) => entry.nominee_id).filter(Boolean));
  const seenNames = new Set(existing.map((entry) => norm(entry.nominee_name)).filter(Boolean));

  const appended = [];
  for (const row of intake) {
    if (existing.length + appended.length >= CEILING) break;
    const record = records.get(row.nominee_id);
    if (!record) continue;
    const key = norm(record.name);
    if (seenIds.has(record.id) || (key && seenNames.has(key))) continue;

    // The record's own cohort decides where the entry is read; the intake is the fallback
    // for a record that carries no season at all.
    const membership = Array.isArray(record.season_ids) && record.season_ids.length
      ? record.season_ids
      : [record.season_id];
    const fromSeason = membership.map((id) => categoryBySeason[id]).find(Boolean) || null;
    const fromIntake = row.nomination_type === 'men' ? 'men' : row.nomination_type === 'angels' ? 'angels' : 'women';
    const category = fromSeason || fromIntake;

    seenIds.add(record.id);
    if (key) seenNames.add(key);
    appended.push({
      rank: 0,
      nominee_id: record.id,
      nominee_name: record.name || row.nominee_name || '',
      nominee_title: record.title || record.professional_role || '',
      nominee_company: record.company || record.organization || '',
      nominee_avatar: record.avatar_url || record.photo_url || '',
      category: record.discipline || 'general',
      // An angel is a designation on the entry, never a ballot of its own: a record that
      // stands in no named cohort is carried on the Women order it was filed under.
      nomination_category: category === 'men' ? 'men' : 'women',
      also_angels: category === 'angels' || row.nomination_type === 'angels',
    });
  }

  if (!appended.length) return { added: 0, created: false, list_id: list?.id || null };

  const rankings = [...existing, ...appended].map((entry, index) => ({ ...entry, rank: index + 1 }));

  if (list) {
    await service.entities.UserTop100List.update(list.id, { rankings, is_published: true });
    return { added: appended.length, created: false, list_id: list.id };
  }

  const created = await service.entities.UserTop100List.create({
    user_email: account.email || holder,
    user_name: account.full_name || '',
    list_name: 'My Top 100',
    rankings,
    is_published: true,
    share_code: crypto.randomUUID().slice(0, 6).toUpperCase(),
  });
  return { added: appended.length, created: true, list_id: created?.id || null };
}