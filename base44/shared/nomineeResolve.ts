// Shared server-side nominee identity resolution.
// Reused by the claim resolver (Phase 1) and the outreach export (Phase 2)
// so claim logic and outreach logic never diverge.

// Normalize a LinkedIn profile URL to a stable canonical form:
// https://www.linkedin.com/in/<vanity> — lowercased host, no query/hash, no trailing slash.
// Returns '' for non-linkedin or malformed input.
export function normalizeLinkedInUrl(input: string | null | undefined): string {
  if (!input) return '';
  const raw = String(input).trim();
  if (!raw) return '';
  let u: URL;
  try {
    u = new URL(raw.includes('://') ? raw : 'https://' + raw);
  } catch {
    return '';
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  if (!host.endsWith('linkedin.com')) return '';
  const path = u.pathname.replace(/\/+$/, '').toLowerCase();
  // Only /in/<vanity> personal handles are valid claim matches.
  if (!path.startsWith('/in/')) return '';
  return `https://www.linkedin.com${path}`;
}

// Does the claimer's fetched LinkedIn URL match the nominee's stored LinkedIn URL?
export function linkedinUrlsMatch(nomineeUrl: string, claimerUrl: string): boolean {
  const a = normalizeLinkedInUrl(nomineeUrl);
  const b = normalizeLinkedInUrl(claimerUrl);
  return !!a && !!b && a === b;
}

// Fetch the claiming user's own public LinkedIn profile URL using their app-user token.
// Uses /v2/me with publicProfileUrl projection (r_basicprofile).
export async function fetchClaimerLinkedInUrl(accessToken: string): Promise<string> {
  const res = await fetch(
    'https://api.linkedin.com/v2/me?projection=(id,publicProfileUrl,vanityName)',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`LinkedIn profile fetch failed (${res.status}): ${t}`);
  }
  const data = await res.json();
  return data.publicProfileUrl || '';
}

