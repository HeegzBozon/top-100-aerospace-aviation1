import moment from 'moment';
import { Loader2, RotateCcw } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { resolveCommitteePhase } from '@/components/fellow-home/season/useCommitteePhase';

const fmt = (value) => (value ? moment(value).format('D MMM YYYY') : null);

const ROWS = [
  { label: 'Nominations', from: 'nomination_start', to: 'nomination_end' },
  { label: 'Voting', from: 'voting_start', to: 'voting_end' },
  { label: 'Review', from: 'review_start', to: 'review_end' },
  { label: 'Season closes', to: 'end_date' },
];

const window_ = (row, season) => {
  const from = fmt(season[row.from]);
  const to = fmt(season[row.to]);
  if (from && to) return `${from} → ${to}`;
  if (to) return `Until ${to}`;
  return from;
};

// The cycle as the calendar actually holds it: the live phase, then the dates
// the season carries. If the season has no dates set, the row is simply not
// shown — a ledger never invents a date.
export default function BriefingWhen({ season, loading, failed, onRetry }) {
  if (loading) {
    return (
      <div className="mt-5 flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: B.copper }} />
        <span className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          Reading the calendar
        </span>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mt-5 rounded-xl px-3.5 py-3" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
        <p className="text-[12px]" style={{ color: B.muted }}>
          The calendar could not be read. The course stands without it.
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
    );
  }

  if (!season) {
    return (
      <div className="mt-5 rounded-xl px-3.5 py-3.5" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
        <p className="font-heading text-[15px]" style={{ color: B.navy }}>
          No cycle is on the calendar yet.
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: B.muted }}>
          When the next season opens its window, the phase and every date on it appear here — the same
          calendar the dashboard counts down from.
        </p>
      </div>
    );
  }

  const phase = resolveCommitteePhase(season);
  const rows = ROWS.map((row) => ({ label: row.label, value: window_(row, season) })).filter((row) => row.value);

  return (
    <div className="mt-5 overflow-hidden rounded-xl" style={{ background: '#FFFFFF', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between gap-3 px-3.5 py-3" style={{ borderBottom: `1px solid ${B.border}` }}>
        <span className="min-w-0">
          <span className="block truncate font-heading text-[15px]" style={{ color: B.navy }}>
            {season.name}
          </span>
          <span className="mt-0.5 block text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
            {phase?.label || 'Cycle'}
          </span>
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
          style={{ background: 'rgba(201,168,124,0.2)', border: '1px solid rgba(184,115,51,0.3)', color: B.copper }}
        >
          {String(season.status || '').replace(/_/g, ' ') || 'Planning'}
        </span>
      </div>

      <dl className="px-3.5 py-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="text-[8.5px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
              {row.label}
            </dt>
            <dd className="text-[12.5px] font-semibold" style={{ color: B.navy }}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}