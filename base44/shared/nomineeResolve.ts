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