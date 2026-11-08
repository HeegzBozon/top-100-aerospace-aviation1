import { useState } from 'react';
import { X } from 'lucide-react';

// The cloud, back.
//
// A tag cloud is a way of reading a field at a glance: the words the records actually
// carry, set at the weight of how many people carry them, so the shape of the pool is
// legible before a single name is read. Press a word and the roll narrows to the people
// under it; press several and it narrows to the people under all of them.
//
// A vocabulary this broad is not one jumble. The tags a record carries are filed by kind —
// a skill, a field, a technology, a place — so the cloud is read by kind first and the
// words it hangs are the ones in that kind. Geography is the heaviest family in the
// records and would otherwise drown every other word.
//
// It is set on cream in navy ink under the copper rule: a printed index, not a toy. With
// no vocabulary to read it draws nothing at all rather than an empty cloud.
const CLOUD_CAP = 24;

const KINDS = [
  { key: 'all', label: 'Everything' },
  { key: 'skill', label: 'Skills' },
  { key: 'technology', label: 'Technology' },
  { key: 'industry', label: 'Fields' },
  { key: 'achievement', label: 'Achievements' },
  { key: 'attribute', label: 'Attributes' },
  { key: 'geography', label: 'Places' },
];

const sizeFor = (count, max) => {
  if (max <= 1) return 12;
  const share = count / max;
  if (share > 0.66) return 17;
  if (share > 0.4) return 14.5;
  if (share > 0.18) return 12.5;
  return 11;
};

export default function ExplorerTagCloud({ tags, selected, onToggle, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [kind, setKind] = useState('all');
  if (!tags || tags.length === 0) return null;

  const kinds = KINDS.filter((entry) => entry.key === 'all' || tags.some((tag) => tag.category === entry.key));
  const inKind = kind === 'all' ? tags : tags.filter((tag) => tag.category === kind);
  const max = inKind[0]?.count || 1;
  const shown = expanded ? inKind : inKind.slice(0, CLOUD_CAP);

  return (
    <section className="border-b border-editorial-navy/10 bg-editorial-sand/40 px-4 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="pd-label text-[8.5px]">
          {selected.length > 0 ? `Narrowed by ${selected.length}` : 'Read by tag'}
        </p>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-copper underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            Clear
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selected.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={() => onToggle(tag)}
              aria-label={`Remove ${tag.label}`}
              className="flex items-center gap-1 border border-editorial-navy bg-editorial-navy px-1.5 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
            >
              {tag.label}
              <X className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {kinds.length > 2 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {kinds.map((entry) => {
            const active = kind === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                aria-pressed={active}
                onClick={() => { setKind(entry.key); setExpanded(false); }}
                className={`font-body text-[8.5px] font-bold uppercase tracking-[0.14em] underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                  active
                    ? 'text-editorial-navy underline decoration-editorial-copper'
                    : 'text-editorial-navy/45 hover:text-editorial-navy/80'
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        {shown.map((tag) => {
          const active = selected.some((picked) => picked.key === tag.key);
          return (
            <button
              key={tag.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(tag)}
              title={`${tag.count} ${tag.count === 1 ? 'name' : 'names'}`}
              style={{ fontSize: sizeFor(tag.count, max) }}
              className={`font-body leading-tight transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                active
                  ? 'font-bold text-editorial-copper underline decoration-editorial-copper/60 underline-offset-2'
                  : 'text-editorial-navy/70 hover:text-editorial-navy'
              }`}
            >
              {tag.label}
            </button>
          );
        })}

        {inKind.length > CLOUD_CAP && (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-editorial-label underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            {expanded ? 'Fewer' : `+${inKind.length - CLOUD_CAP}`}
          </button>
        )}
      </div>
    </section>
  );
}