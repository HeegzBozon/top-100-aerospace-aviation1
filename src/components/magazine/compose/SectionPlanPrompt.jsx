import { Plus, Sparkles, X } from 'lucide-react';
import { SECTION_GROUPS, SECTION_TYPES } from '@/components/magazine/magazineConfig';
import { HOUSE_BLUEPRINT } from './composeConfig';

// What runs through the issue.
//
// The plan is written in place — a name, a place in the book, a kind — and reordered
// with the arrow under the number. The house blueprint and the editor's own plan are
// both offered as a whole, and a section can be taken out without ceremony.

export default function SectionPlanPrompt({ sections = [], onChange, onAsk, asking }) {
  const update = (id, patch) =>
    onChange(sections.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  const remove = (id) => onChange(sections.filter((section) => section.id !== id));
  const add = () =>
    onChange([
      ...sections,
      { id: `sec-${Date.now()}`, name: 'New Section', section_type: 'evergreen', section_group: 'well' },
    ]);
  const move = (i, dir) => {
    const next = [...sections];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div className="mt-6">
      {sections.length === 0 ? (
        <p className="border-t border-editorial-navy/10 pt-4 font-heading text-[16px] italic text-editorial-navy/45">
          Nothing runs through it yet.
        </p>
      ) : (
        <ul className="divide-y divide-editorial-navy/10 border-y border-editorial-navy/10">
          {sections.map((section, i) => (
            <li key={section.id} className="flex flex-wrap items-center gap-2 py-2">
              <div className="flex flex-col leading-none">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="text-[9px] text-editorial-navy/40 hover:text-editorial-navy disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === sections.length - 1}
                  aria-label="Move down"
                  className="text-[9px] text-editorial-navy/40 hover:text-editorial-navy disabled:opacity-20"
                >
                  ▼
                </button>
              </div>
              <span className="w-6 font-heading text-[11px] text-editorial-copper">
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                value={section.name}
                onChange={(e) => update(section.id, { name: e.target.value })}
                aria-label={`Section ${i + 1} name`}
                className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 font-heading text-[15px] text-editorial-navy outline-none focus:ring-0"
              />
              <select
                value={section.section_group}
                onChange={(e) => update(section.id, { section_group: e.target.value })}
                aria-label={`Section ${i + 1} place in the book`}
                className="border-0 bg-transparent font-body text-[9px] uppercase tracking-[0.14em] text-editorial-navy/50 outline-none focus:ring-0"
              >
                {SECTION_GROUPS.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.label}
                  </option>
                ))}
              </select>
              <select
                value={section.section_type}
                onChange={(e) => update(section.id, { section_type: e.target.value })}
                aria-label={`Section ${i + 1} kind`}
                className="border-0 bg-transparent font-body text-[9px] uppercase tracking-[0.14em] text-editorial-navy/50 outline-none focus:ring-0"
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(section.id)}
                aria-label={`Remove ${section.name}`}
                className="text-editorial-navy/30 hover:text-editorial-copper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy/60 hover:text-editorial-navy"
        >
          <Plus className="h-3.5 w-3.5" /> Add a section
        </button>
        <button
          type="button"
          onClick={() => onChange(HOUSE_BLUEPRINT())}
          className="inline-flex items-center gap-1 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy/60 hover:text-editorial-navy"
        >
          The house blueprint
        </button>
        <button
          type="button"
          onClick={onAsk}
          disabled={asking}
          className="inline-flex items-center gap-1.5 border-b border-editorial-copper/50 pb-0.5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-copper hover:opacity-70 disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {asking ? 'The editor is reading…' : 'Ask for a plan'}
          <kbd className="rounded-sm border border-editorial-copper/30 px-1 text-[9px] tracking-normal">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}