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
};

export type SegmentRule = { field: string; value: string | number };

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
export function buildAudience(members: unknown[] = [], signups: unknown[] = []): AudienceRow[] {
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
      });
      continue;
    }

    held.source = 'both';
    if (unsubscribed) held.status = 'unsubscribed';
    if (entry && !held.entry_points.includes(entry)) held.entry_points.push(entry);
    if (stamp && (!held.joined_at || stamp < held.joined_at)) held.joined_at = stamp;
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

  return buildAudience(members, signups);
}