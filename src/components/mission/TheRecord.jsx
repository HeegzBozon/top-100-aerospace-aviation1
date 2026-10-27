import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import moment from 'moment';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Everything already published by the institution: the closed cycles in the
// archive, and the editorial surfaces that carry them. Read as a record, not a
// menu — each line says what it is and when it ran.
const EDITORIAL = [
  {
    label: 'Results',
    to: '/Top100Women2025',
    note: 'The editorial record of the 2025 cycle: features, profiles and the results.',
  },
  {
    label: 'Top Viral Posts',
    to: '/viralpost2026',
    note: 'The series that carries the field’s reach, with the takeaway for aerospace attached.',
  },
  {
    label: 'Nine Months of 2026',
    to: '/articles/nine-months-of-2026',
    note: 'The running chronicle of the year, milestone by milestone.',
  },
  {
    label: 'The Monthly Signal',
    to: '/newsletter/may-2026',
    note: 'The newsletter, archived by edition.',
  },
];

const span = (season) => {
  const from = season.start_date ? moment(season.start_date).format('MMM YYYY') : null;
  const to = season.end_date ? moment(season.end_date).format('MMM YYYY') : null;
  if (from && to) return `${from} → ${to}`;
  return from || to || 'Undated';
};

export default function TheRecord({ seasons, loading, failed, onRetry }) {
  const closed = (seasons || []).filter((season) => ['completed', 'archived'].includes(season.status));

  const row = (key, label, to, note, meta) => (
    <Link
      key={key}
      to={to}
      className="group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors"
      style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-heading text-[14.5px] md:text-[15px]" style={{ color: B.navy }}>
            {label}
          </span>
          {meta ? (
            <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
              {meta}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-[12px] leading-relaxed" style={{ color: B.muted }}>
          {note}
        </span>
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: B.copper }} />
    </Link>
  );

  return (
    <div className="mt-5 space-y-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Closed cycles
      </p>

      {loading ? (
        <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: B.copper }} />
          <span className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
            Reading the archive
          </span>
        </div>
      ) : failed ? (
        <div className="rounded-xl px-3.5 py-3" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
          <p className="text-[12px]" style={{ color: B.muted }}>
            The archive could not be read just now.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: B.copper }}
          >
            <RotateCcw className="h-3 w-3" /> Read again
          </button>
        </div>
      ) : closed.length === 0 ? (
        <div className="rounded-xl px-3.5 py-3.5" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
          <p className="font-heading text-[15px]" style={{ color: B.navy }}>
            No cycle has closed yet.
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: B.muted }}>
            The first archive entry appears when this season is finalized. Until then, the editorial
            surfaces below carry everything already published.
          </p>
        </div>
      ) : (
        closed.map((season) =>
          row(season.id, season.name, `/archive/${season.id}`, season.description || 'The finalized record of this cycle, frozen as measured.', span(season))
        )
      )}

      <p className="pt-2 text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Published
      </p>
      {EDITORIAL.map((item) => row(item.to, item.label, item.to, item.note))}
    </div>
  );
}