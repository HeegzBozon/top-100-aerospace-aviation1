import { Check } from 'lucide-react';

// One field on the chart: a name, the work it holds, and the mark that it is the one in
// hand. A press is the whole of it — the choice is filed from the key below the chart,
// never by choosing.
export default function SpecialtyOption({ specialty, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(specialty.key)}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-[10px] border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-1 ${
        selected
          ? 'border-editorial-copper bg-editorial-sand/60'
          : 'border-editorial-copper/25 bg-editorial-cream hover:border-editorial-copper/55'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
          selected ? 'border-editorial-copper bg-editorial-copper text-editorial-cream' : 'border-editorial-copper/45'
        }`}
      >
        {selected && <Check className="h-2.5 w-2.5" />}
      </span>
      <span className="min-w-0">
        <span className="block font-body text-[12.5px] font-bold leading-tight text-editorial-navy">
          {specialty.label}
        </span>
        <span className="mt-1 block font-body text-[11px] leading-relaxed text-editorial-navy/60">
          {specialty.line}
        </span>
      </span>
    </button>
  );
}