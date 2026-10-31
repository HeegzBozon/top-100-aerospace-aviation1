import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The title screen's dashboard: one objective, the key results that measure it, and the
// circuit's own readings. Every number is the reader's private progress; none of it is
// read by discovery or measurement.
async function countOr(entity, query) {
  try { return await base44.entities[entity].count(query); } catch { return null; }
}

function useKeyResults() {
  const [kr, setKr] = useState({ loading: true });
  useEffect(() => {
    Promise.all([
      countOr('ConferenceContact', {}),
      countOr('ConferenceContact', { follow_up_sent: true }),
      countOr('ConferenceContact', { outcome: { $in: ['meeting', 'opportunity', 'won'] } }),
    ]).then(([captured, sent, outcomes]) => setKr({ loading: false, captured, sent, outcomes }));
  }, []);
  return kr;
}

const show = (v, loading) => (loading || v == null ? '—' : v);

function Cell({ label, value, i }) {
  return (
    <div className={`px-2.5 py-2 ${i % 3 ? 'cfs-seam' : ''}`}>
      <p className="truncate text-[7.5px] font-bold uppercase tracking-[0.18em] text-editorial-gold/80">{label}</p>
      <p className="mt-1 font-heading text-[18px] leading-none tabular-nums text-editorial-cream">{value}</p>
    </div>
  );
}

export default function ConferenceScorecard({ loading, failed, counts }) {
  const kr = useKeyResults();
  const circuit = loading || failed;
  const pct = kr.captured ? Math.round(((kr.sent || 0) / kr.captured) * 100) : 0;
  const cells = [
    { label: 'Ahead', value: circuit ? '—' : counts.ahead },
    { label: 'In session', value: circuit ? '—' : counts.live },
    { label: 'Declared', value: circuit ? '—' : counts.declared },
    { label: 'Captured', value: show(kr.captured, kr.loading) },
    { label: 'Followed up', value: show(kr.sent, kr.loading) },
    { label: 'Outcomes', value: show(kr.outcomes, kr.loading) },
  ];

  return (
    <section className="cfs-readout overflow-hidden rounded-[9px]">
      <div className="px-3 pb-2.5 pt-3">
        <p className="text-[7.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">Objective</p>
        <p className="mt-1 font-heading text-[15px] leading-tight text-editorial-cream">
          Turn every show into relationships that move
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-editorial-cream/12">
            <div className="h-full rounded-full bg-editorial-copper" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-editorial-cream/60">{pct}% closed</span>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-editorial-copper/30">
        {cells.slice(0, 3).map((c, i) => <Cell key={c.label} {...c} i={i} />)}
      </div>
      <div className="grid grid-cols-3 border-t border-editorial-copper/20">
        {cells.slice(3).map((c, i) => <Cell key={c.label} {...c} i={i} />)}
      </div>
    </section>
  );
}