// The monitor's statistics, as one strip of small plates across the head of the surface.
// A figure, what it counts, and nothing else — the board underneath carries the story.
// The way between admin sections lives in the machine's Edit menu, so no key is printed
// here and the strip is given over entirely to the counts.

const FIGURES = [
  { key: 'ballots', label: 'Ballots cast' },
  { key: 'marks', label: 'Marks recorded' },
  { key: 'sealed', label: 'Sealed' },
  { key: 'ballot_lines', label: 'Ballot lines' },
];

const num = (value) => (Number(value) || 0).toLocaleString();

export default function MonitorStats({ totals }) {
  return (
    <dl className="grid grid-cols-4 gap-1.5">
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
  );
}