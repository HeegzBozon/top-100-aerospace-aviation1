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

// Resolve whether the authenticated user's email matches this nominee record
// (primary or any secondary email). Self-serve email-match claim gate.
export function emailMatchesNominee(
  userEmail: string | null | undefined,
  nominee: { nominee_email?: string | null; secondary_emails?: string[] | null }
): boolean {
  if (!userEmail) return false;
  const e = userEmail.toLowerCase().trim();
  if (!e) return false;
  if (nominee.nominee_email && nominee.nominee_email.toLowerCase().trim() === e) return true;
  if (Array.isArray(nominee.secondary_emails)) {
    return nominee.secondary_emails.some((s) => s && s.toLowerCase().trim() === e);
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

// Reduce the full nominee pool to one row per person, collapsing cross-season
// nominations of the same email and merging secondary emails. Reused by the
// claim resolver (conceptually) and the outreach export (concretely), so claim
// and outreach logic never diverge.
export function resolveOutreachPersons(
  nominees: any[],
  knownUserEmails: Set<string>
): any[] {
  const byPerson = new Map<string, any>();

  for (const n of nominees || []) {
    const primary = emailKey(n.nominee_email);
    if (!primary) continue;

    const key = primary;
    const existing = byPerson.get(key);

    if (!existing) {
      byPerson.set(key, {
        name: n.name || '',
        primaryEmail: n.nominee_email || '',
        emails: new Set([primary, ...((n.secondary_emails || []).map(emailKey).filter(Boolean))]),
        linkedinUrl: n.linkedin_profile_url || '',
        claimStatus: n.claim_status || 'unclaimed',
        claimedById: n.claimed_by_user_id || '',
        countries: new Set([n.country].filter(Boolean)) as Set<string>,
        industries: new Set([n.industry].filter(Boolean)) as Set<string>,
        professionalRoles: new Set([n.professional_role].filter(Boolean)) as Set<string>,
        companies: new Set([n.company].filter(Boolean)) as Set<string>,
        seasonIds: new Set([n.season_id].filter(Boolean)) as Set<string>,
        nomineeIds: [n.id].filter(Boolean) as string[],
        latestCreated: n.created_date || '',
        representativeId: n.id,
      });
      continue;
    }

    // Merge into existing person.
    existing.emails.add(primary);
    for (const s of n.secondary_emails || []) {
      const k = emailKey(s);
      if (k) existing.emails.add(k);
    }
    if (n.linkedin_profile_url && !existing.linkedinUrl) existing.linkedinUrl = n.linkedin_profile_url;
    if (n.country) existing.countries.add(n.country);
    if (n.industry) existing.industries.add(n.industry);
    if (n.professional_role) existing.professionalRoles.add(n.professional_role);
    if (n.company) existing.companies.add(n.company);
    if (n.season_id) existing.seasonIds.add(n.season_id);
    if (n.id) existing.nomineeIds.push(n.id);
    if (n.claim_status === 'approved' || n.claimed_by_user_id) {
      existing.claimStatus = 'approved';
      existing.claimedById = n.claimed_by_user_id || existing.claimedById;
    }
    if (n.created_date && n.created_date > existing.latestCreated) {
      existing.latestCreated = n.created_date;
      existing.representativeId = n.id || existing.representativeId;
      existing.name = n.name || existing.name;
    }
  }

  const persons: any[] = [];
  for (const p of byPerson.values()) {
    const emailSet = p.emails as Set<string>;
    const primary = emailKey(p.primaryEmail);
    const secondary = [...emailSet].filter((e) => e && e !== primary);
    const hasAccount = [...emailSet].some((e) => knownUserEmails.has(e));
    const normalizedLinkedin = normalizeLinkedInUrl(p.linkedinUrl);

    let readiness: ClaimReadiness;
    if (p.claimStatus === 'approved' || p.claimedById) {
      readiness = 'claimed';
    } else if (primary) {
      readiness = 'claimable-by-email';
    } else if (normalizedLinkedin) {
      readiness = 'claimable-by-linkedin';
    } else {
      readiness = 'no-contact';
    }

    persons.push({
      name: p.name,
      email: p.primaryEmail,
      secondaryEmails: secondary.join('; '),
      linkedinUrl: normalizedLinkedin || p.linkedinUrl,
      claimReadiness: readiness,
      hasAccount,
      deepLink: `${APP_ORIGIN}/profiles/${p.representativeId}?claim=1`,
      country: [...(p.countries as Set<string>)]
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .join('; ') || '',
      industry: [...(p.industries as Set<string>)]
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .join('; ') || '',
      professionalRole: [...(p.professionalRoles as Set<string>)]
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .join('; ') || '',
      company: [...(p.companies as Set<string>)]
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .join('; ') || '',
      seasonCount: (p.seasonIds as Set<string>).size,
    });
  }

  persons.sort((a, b) => {
    const order = ['claimable-by-email', 'claimable-by-linkedin', 'no-contact', 'claimed'];
    const ao = order.indexOf(a.claimReadiness);
    const bo = order.indexOf(b.claimReadiness);
    if (ao !== bo) return ao - bo;
    return a.email.localeCompare(b.email);
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
    'Country', 'Industry', 'Professional Role', 'Company', 'Season Count',
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