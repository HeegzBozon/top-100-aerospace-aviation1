// The record's credential, read one way everywhere.
//
// Every surface that speaks about verification asks this file what to say, so a
// profile cannot call a record "partially verified" in one place and "verified
// professional" in another. The rung is derived from the named checks, never from
// a stored word that a screen has to trust.

export const RUNGS = [
  {
    key: 'unverified',
    label: 'Unverified',
    hint: 'No account is attached to this record yet.',
  },
  {
    key: 'self_verified',
    label: 'Self verified',
    hint: 'An account is attached, and its email or LinkedIn matched the record.',
  },
  {
    key: 'partially_verified',
    label: 'Verified professional',
    hint: 'A work address has been confirmed for this record.',
  },
  {
    key: 'fully_verified',
    label: 'Verified by review',
    hint: 'A member of the committee checked this record by hand.',
  },
];

// The checks a record can carry, in the order they are earned. Only checks that
// something can actually confirm are listed.
export const CHECKS = [
  { key: 'linkedin_verified', label: 'LinkedIn' },
  { key: 'employer_verified', label: 'Employer' },
  { key: 'sme_reviewed', label: 'Committee review' },
];

export const CHECKS_TOTAL = CHECKS.length;

const rankOf = (key) => {
  const index = RUNGS.findIndex((rung) => rung.key === key);
  return index < 0 ? 0 : index;
};

export function rungOf(nominee) {
  if (nominee?.claim_status !== 'approved') return 'unverified';
  const checks = nominee?.verification_status || {};
  if (checks.sme_reviewed) return 'fully_verified';
  if (checks.employer_verified) return 'partially_verified';
  return 'self_verified';
}

export function rung(key) {
  return RUNGS.find((entry) => entry.key === key) || RUNGS[0];
}

export function labelOf(nominee) {
  return rung(rungOf(nominee)).label;
}

export function hintOf(nominee) {
  return rung(rungOf(nominee)).hint;
}

export function checksOf(nominee) {
  const flags = nominee?.verification_status || {};
  return CHECKS.map((check) => ({ ...check, confirmed: flags[check.key] === true }));
}

export function confirmedCount(nominee) {
  return checksOf(nominee).filter((check) => check.confirmed).length;
}

// Whether a rung has been reached, for drawing the ladder ahead of the reader.
export function reached(current, key) {
  return rankOf(current) >= rankOf(key);
}