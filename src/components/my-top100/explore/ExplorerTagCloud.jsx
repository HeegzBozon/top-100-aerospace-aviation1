import { useState } from 'react';
import { X } from 'lucide-react';

// The cloud, back — and read the way the old one was.
//
// The words the records actually carry, set at the weight of how many people in the
// current reading hold them. The cloud is handed the reading, not the whole vocabulary,
// so the words it offers are the ones that co-occur with what is already picked: every
// suggestion lands on someone, and a second tag narrows rather than dead-ends.
//
// Press a word to add it, press it again to take it off. The picks stand above the words
// as keys with their own crosses, so a stack is always visible and always undoable, and
// one key clears the whole stack.
//
// A vocabulary this broad is not one jumble, so it is read by kind — a skill, a field, a
// technology, a place — with Places held apart because geography is the heaviest family in
// the records and would otherwise drown every other word.
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
  const words = tags || [];
  if (words.length === 0 && selected.length === 0) return null;

  const kinds = KINDS.filter((entry) => entry.key === 'all' || words.some((tag) => tag.category === entry.key));
  const inKind = kind === 'all' ? words : words.filter((tag) => tag.category === kind);
  const max = inKind[0]?.count || 1;
  const shown = expanded ? inKind : inKind.slice(0, CLOUD_CAP);

  return (
    <section className="border-b border-editorial-navy/10 bg-editorial-sand/40 px-4 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="pd-label text-[8.5px]">
          {selected.length > 0 ? `${selected.length} tag${selected.length === 1 ? '' : 's'} holding` : 'Read by tag'}
        </p>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-copper underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            Clear tags
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

      {words.length === 0 ? (
        <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/55">
          Nothing in this reading carries another tag.
        </p>
      ) : (
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {shown.map((tag) => {
            const active = selected.some((picked) => picked.key === tag.key);
            return (
              <button
                key={tag.key}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(tag)}
                title={`${tag.count} ${tag.count === 1 ? 'name' : 'names'}${active ? ' · press again to remove' : ''}`}
                style={{ fontSize: sizeFor(tag.count, max) }}
                className={`font-body leading-tight transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                  active
                    ? 'font-bold text-editorial-copper underline decoration-editorial-copper/60 underline-offset-2'
                    : 'text-editorial-navy/70 hover:text-editorial-navy'
                }`}
              >
                {tag.label}
                {active && <span className="text-editorial-copper/70"> ×</span>}
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
      )}
    </section>
  );
}