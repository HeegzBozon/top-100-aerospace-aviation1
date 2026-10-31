import { Users, Gauge, Layers } from 'lucide-react';

// The monitor's glance: two numbers big enough to read from across a desk, then the
// shape of the record beneath them. Ballots are what Fellows filed; marks are the sets
// they weighed. Everything else on the surface is the dive under these figures.

function fmt(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function Chip({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg border border-editorial-navy/10 bg-white px-2 py-1.5 shadow-sm">
      <div className="flex items-center gap-1 text-editorial-navy/45">
        <Icon className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate text-[7px] font-bold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-0.5 font-heading text-[17px] leading-none tabular-nums text-editorial-navy">{fmt(value)}</p>
      <p className="mt-0.5 truncate text-[8px] uppercase tracking-[0.1em] text-editorial-navy/35">{sub}</p>
    </div>
  );
}

export default function PulseBand({ totals, mode = 'live' }) {
  const ballots = totals?.ballots || 0;
  const seeded = totals?.seeded || 0;
  const marks = totals?.comparisons || 0;
  const filed = ballots + seeded;
  const castShare = filed ? Math.round((ballots / filed) * 100) : 0;
  const perBallot = ballots > 0 ? Math.round((marks / ballots) * 10) / 10 : 0;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-2 shadow-sm">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-editorial-navy/45">Ballots</p>
          <p className="mt-1 font-heading text-[32px] leading-none tabular-nums text-editorial-navy md:text-[40px]">
            {fmt(ballots)}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-editorial-navy/45">+{fmt(seeded)} seeded</p>
        </div>
        <div className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-2 shadow-sm">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-editorial-navy/45">
            {mode === 'internal' ? 'Internal marks' : 'Marks'}
          </p>
          <p className="mt-1 font-heading text-[32px] leading-none tabular-nums text-editorial-navy md:text-[40px]">
            {fmt(marks)}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-editorial-navy/45">{perBallot} per ballot</p>
        </div>
      </div>

      {/* How much of the record is actually filed, against the drafts standing from
          nominations. One rule, two weights. */}
      <div className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-2 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-editorial-navy/45">Filed</span>
          <span className="text-[9px] font-semibold tabular-nums uppercase tracking-[0.12em] text-editorial-label">
            {castShare}% cast
          </span>
        </div>
        <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-editorial-cream">
          <span className="bg-editorial-navy" style={{ width: `${castShare}%` }} />
          <span className="bg-editorial-gold" style={{ width: `${100 - castShare}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[8px] uppercase tracking-[0.1em] text-editorial-navy/40">
          <span className="tabular-nums">{fmt(ballots)} cast</span>
          <span className="tabular-nums">{fmt(seeded)} seeded</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Chip icon={Users} label="Standing" value={totals?.pool} sub="in the pool" />
        <Chip icon={Gauge} label="Weighing" value={totals?.contributors} sub="Fellows" />
        <Chip
          icon={Layers}
          label="Cohorts"
          value={totals?.open_cohorts}
          sub={`of ${fmt(totals?.cohorts)} counting`}
        />
      </div>
    </div>
  );
}