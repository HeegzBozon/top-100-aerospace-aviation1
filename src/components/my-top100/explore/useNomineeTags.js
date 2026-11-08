import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The directory's own vocabulary.
//
// The old front-of-house page carried a cloud of tags over its roll — the approved
// NomineeTag rows, weighted by how many Fellows they were filed against. The records are
// still there, so the same reading is available again: every approved tag, how many
// people carry it, and which record carries which. Keyed by lowercased name so a tag
// typed two ways is one word; counted per person, never per row, so an upvote never
// inflates a weight.
//
// It is a reading aid only: nothing here reaches ordering, measurement or scoring.
const toLabel = (raw) =>
  raw
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export default function useNomineeTags(enabled) {
  const [tags, setTags] = useState([]);
  const [byNominee, setByNominee] = useState(() => new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setLoading(true);
    base44.entities.NomineeTag.filter(
      { status: 'approved' },
      { sort: '-upvotes', limit: 2000, fields: ['nominee_id', 'tag_name', 'category', 'upvotes'] }
    )
      .then((page) => {
        if (!active) return;
        const index = new Map();
        const tally = new Map();
        (page.items || []).forEach((row) => {
          const label = (row.tag_name || '').trim();
          if (!label || !row.nominee_id) return;

          const key = label.toLowerCase();
          const held = index.get(row.nominee_id) || new Set();
          if (held.has(key)) return;
          held.add(key);
          index.set(row.nominee_id, held);

          const stat = tally.get(key) || { key, label: toLabel(label), count: 0, category: row.category };
          stat.count += 1;
          tally.set(key, stat);
        });

        setByNominee(index);
        setTags([...tally.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)));
      })
      .catch(() => {
        // A vocabulary that cannot be read leaves the directory as it was: a cloud is an
        // aid, never the way in.
        if (active) {
          setTags([]);
          setByNominee(new Map());
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [enabled]);

  return { tags, byNominee, loading };
}