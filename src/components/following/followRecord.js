// A follow stands against a profile, never an address.
//
// The row the platform keeps still carries an address, because that is how a Follow has
// always been written and how a followed Fellow reads back the community that keeps her.
// But the identity of a follow is the record it points at: the address is only what the row
// can say about that record, and most records have none to say. So every follow carries
// following_profile_id, and where a record holds no address the address column holds the
// profile's own key instead — never an invented inbox.

export function profileIdOf(person = {}) {
  return String(person.id || person.nomineeId || person.nominee_id || '').trim();
}

export function addressOf(person = {}) {
  return String(person.email || person.nominee_email || person.claimed_by_user_email || '').trim();
}

export const profileAddressKey = (profileId) => (profileId ? `nominee:${profileId}` : '');

// What a follow of this person is written as.
export function followTarget(person = {}) {
  const profileId = profileIdOf(person);
  const email = addressOf(person);
  return {
    profileId,
    email,
    stored: email.includes('@') ? email : profileAddressKey(profileId),
  };
}

// The key a follow is held under on both sides of the row, so a name followed anywhere is
// the same follow everywhere.
export function followKey(person = {}) {
  const { profileId, stored } = followTarget(person);
  return profileId || stored;
}

export function rowKey(row = {}) {
  return String(row.following_profile_id || row.following_email || '').trim();
}

// Whether a row already stands for this person: on the profile first, and on the address
// for rows written before follows carried one.
export function rowStandsFor(row, person = {}) {
  if (!row) return false;
  const { profileId, email, stored } = followTarget(person);
  const rowProfile = String(row.following_profile_id || '').trim();
  if (profileId && rowProfile) return rowProfile === profileId;
  if (stored && row.following_email === stored) return true;
  if (email && row.following_email === email) return true;
  return false;
}