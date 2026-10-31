// The room's tally, read as one strip beneath the ledger: what has been cast, what is
// still standing as a draft, how much weighing that produced, and how much of the record
// is actually filed. Secondary to the ledger above it — read at a glance, not explained.

const FIGURES = [
  { key: 'cast', label: 'Cast' },
  { key: 'seeded', label: 'Seeded' },
  { key: 'marks', label: 'Marks' },
  { key: 'share', label: 'Filed' },
];

function Figure({ label, value }) {
  return (
    <div>
      <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-editorial-navy/40">{label}</p>
      <p className="mt-0.5 font-heading text-[15px] leading-none tabular-nums text-editorial-navy">{value}</p>
    </div>
  );
}

export default function PulseBand({ totals, mode = 'live' }) {
  const ballots = totals?.ballots || 0;
  const seeded = totals?.seeded || 0;
  const marks = totals?.comparisons || 0;
  const filed = ballots + seeded;
  const share = filed ? Math.round((ballots / filed) * 100) : 0;

  const values = {
    cast: ballots.toLocaleString(),
    seeded: seeded.toLocaleString(),
    marks: marks.toLocaleString(),
    share: mode === 'internal' ? '—' : `${share}%`,
  };

  return (
    <div className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-1.5">
      <div className="flex items-start justify-between gap-2">
        {FIGURES.map((figure) => (
          <Figure key={figure.key} label={figure.label} value={values[figure.key]} />
        ))}
      </div>
      {mode !== 'internal' && (
        <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-editorial-cream">
          <span className="bg-editorial-navy" style={{ width: `${share}%` }} />
          <span className="bg-editorial-gold" style={{ width: `${100 - share}%` }} />
        </div>
      )}
    </div>
  );
}