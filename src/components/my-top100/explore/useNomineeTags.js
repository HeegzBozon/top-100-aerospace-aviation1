import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The directory's own vocabulary.
//
// The approved NomineeTag rows, weighted by how many people carry them, and indexed back
// onto the people themselves. Keyed by lowercased name so a tag typed two ways is one
// word; counted per person, never per row, so an upvote never inflates a weight.
//
// The index has to survive the pool's own reading of the records. The directory shows one
// name per person — the newest record of that name — while the tags were filed against the
// older duplicates, so a tag keyed on the record id alone points at a record the roll never
// draws. They are therefore indexed twice: by record id, and by the person's name, resolved
// through one read of the tagged records. Either one finds the person their tags.
//
// It is a reading aid only: nothing here reaches ordering, measurement or scoring.
const normalize = (name) => (name || '').trim().toLowerCase();

const toLabel = (raw) =>
  raw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const EMPTY = new Set();

export default function useNomineeTags(enabled) {
  const [tags, setTags] = useState([]);
  const [index, setIndex] = useState({ byRecord: new Map(), byName: new Map() });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setLoading(true);

    (async () => {
      const page = await base44.entities.NomineeTag.filter(
        { status: 'approved' },
        { sort: '-upvotes', limit: 6000, fields: ['nominee_id', 'tag_name', 'category', 'upvotes'] }
      );
      const rows = page.items || [];
      if (!active) return;

      // The names the tags were filed against, so a tag can follow the person onto the
      // record the directory actually draws.
      const ids = [...new Set(rows.map((row) => row.nominee_id).filter(Boolean))];
      const recordNames = new Map();
      for (let index = 0; index < ids.length; index += 500) {
        const records = await base44.entities.Nominee.filter(
          { id: { $in: ids.slice(index, index + 500) } },
          { limit: 500, fields: ['id', 'name'] }
        );
        (records.items || []).forEach((record) => {
          const key = normalize(record.name);
          if (key) recordNames.set(record.id, key);
        });
      }
      if (!active) return;

      const byRecord = new Map();
      const byName = new Map();
      const tally = new Map();

      const hold = (map, key, tagKey) => {
        if (!key) return;
        const held = map.get(key);
        if (held?.has(tagKey)) return;
        if (held) held.add(tagKey);
        else map.set(key, new Set([tagKey]));
      };

      rows.forEach((row) => {
        const label = (row.tag_name || '').trim();
        if (!label || !row.nominee_id) return;

        const tagKey = label.toLowerCase();
        hold(byRecord, row.nominee_id, tagKey);
        hold(byName, recordNames.get(row.nominee_id), tagKey);

        // Weighted per person: a row that repeats a tag for the same person never counts twice.
        const stat = tally.get(tagKey);
        if (stat) {
          stat.people.add(row.nominee_id);
        } else {
          tally.set(tagKey, {
            key: tagKey,
            label: toLabel(label),
            category: row.category,
            people: new Set([row.nominee_id]),
          });
        }
      });

      setIndex({ byRecord, byName });
      setTags(
        [...tally.values()]
          .map(({ people, ...stat }) => ({ ...stat, count: people.size }))
          .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      );
    })()
      .catch(() => {
        // A vocabulary that cannot be read leaves the directory as it was: a cloud is an
        // aid, never the way in.
        if (active) {
          setTags([]);
          setIndex({ byRecord: new Map(), byName: new Map() });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [enabled]);

  // The tags a person carries, whichever record they are filed against.
  const tagSetFor = useCallback(
    (nominee) =>
      index.byRecord.get(nominee?.id) || index.byName.get(normalize(nominee?.name)) || EMPTY,
    [index]
  );

  return { tags, tagSetFor, loading };
}