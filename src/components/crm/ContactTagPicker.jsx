import { C } from './crmConfig';

// The standing marks a relationship can carry, offered as a row of chips rather than a
// blank field: a tag is a curated word, not a free-form one.
export default function ContactTagPicker({ tags = [], suggestions = [], onChange }) {
  const toggle = (tag) => onChange(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((tag) => {
        const on = tags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            aria-pressed={on}
            className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{
              background: on ? C.navy : C.surface,
              color: on ? C.cream : C.muted,
              border: `1px solid ${on ? C.navy : C.border}`,
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}