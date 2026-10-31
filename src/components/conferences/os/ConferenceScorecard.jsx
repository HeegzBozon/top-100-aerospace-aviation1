import { useState } from 'react';
import { Pencil } from 'lucide-react';
import useConferenceOkr from './useConferenceOkr';
import OkrEditor from './OkrEditor';
import { METRICS } from './okrTemplates';

// The title screen's dashboard: the Fellow's own objective, its key results measured
// against private readings, and the circuit's state. None of it feeds measurement.
function KeyResult({ label, value, target }) {
  const pct = value == null ? 0 : Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[10px] text-editorial-cream/75">{label}</span>
        <span className="shrink-0 font-heading text-[11px] tabular-nums text-editorial-cream">{value ?? '—'}<span className="text-editorial-cream/40"> / {target}</span></span>
      </div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-editorial-cream/12">
        <div className="h-full rounded-full bg-gradient-to-r from-editorial-copper to-editorial-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ConferenceScorecard({ loading, failed, counts }) {
  const { okr, saved, values, save } = useConferenceOkr();
  const [editing, setEditing] = useState(false);
  const circuit = loading || failed;
  const read = (m) => (m === 'declared' ? (circuit ? null : counts.declared) : values.loading ? null : values[m]);

  return (
    <section className="cfs-readout overflow-hidden rounded-[9px]">
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">
            Objective{saved ? '' : ' · template'}
          </p>
          {!editing && <p className="mt-1 font-heading text-[15px] leading-tight text-editorial-cream">{okr.objective}</p>}
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} aria-label="Edit objective"
            className="shrink-0 rounded-full border border-editorial-cream/20 p-1.5 text-editorial-gold">
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      {editing ? (
        <OkrEditor okr={okr} onSave={save} onClose={() => setEditing(false)} />
      ) : (
        <button type="button" onClick={() => setEditing(true)} aria-label="Edit key results"
          className="block w-full space-y-2 px-3 pb-3 pt-2.5 text-left">
          <p className="flex items-center justify-between text-[7.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">
            Key results <span className="inline-flex items-center gap-1 text-editorial-cream/45"><Pencil className="h-2.5 w-2.5" /> Edit</span>
          </p>
          {okr.key_results.map((kr, i) => (
            <KeyResult key={i} label={METRICS[kr.metric]} value={read(kr.metric)} target={kr.target} />
          ))}
        </button>
      )}

      <div className="grid grid-cols-3 border-t border-editorial-copper/30">
        {[
          ['Lead time · deals', values.lead == null ? null : `${values.lead}d`],
          ['Cycle time · closed', values.cycle == null ? null : `${values.cycle}d`],
          ['Win rate', values.winRate == null ? null : `${values.winRate}%`],
        ].map(([l, v], i) => (
          <div key={l} className={`px-2.5 py-2 ${i ? 'cfs-seam' : ''}`}>
            <p className="truncate text-[7.5px] font-bold uppercase tracking-[0.18em] text-editorial-gold/80">{l}</p>
            <p className="mt-1 font-heading text-[18px] leading-none tabular-nums text-editorial-cream">{values.loading || v == null ? '—' : v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}