// ── One ladder, one meaning ──
//
// A record's credential is read in exactly one place, so every surface says the
// same word for the same state. The enum holds four rungs and each one now has
// something that can actually produce it:
//
//   unverified          no account is attached to the record
//   self_verified       an account is attached, and its email or LinkedIn matched
//   partially_verified  a work address at the stated employer was confirmed
//   fully_verified      a member of the committee checked the record by hand
//
// The rung is DERIVED from the named checks rather than stored and trusted, so a
// check added later (a document check, say) only has to be named here and every
// screen follows without being touched.

export type VerificationRung =
  | 'unverified'
  | 'self_verified'
  | 'partially_verified'
  | 'fully_verified';

export type VerificationChecks = {
  linkedin_verified?: boolean;
  employer_verified?: boolean;
  sme_reviewed?: boolean;
  metrics_validated?: boolean;
  ecosystem_validated?: boolean;
};

// Consumer mailboxes can never confirm an employer. A work address at one of these
// domains proves a person reads their post, nothing more.
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'ymail.com',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com', 'windowslive.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me',
  'gmx.com', 'gmx.de', 'gmx.net', 'mail.com', 'mail.ru', 'yandex.com', 'yandex.ru',
  'zoho.com', 'hey.com', 'fastmail.com', 'tutanota.com', 'web.de', 'orange.fr',
  'free.fr', 'laposte.net', 'bol.com.br', 'uol.com.br', 'qq.com', '163.com', '126.com',
  'naver.com', 'daum.net', 'hanmail.net', 'rediffmail.com', 'rocketmail.com',
]);

export function domainOf(email: string | null | undefined): string {
  const parts = String(email || '').trim().toLowerCase().split('@');
  if (parts.length !== 2) return '';
  return parts[1].replace(/[^a-z0-9.-]/g, '');
}

export function isWorkDomain(email: string | null | undefined): boolean {
  const domain = domainOf(email);
  if (!domain || !domain.includes('.')) return false;
  if (PERSONAL_DOMAINS.has(domain)) return false;
  // A bare suffix is not a mailbox anyone works from.
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);
}

// Every label of the domain except the public suffix. sub.boeing.com yields
// ['sub', 'boeing'], so the agency name is found wherever it sits.
export function domainTokens(domain: string | null | undefined): string[] {
  const parts = String(domain || '').toLowerCase().split('.').filter(Boolean);
  if (parts.length < 2) return [];
  return parts.slice(0, -1);
}

function lettersOnly(value: string | null | undefined): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const STOPWORDS = new Set(['of', 'the', 'and', 'for', 'a', 'an', 'at', 'in']);

// Federal Aviation Administration → faa; National Aeronautics and Space
// Administration → nasa. An institution is named in full on a record far more often
// than it is written as its domain, so the initials have to count.
function acronymsOf(value: string | null | undefined): string[] {
  const words = String(value || '')
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word && !STOPWORDS.has(word.toLowerCase()));
  if (words.length < 2) return [];
  const initials = words.map((word) => word[0]).join('').toLowerCase();
  return initials.length >= 2 ? [initials] : [];
}

// Does the domain speak for the organisation named on the record?
export function employerMatchesDomain(
  employer: string | null | undefined,
  domain: string | null | undefined,
): boolean {
  const name = lettersOnly(employer);
  if (name.length < 3) return false;
  const initials = acronymsOf(employer);
  for (const token of domainTokens(domain)) {
    if (token.length < 3) continue;
    if (name.includes(token)) return true;
    if (name.length >= 4 && token.includes(name)) return true;
    if (initials.includes(token)) return true;
  }
  return false;
}

// An address already held on the record carries its own weight: whoever nominated
// this person put it there, and the only way to answer a code sent to it is to hold
// the mailbox.
export function domainOnRecord(
  domain: string | null | undefined,
  nominee: any,
): boolean {
  if (!domain) return false;
  const emails = [
    nominee?.nominee_email,
    ...(Array.isArray(nominee?.secondary_emails) ? nominee.secondary_emails : []),
  ];
  return emails.some((address) => domainOf(address) === domain);
}

export type DomainVerdict =
  | { ok: true; domain: string; basis: 'on_record' | 'employer' | 'unnamed' }
  | { ok: false; reason: 'personal' | 'malformed' | 'unmatched'; domain: string };

// The decision the work-email desk makes before it sends anything.
//
// What the code proves is that a person holds a mailbox at that domain. What the
// record adds is which employer that is meant to be. So the rule runs in three steps:
// a personal mailbox proves nothing about an employer and is refused; an address the
// record already carries is taken as the same employer; a named employer must own the
// domain. Only a domain that contradicts a named employer is turned away.
//
// A record that names no employer is not held against the Fellow — most of the index
// names none, and refusing them would make the check unreachable for almost everyone.
// A proven work mailbox is still a proven work mailbox.
export function verifyWorkDomain(
  workEmail: string | null | undefined,
  nominee: any,
): DomainVerdict {
  const domain = domainOf(workEmail);
  if (!domain) return { ok: false, reason: 'malformed', domain: '' };
  if (!isWorkDomain(workEmail)) return { ok: false, reason: 'personal', domain };
  if (domainOnRecord(domain, nominee)) return { ok: true, domain, basis: 'on_record' };
  const employer = nominee?.company || nominee?.organization;
  if (!String(employer || '').trim()) return { ok: true, domain, basis: 'unnamed' };
  if (employerMatchesDomain(employer, domain)) return { ok: true, domain, basis: 'employer' };
  return { ok: false, reason: 'unmatched', domain };
}

// The rung a record stands on, read from what is actually confirmed about it.
export function rungOf(nominee: any): VerificationRung {
  if (nominee?.claim_status !== 'approved') return 'unverified';
  const checks: VerificationChecks = nominee?.verification_status || {};
  if (checks.sme_reviewed) return 'fully_verified';
  if (checks.employer_verified) return 'partially_verified';
  return 'self_verified';
}

// The two fields a verification write always moves together, so the enum and the
// named checks can never disagree. `nominee` is the record as it will stand after
// the write (claim status included); `checks` is what this write newly confirms.
export function verifiedFields(nominee: any, checks: VerificationChecks = {}) {
  const verification_status = { ...(nominee?.verification_status || {}), ...checks };
  return {
    verification_status,
    verified_status: rungOf({ ...nominee, verification_status }),
  };
}