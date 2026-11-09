// A candidate is named by their name, never by an address.
//
// Some pool records carried an email address in their `name` field: the 2026 legacy
// migration had nothing else to file those old submissions under. A card that printed
// that field published someone's email where their name belongs. Every surface that
// names a candidate reads the name through here, so an address can never be printed
// in a person's place again.
const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isAddress = (value) => ADDRESS.test(String(value ?? '').trim());

export function candidateName(record, fallback = 'Unnamed nominee') {
  const name = String(record?.nominee_name ?? record?.name ?? '').trim();
  return name && !isAddress(name) ? name : fallback;
}