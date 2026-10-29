import { BookOpen, Clapperboard } from 'lucide-react';

// The one choice the record offers a visitor: read the dossier, or watch the film.
// Both are drawn from the same canonical record.
export default function DocumentaryModeSwitch({ mode, onChange, chapterCount }) {
  const options = [
    { key: 'read', label: 'Read', icon: BookOpen },
    { key: 'watch', label: 'Watch', icon: Clapperboard },
  ];

  return (
    <div className="border-b border-editorial-gold/25 bg-[#132539]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-10">
        <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.3em] text-editorial-gold/75">
          The record · {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
        </p>

        <div
          role="group"
          aria-label="How to view this record"
          className="flex items-center gap-0.5 rounded-full border border-editorial-cream/15 p-0.5"
        >
          {options.map(({ key, label, icon: Icon }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                  active
                    ? 'bg-editorial-copper text-editorial-cream'
                    : 'text-editorial-cream/60 hover:text-editorial-cream'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.2em]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}