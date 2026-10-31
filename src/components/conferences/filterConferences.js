// The circuit's search. A reader's words are matched against the record's own printed
// facts — the name, the series, the organizer and the place — and against nothing else.
// No score, no count and no transaction field is ever read to decide what the board shows.
const SEARCHABLE = ['conference_name', 'conference_series', 'organizer', 'city', 'country', 'venue'];

const haystack = (room) =>
  SEARCHABLE.map((field) => room?.[field])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

// Every word must be found, in any order, so "paris space" reads the Paris space shows.
export function filterRooms(rooms, { query, domain } = {}) {
  const needle = (query || '').trim().toLowerCase();
  const words = needle ? needle.split(/\s+/) : [];

  return (rooms || []).filter((room) => {
    if (domain && room?.domain_focus !== domain) return false;
    if (!words.length) return true;
    const text = haystack(room);
    return words.every((word) => text.includes(word));
  });
}