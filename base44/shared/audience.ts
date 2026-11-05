// THE HOUSE'S REACHABLE AUDIENCE — one resolver, read by every door on the mail desk.
//
// The house writes to two ledgers, never three: members of the record (User) and readers
// of the Dispatch (NewsletterSignup). This module folds them into one row per address, so
// a person who is both is written to once, and an address that fails the validity gate is
// never addressed at all.
//
// The same resolver answers the segment count on the desk and the actual cohort a send
// walks. That is the whole point: a segment's number and the number of letters that leave
// can never disagree, because they are the same function.
//
// Nothing here is a system of record. GoHighLevel holds contacts; this holds the reading.

import { isValidEmail } from './nomineeResolve.ts';

export type AudienceRow = {
  email: string;
  name: string;
  source: 'member' | 'subscriber' | 'both';
  role: string;
  has_account: boolean;
  status: 'subscribed' | 'unsubscribed';
  entry_points: string[];
  joined_at: string;
  // Standing in the record. These are facts read off the nominee pool, never fields anyone
  // types: a person is a nominator because they put a name forward, and an honoree because
  // the house has printed them in a volume.
  is_nominator: boolean;
  in_pool: boolean;
  season_ids: string[];
  season_years: string[];
};

export type SegmentRule = { field: string; value: string | number };

// The seasons the house has bound a volume to. Held here because "honoree" is not a
// standing anyone can claim — it is a published appearance, and this is the list of
// moments the house has printed. A cohort still being voted on is a nominee, never yet
// an honoree.
export const VOLUME_SEASONS = [
  { id: '6a6b70136ccb7c358f77dd7f', label: 'Volume I · TOP 100 2021' },
  { id: '696aec2d99297cdbe96ee71e', label: 'Volume I · Women 2021' },
  { id: '6a6b699d7b16a7017ce0c3c0', label: 'Volume I · Men 2021' },
  { id: '6a6b7954c924445e2599968d', label: 'Volume II · TOP 100 2022' },
  { id: '6a6b756e5c6a4773130e2511', label: 'Volume II · Women 2022' },
  { id: '6a6b77cb2f46f1f0cae76d75', label: 'Volume II · Men 2022' },
  { id: '68a4e3ee564cf684ff502a06', label: 'Volume III · Women 2025' },
];

export const VOLUME_SEASON_IDS = VOLUME_SEASONS.map((volume) => volume.id);

// A season's year, read from its own start date and falling back to the year in its name.
export function yearOfSeason(season: any): string {
  const start = String(season?.start_date || '');
  if (/^\d{4}/.test(start)) return start.slice(0, 4);
  const named = String(season?.name || '').match(/(19|20)\d{2}/);
  return named ? named[0] : '';
}

const day = 86400000;

