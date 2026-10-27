import { base44 } from '@/api/base44Client';

// A name in the register, resolved to the record behind it.
//
// The register is built from the issue's own pages, which carry her portrait, her stand
// and her folio — and never an address. The record is read at the moment an action is
// taken, so a hundred names are never loaded to follow one of them, and nothing the
// reader did not ask for is fetched.
export async function readHonoree(entry = {}) {
  const base = {
    name: entry.name || '',
    email: (entry.email || '').trim(),
    title: entry.title || '',
    company: entry.company || '',
    avatar: entry.portrait || entry.avatar || '',
    nomineeId: entry.nomineeId || '',
  };

  // Nothing left to look up: the record is named and addressed, or there is no address to
  // look one up by. A register entry arrives with an id and no address; a ledger row arrives
  // with an address and no id, and each finds the other through her record.
  if (base.nomineeId && base.email) return base;
  if (!base.nomineeId && !base.email.includes('@')) return base;

  let record = null;
  try {
    if (base.nomineeId) {
      record = await base44.entities.Nominee.get(base.nomineeId);
    } else {
      const found = await base44.entities.Nominee.filter({ nominee_email: base.email }, '-created_date', 1);
      record = found?.[0] || null;
    }
  } catch {
    record = null;
  }

  if (!record) return base;

  const email = (record.nominee_email || record.claimed_by_user_email || base.email || '').trim();
  return {
    ...base,
    nomineeId: base.nomineeId || record.id,
    // An address an institution can actually write to, or none at all: a record with a broken
    // address is treated as a record with no address, never as a reason to guess.
    email: email.includes('@') ? email : '',
    name: base.name || record.name || '',
    title: base.title || record.title || record.professional_role || '',
    company: base.company || record.company || record.organization || '',
    avatar: base.avatar || record.avatar_url || record.photo_url || '',
  };
}

export const personKey = (value) => (value || '').trim().toLowerCase();

// A name split the way the rolodex keeps one.
export function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first_name: parts[0] || '', last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}