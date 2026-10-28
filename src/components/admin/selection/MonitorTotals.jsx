import { Radio, Users, Layers, Scale, Gauge } from 'lucide-react';

// The head of the monitor: what the platform is counting right now, and the window each
// cohort is counting inside. Every number here is a count, never a projection.

const TILES = [
  { key: 'pool', label: 'Standing', hint: 'in the ballot', icon: Users },
  { key: 'ballots', label: 'Ballots', hint: 'ranked lists saved', icon: Layers },
  { key: 'comparisons', label: 'Marks', hint: 'pairwise weights', icon: Scale },
  { key: 'contributors', label: 'Community', hint: 'weighing', icon: Gauge },
  { key: 'votes_per_contributor', label: 'Marks each', hint: 'average', icon: Radio },
];

function fmt(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function WindowLine({ cohort }) {
  const state = cohort.open
    ? { text: 'Counting', tone: '#2E7D5B' }
    : cohort.within_window
      ? { text: 'In window, not open', tone: '#8F5C2C' }
      : { text: 'Closed', tone: 'rgba(30,58,90,0.55)' };
  const end = cohort.voting_end
    ? new Date(cohort.voting_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'no date set';

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-editorial-navy/10 px-3 py-2 first:border-t-0">
      <span className="font-heading text-[13px] text-editorial-navy">{cohort.label}</span>
      <span className="text-[11px] tabular-nums text-editorial-navy/55">
        {fmt(cohort.pool)} standing · {fmt(cohort.ballots)} ballots · {fmt(cohort.comparisons)} marks
      </span>
      <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: state.tone }}>
        {state.text}
      </span>
      <span className="text-[10px] uppercase tracking-[0.14em] text-editorial-navy/45">closes {end}</span>
    </div>
  );
}

export default function MonitorTotals({ totals, cohortStats }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {TILES.map(({ key, label, hint, icon: Icon }) => (
          <div key={key} className="rounded-lg border border-editorial-navy/10 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-editorial-navy/50">
              <Icon className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="mt-1 font-heading text-[22px] leading-none tabular-nums text-editorial-navy">
              {fmt(totals?.[key])}
            </p>
            <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40">{hint}</p>
          </div>
        ))}
      </div>

      {cohortStats?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-editorial-navy/10 bg-editorial-cream">
          {cohortStats.map((cohort) => (
            <WindowLine key={cohort.season_id} cohort={cohort} />
          ))}
        </div>
      )}
    </div>
  );
}