function key(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function asArray(res: unknown): any[] {
  if (Array.isArray(res)) return res;
  return (res as any)?.items || [];
}

// The two ledgers, folded. A member's own record is authoritative for their name and role;
// the Dispatch ledger is authoritative for an opt-out and for where they arrived from.
// The nominee pool is not a third ledger — it is what tells the folded rows where each
// person stands in the record: who has nominated, who has been printed, and in which season.
export function buildAudience(
  members: unknown[] = [],
  signups: unknown[] = [],
  nominees: unknown[] = [],
  seasons: unknown[] = [],
): AudienceRow[] {
  const rows = new Map<string, AudienceRow>();

  for (const raw of asArray(members)) {
    const email = key(raw?.email);
    if (!isValidEmail(email)) continue;
    rows.set(email, {
      email,
      name: String(raw?.full_name || '').trim(),
      source: 'member',
      role: key(raw?.role),
      has_account: true,
      status: 'subscribed',
      entry_points: [],
      joined_at: String(raw?.created_date || ''),
      is_nominator: false,
      in_pool: false,
      season_ids: [],
      season_years: [],
    });
  }

  for (const raw of asArray(signups)) {
    const email = key(raw?.email);
    if (!isValidEmail(email)) continue;
    const entry = key(raw?.entry_point);
    const stamp = String(raw?.submitted_at || raw?.created_date || '');
    const unsubscribed = key(raw?.status) === 'unsubscribed';
    const held = rows.get(email);

    if (!held) {
      rows.set(email, {
        email,
        name: '',
        source: 'subscriber',
        role: '',
        has_account: false,
        status: unsubscribed ? 'unsubscribed' : 'subscribed',
        entry_points: entry ? [entry] : [],
        joined_at: stamp,
        is_nominator: false,
        in_pool: false,
        season_ids: [],
        season_years: [],
      });
      continue;
    }

    held.source = 'both';
    if (unsubscribed) held.status = 'unsubscribed';
    if (entry && !held.entry_points.includes(entry)) held.entry_points.push(entry);
    if (stamp && (!held.joined_at || stamp < held.joined_at)) held.joined_at = stamp;
  }

  // Standing, read off the pool. A nominator is an address that put a name forward; an
  // appearance is every season a person's record has been bound to, whether through their
  // current season or an archived one.
  const yearBySeason = new Map<string, string>();
  for (const raw of asArray(seasons)) {
    const id = String(raw?.id || '');
    if (id) yearBySeason.set(id, yearOfSeason(raw));
  }

  const nominators = new Set<string>();
  const inPool = new Set<string>();
  const appearances = new Map<string, Set<string>>();

  for (const raw of asArray(nominees)) {
    const nominator = key(raw?.nominated_by);
    if (isValidEmail(nominator)) nominators.add(nominator);

    const email = key(raw?.nominee_email);
    if (!isValidEmail(email)) continue;
    inPool.add(email);

    const held = appearances.get(email) || new Set<string>();
    const candidates: unknown[] = [
      raw?.season_id,
      ...(Array.isArray(raw?.season_ids) ? raw.season_ids : []),
    ];
    const archived = raw?.raw_nomination_data?.archive_appearances;
    if (Array.isArray(archived)) for (const entry of archived) candidates.push(entry?.season_id);
    for (const id of candidates) if (id) held.add(String(id));
    appearances.set(email, held);
  }

  for (const row of rows.values()) {
    const ids = Array.from(appearances.get(row.email) || []);
    row.is_nominator = nominators.has(row.email);
    row.in_pool = inPool.has(row.email);
    row.season_ids = ids;
    row.season_years = Array.from(
      new Set(ids.map((id) => yearBySeason.get(id)).filter(Boolean) as string[]),
    ).sort();
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'subscribed' ? -1 : 1;
    return a.email.localeCompare(b.email);
  });
}

// Rule vocabulary. Every field is one the resolver owns; a rule the resolver does not know
// is ignored rather than guessed at, so a stale rule can never silently widen a cohort.
function matches(row: AudienceRow, rule: SegmentRule, now: number): boolean {
  const value = key(rule?.value);
  if (!value) return true;

  switch (rule?.field) {
    case 'source':
      return row.source === value;
    case 'has_account':
      return value === 'yes' ? row.has_account : !row.has_account;
    case 'role':
      return row.role === value;
    case 'entry_point':
      return row.entry_points.includes(value);
    case 'status':
      return row.status === value;
    // Standing in the record. 'honoree' is a published appearance, so a cohort still being
    // voted on never answers to it; 'nominee' is anyone holding a record in the pool.
    case 'affiliation':
      if (value === 'nominator') return row.is_nominator;
      if (value === 'honoree') return row.season_ids.some((id) => VOLUME_SEASON_IDS.includes(id));
      if (value === 'nominee') return row.in_pool;
      return true;
    case 'season_id':
      return row.season_ids.includes(value);
    case 'season_year':
      return row.season_years.includes(value);
    case 'joined_within_days': {
      const days = Number(value);
      if (!Number.isFinite(days) || days <= 0) return true;
      if (!row.joined_at) return false;
      const stamp = new Date(row.joined_at).getTime();
      return Number.isFinite(stamp) ? stamp >= now - days * day : false;
    }
    default:
      return true;
  }
}

export function resolveRules(rows: AudienceRow[], rules: SegmentRule[] = []): AudienceRow[] {
  const active = (Array.isArray(rules) ? rules : []).filter((r) => r && r.field && key(r.value));
  if (!active.length) return rows;
  const now = Date.now();
  return rows.filter((row) => active.every((rule) => matches(row, rule, now)));
}

// Who a letter may actually be posted to. An opt-out is honoured across both ledgers, and
// the validity gate is the same one the outreach export uses.
export function mailableRows(rows: AudienceRow[]): AudienceRow[] {
  return rows.filter((row) => row.status !== 'unsubscribed' && isValidEmail(row.email));
}

