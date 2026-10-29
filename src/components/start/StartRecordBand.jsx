import { Link } from 'react-router-dom';
import { RECORD_SURFACES, recordUrl } from '@/components/record/recordMenu';

// The Fellow's own record, offered on the title screen as six keys. Each key carries
// its surface's own count, so the checklist is visible before it is opened — and the
// row reports one figure for the record as a whole.
export default function StartRecordBand({ surfaces, overall, loading }) {
  const byKey = Object.fromEntries((surfaces || []).map((surface) => [surface.key, surface]));

  return (
    <section aria-label="Your record" className="mt-7">
      <div className="flex items-center gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-editorial-gold/85">
          Your record
        </p>
        <span
          className="h-px flex-1"
          style={{
            background: 'linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.38), transparent)',
          }}
        />
        <p className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-cream/50 tabular-nums">
          {loading ? 'Reading' : `${overall?.percent ?? 0}% complete`}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
        {RECORD_SURFACES.map((surface) => {
          const state = byKey[surface.key];
          const Icon = surface.icon;
          return (
            <Link
              key={surface.key}
              to={recordUrl(surface.key)}
              className="group relative flex flex-col justify-between gap-2 rounded-[10px] border border-editorial-gold/25 bg-white/[0.045] px-3 py-3 transition-colors hover:border-editorial-gold/60 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-editorial-gold"
            >
              <span className="flex items-center justify-between gap-2">
                <Icon className="h-3.5 w-3.5 text-editorial-gold" strokeWidth={1.8} />
                <span className="font-body text-[9px] font-bold tabular-nums tracking-[0.14em] text-editorial-cream/45">
                  {state ? `${state.done}/${state.total}` : '—'}
                </span>
              </span>
              <span className="block font-body text-[11px] leading-tight text-editorial-cream/85">
                {surface.label}
              </span>
              <span
                aria-hidden="true"
                className="block h-[2px] w-full overflow-hidden rounded-full bg-editorial-cream/12"
              >
                <span
                  className="block h-full rounded-full bg-editorial-gold transition-[width] duration-700"
                  style={{ width: `${state?.percent ?? 0}%` }}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}