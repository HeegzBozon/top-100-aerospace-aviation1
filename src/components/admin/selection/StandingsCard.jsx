import StandingMovement from './StandingMovement';

// One nominee in one column: where they stand, which way they moved, and the figure that
// column is ordered by. The measure's own note sits under it, so a dash is never mistaken
// for a zero and a projection never mistaken for a cast ballot. The whole card opens the
// nominee's full reading.

function measureFor(column, row) {
  if (column.key === 'borda') {
    return {
      value: row.borda_projected ? Math.round(row.borda_projected) : '—',
      note: row.borda_cast ? `${Math.round(row.borda_cast)} cast` : 'no ballot cast',
    };
  }
  if (column.key === 'elo') {
    const weighed = row.appearances > 0 || row.elo !== 1200;
    return { value: weighed ? Math.round(row.elo) : '—', note: `${row.appearances} marks` };
  }
  const measured = row.borda_projected > 0 || row.appearances > 0;
  return { value: measured ? row.combined_index : '—', note: `${row.wins} W · ${row.losses} L` };
}

function edgeTone(move) {
  if (move.isNew) return 'bg-editorial-label/50';
  if (move.delta > 0) return 'bg-editorial-copper';
  if (move.delta < 0) return 'bg-editorial-navy/25';
  return 'bg-transparent';
}

export default function StandingsCard({ row, rank, move = {}, since, column, onOpen }) {
  const measure = measureFor(column, row);

  return (
    <button
      type="button"
      onClick={() => onOpen?.({ row, rank, move, column })}
      title={`Open ${row.name}'s full reading`}
      className="relative block w-full overflow-hidden rounded-md border border-editorial-navy/10 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-editorial-copper/50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/60"
    >
      <span className={`absolute inset-y-0 left-0 w-[2px] ${edgeTone(move)}`} aria-hidden="true" />

      <span className="flex items-center gap-1.5">
        <span className="font-heading text-[11px] tabular-nums text-editorial-navy/40">{rank}</span>
        <StandingMovement delta={move.delta} isNew={move.isNew} since={since} />
        <span className="ml-auto truncate text-[9px] uppercase tracking-[0.14em] text-editorial-navy/35">
          {row.cohort_label || ''}
        </span>
      </span>

      <span className="mt-0.5 flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold leading-tight text-editorial-navy">
            {row.name}
          </span>
          <span className="block truncate text-[10px] leading-tight text-editorial-navy/50">
            {[row.title, row.company].filter(Boolean).join(' · ') || '—'}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-heading text-[13px] leading-none tabular-nums text-editorial-navy">
            {measure.value}
          </span>
          <span className="mt-0.5 block text-[8.5px] uppercase tracking-[0.12em] text-editorial-navy/40">
            {measure.note}
          </span>
        </span>
      </span>
    </button>
  );
}