export function audienceSummary(rows: AudienceRow[]) {
  const now = Date.now();
  return {
    total: rows.length,
    members: rows.filter((r) => r.has_account).length,
    readers: rows.filter((r) => r.source !== 'member').length,
    both: rows.filter((r) => r.source === 'both').length,
    unsubscribed: rows.filter((r) => r.status === 'unsubscribed').length,
    mailable: mailableRows(rows).length,
    joined_30d: rows.filter((r) => {
      const stamp = r.joined_at ? new Date(r.joined_at).getTime() : NaN;
      return Number.isFinite(stamp) && stamp >= now - 30 * day;
    }).length,
  };
}

// How the Dispatch's arrivals divide between the doors they came through.
export function entryPointCounts(rows: AudienceRow[]) {
  const tally = new Map<string, number>();
  for (const row of rows) {
    for (const entry of row.entry_points) tally.set(entry, (tally.get(entry) || 0) + 1);
  }
  return Array.from(tally.entries())
    .map(([entry_point, count]) => ({ entry_point, count }))
    .sort((a, b) => b.count - a.count);
}

// STANDING, AS ONE READING — every address falls in exactly one band, strongest first, so the
// bands always add up to the whole. A person who has both nominated and been printed counts
// once, as a nominator: the chart reads how deep the house's relationship goes, not how many
// times a name appears.
export function standingCounts(rows: AudienceRow[]) {
  let nominator = 0;
  let honoree = 0;
  let nominee = 0;
  let other = 0;
  for (const row of rows) {
    if (row.is_nominator) nominator += 1;
    else if (row.season_ids.some((id) => VOLUME_SEASON_IDS.includes(id))) honoree += 1;
    else if (row.in_pool) nominee += 1;
    else other += 1;
  }
  return { nominator, honoree, nominee, other };
}

// The printed record, volume by volume: how many reachable addresses hold an appearance in
// each volume the house has bound. A person printed twice is counted in both volumes — this is
// a reading of the volumes, not of the people.
export function volumeCounts(rows: AudienceRow[]) {
  return VOLUME_SEASONS.map((volume) => ({
    season_id: volume.id,
    label: volume.label,
    count: rows.filter((row) => row.season_ids.includes(volume.id)).length,
  }));
}

// The house's greeting: a first name, taken from the name where there is one and from the
// address where there is not. Never a guess at more than that.
export function firstNameOf(name: unknown, email: unknown): string {
  const named = String(name || '').trim();
  if (named) {
    const token = named.split(/\s+/)[0].replace(/[^A-Za-z'’-]/g, '');
    if (token.length > 1) return token.charAt(0).toUpperCase() + token.slice(1);
  }
  const local = String(email || '').split('@')[0] || '';
  const part = local.split(/[._\-0-9]/)[0].replace(/[^A-Za-z]/g, '');
  if (!part) return 'Reader';
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

// Reads both ledgers. Paged, because the member ledger does not answer to a cursor form.
export async function readLedgers(base44: any) {
  const members: any[] = [];
  let memberCursor: string | null = null;
  for (let page = 0; page < 25; page += 1) {
    const res: any = memberCursor
      ? await base44.asServiceRole.entities.User.list({ limit: 200, cursor: memberCursor })
      : await base44.asServiceRole.entities.User.list();
    members.push(...asArray(res));
    if (!res?.has_more || !res?.next_cursor) break;
    memberCursor = res.next_cursor;
  }

  const signups: any[] = [];
  let signupCursor: string | null = null;
  for (let page = 0; page < 25; page += 1) {
    const res: any = await base44.asServiceRole.entities.NewsletterSignup.filter(
      {},
      { limit: 200, cursor: signupCursor },
    );
    signups.push(...asArray(res));
    if (!res?.has_more || !res?.next_cursor) break;
    signupCursor = res.next_cursor;
  }

  // The pool and the seasons, read for standing only: they never add an address to the
  // ledger, so nothing here can widen who the house writes to.
  const nominees: any[] = [];
  let nomineeCursor: string | null = null;
  for (let page = 0; page < 25; page += 1) {
    const res: any = await base44.asServiceRole.entities.Nominee.filter(
      {},
      { limit: 200, cursor: nomineeCursor },
    );
    nominees.push(...asArray(res));
    if (!res?.has_more || !res?.next_cursor) break;
    nomineeCursor = res.next_cursor;
  }

  const seasonRes: any = await base44.asServiceRole.entities.Season.list({ limit: 200 });
  const seasons = asArray(seasonRes);

  return buildAudience(members, signups, nominees, seasons);
}