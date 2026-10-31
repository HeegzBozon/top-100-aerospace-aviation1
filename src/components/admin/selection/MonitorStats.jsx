import { Menu } from 'lucide-react';

// The monitor's statistics, as one strip of small plates across the head of the surface.
// A figure, what it counts, and nothing else — the board underneath carries the story.
// On a phone the strip also carries the way into the sections, since the surface has
// given up the header bar to the ledger.

const FIGURES = [
  { key: 'ballots', label: 'Ballots cast' },
  { key: 'marks', label: 'Marks recorded' },
  { key: 'sealed', label: 'Sealed' },
  { key: 'ballot_lines', label: 'Ballot lines' },
];

const num = (value) => (Number(value) || 0).toLocaleString();

export default function MonitorStats({ totals, onOpenMenu }) {
  return (
    <div className="flex items-stretch gap-1.5">
      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open the admin sections"
          className="flex w-9 flex-shrink-0 items-center justify-center rounded-lg border border-editorial-navy/10 bg-white text-editorial-navy/60 transition-colors hover:text-editorial-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/60 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <dl className="grid flex-1 grid-cols-4 gap-1.5">
        {FIGURES.map((figure) => (
          <div
            key={figure.key}
            className="rounded-lg border border-editorial-navy/10 bg-white px-1.5 py-1.5"
          >
            <dt className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
              {figure.label}
            </dt>
            <dd className="mt-0.5 font-heading text-[17px] leading-none tabular-nums text-editorial-navy">
              {num(totals?.[figure.key])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}