// Strict RFC-ish email validity gate. Applied at the source so garbage like 'z'
// or 'name@gmail' (missing TLD) never reaches claim-readiness, dedupe, or the
// CSV. Requires a non-empty local part, '@', a domain with at least one dot,
// and no whitespace anywhere.
export function isValidEmail(e: string | null | undefined): boolean {
  if (!e) return false;
  const s = String(e).trim();
  if (!s || s.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Canonical LinkedIn vanity slug ('/in/<vanity>'), lowercased with no query or
// trailing slash. The merge key for cross-record dedupe when emails disagree.
// Returns '' for non-LinkedIn or non-personal URLs.
export function canonicalLinkedInSlug(input: string | null | undefined): string {
  const url = normalizeLinkedInUrl(input);
  if (!url) return '';
  const m = url.match(/\/in\/([^/?#]+)/);
  return m ? m[1] : '';
}

// Resolve whether the authenticated user's email matches this nominee record
// (primary or any secondary email). Self-serve email-match claim gate, now
// gated by isValidEmail so a stored garbage address can't auto-claim.
export function emailMatchesNominee(
  userEmail: string | null | undefined,
  nominee: { nominee_email?: string | null; secondary_emails?: string[] | null }
): boolean {
  if (!isValidEmail(userEmail)) return false;
  const e = emailKey(userEmail);
  if (isValidEmail(nominee.nominee_email) && emailKey(nominee.nominee_email) === e) return true;
  if (Array.isArray(nominee.secondary_emails)) {
    return nominee.secondary_emails.some((s) => isValidEmail(s) && emailKey(s) === e);
  }
  return false;
}

// Published app origin for user-facing deep links. Outreach recipients land on
// the canonical /profiles/:id route, keyed back to claim via ?claim=1.
export const APP_ORIGIN = 'https://top100aerospaceandaviation.base44.app';

// Normalize an email to a stable key for dedupe (lowercased, trimmed).
function emailKey(e: string | null | undefined): string {
  return (e || '').toLowerCase().trim();
}

// Claim readiness buckets for outreach. Drives messaging: who gets an email
// (claimable-by-email), who needs a LinkedIn DM (claimable-by-linkedin /
// no-contact lacks both), and who's already a Fellow (claimed).
export type ClaimReadiness =
  | 'claimed'
  | 'claimable-by-email'
  | 'claimable-by-linkedin'
  | 'no-contact';

// Reduce the full nominee pool to one row per person. Dedupe keys on BOTH the
// strict-valid primary email AND the canonical LinkedIn slug (union-find), so
// two records sharing a LinkedIn URL collapse even when their emails disagree
// (one missing a TLD, say). Within a merged group the surviving primary email
// is the strict-valid one; invalid emails are never emitted. Reused by the
// claim resolver (conceptually) and the outreach export (concretely), so claim
// and outreach logic never diverge.
export function resolveOutreachPersons(
  nominees: any[],
  knownUserEmails: Set<string>
): any[] {
  const list = nominees || [];
  const parent = list.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  const emailToIndex = new Map<string, number>();
  const slugToIndex = new Map<string, number>();

  for (let i = 0; i < list.length; i++) {
    const n = list[i];
    if (isValidEmail(n.nominee_email)) {
      const e = emailKey(n.nominee_email);
      if (emailToIndex.has(e)) union(i, emailToIndex.get(e)!);
      else emailToIndex.set(e, i);
    }
    const slug = canonicalLinkedInSlug(n.linkedin_profile_url);
    if (slug) {
      if (slugToIndex.has(slug)) union(i, slugToIndex.get(slug)!);
      else slugToIndex.set(slug, i);
    }
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < list.length; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r)!.push(i);
  }

  const dedupe = (vals: any[]): string =>
    [...new Set(vals.filter(Boolean))].join('; ');

  const persons: any[] = [];
  for (const indices of groups.values()) {
    const groupNominees = indices.map((i) => list[i]);
    const byRecency = [...groupNominees].sort((a, b) =>
      String(b.created_date || '').localeCompare(String(a.created_date || ''))
    );

    const emailSet = new Set<string>();
    for (const n of groupNominees) {
      if (isValidEmail(n.nominee_email)) emailSet.add(emailKey(n.nominee_email));
      for (const s of n.secondary_emails || []) {
        if (isValidEmail(s)) emailSet.add(emailKey(s));
      }
    }
    const repWithValidPrimary = byRecency.find((n) => isValidEmail(n.nominee_email));
    const email = repWithValidPrimary
      ? emailKey(repWithValidPrimary.nominee_email)
      : ([...emailSet][0] || '');
    const secondary = [...emailSet].filter((e) => e && e !== email);

    const linkedinRaw =
      byRecency.map((n) => n.linkedin_profile_url).find(Boolean) || '';
    const normalizedLinkedin = normalizeLinkedInUrl(linkedinRaw);

    let claimStatus = 'unclaimed';
    let claimedById = '';
    for (const n of groupNominees) {
      if (n.claim_status === 'approved' || n.claimed_by_user_id) {
        claimStatus = 'approved';
        claimedById = n.claimed_by_user_id || claimedById;
      }
    }

    const representativeId = byRecency[0]?.id || groupNominees[0]?.id || '';
    const name = byRecency.find((n) => n.name)?.name || '';
    const hasAccount = [...emailSet].some((e) => knownUserEmails.has(e));

    let readiness: ClaimReadiness;
    if (claimStatus === 'approved' || claimedById) {
      readiness = 'claimed';
    } else if (email) {
      readiness = 'claimable-by-email';
    } else if (normalizedLinkedin) {
      readiness = 'claimable-by-linkedin';
    } else {
      readiness = 'no-contact';
    }

    persons.push({
      name,
      email,
      secondaryEmails: secondary.join('; '),
      linkedinUrl: normalizedLinkedin,
      claimReadiness: readiness,
      hasAccount,
      deepLink: `${APP_ORIGIN}/profiles/${representativeId}?claim=1`,
      country: dedupe(groupNominees.map((n) => n.country)),
      industry: dedupe(groupNominees.map((n) => n.industry)),
      professionalRole: byRecency[0]?.professional_role || '',
      company: dedupe(groupNominees.map((n) => n.company)),
      seasonCount: new Set(
        groupNominees.map((n) => n.season_id).filter(Boolean)
      ).size,
    });
  }

  persons.sort((a, b) => {
    const order = ['claimable-by-email', 'claimable-by-linkedin', 'no-contact', 'claimed'];
    const ao = order.indexOf(a.claimReadiness);
    const bo = order.indexOf(b.claimReadiness);
    if (ao !== bo) return ao - bo;
    return (a.email || '').localeCompare(b.email || '');
  });

  return persons;
}

// CSV escape: quote only when the value contains comma, quote, or newline.
export function csvEscape(v: any): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Render the outreach persons list to a GHL-import CSV string.
export function personsToOutreachCsv(persons: any[]): string {
  const headers = [
    'Name', 'Email', 'Secondary Emails', 'LinkedIn URL',
    'Claim Readiness', 'Has Account', 'Deep Link',
    'Country', 'Industry', 'Role Notes (do not personalize)', 'Company', 'Season Count',
  ];
  const rows = [headers.map(csvEscape).join(',')];
  for (const p of persons) {
    rows.push([
      p.name, p.email, p.secondaryEmails, p.linkedinUrl,
      p.claimReadiness, p.hasAccount ? 'yes' : 'no', p.deepLink,
      p.country, p.industry, p.professionalRole, p.company, p.seasonCount,
    ].map(csvEscape).join(','));
  }
  return rows.join('\n');
}