import { C } from '@/components/crm/crmConfig';

// One rack of the stand: its shingle, the copper rule under it, and what stands on it.
export default function NewsstandRack({ rack, count, children }) {
  return (
    <section aria-labelledby={`rack-${rack.key}`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
            {rack.kicker}
          </p>
          <h2 id={`rack-${rack.key}`} className="mt-1 font-heading text-[19px] leading-tight md:text-[24px]" style={{ color: C.navy }}>
            {rack.label}
          </h2>
        </div>
        <p className="pb-1 text-[9px] uppercase tracking-[0.18em] tabular-nums" style={{ color: C.muted }}>
          {count}
        </p>
      </div>

      <div
        className="mt-2 h-px w-full"
        style={{ background: `linear-gradient(90deg, ${C.copper}88, ${C.border})` }}
      />
      <p className="mt-2 max-w-xl text-[10.5px] leading-relaxed" style={{ color: C.muted }}>
        {rack.blurb}
      </p>

      <div className="mt-3">{children}</div>
    </section>
  );
}

// The shelf the editions stand on: a machined edge under the row, and the shadow it drops.
export function RackShelf() {
  return (
    <div aria-hidden className="mt-3">
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${C.copper}, ${C.navy} 40%, ${C.navy})` }} />
      <div className="h-2 w-full" style={{ background: 'linear-gradient(180deg, rgba(30,58,90,0.16), rgba(30,58,90,0))' }} />
    </div>
  );
}

// The one line a rack prints when there is nothing on it yet. Designed, never lorem.
export function RackEmpty({ rack }) {
  return (
    <div
      className="rounded-[3px] px-4 py-6 text-center"
      style={{ border: `1px dashed ${C.border}`, background: 'rgba(255,255,255,0.6)' }}
    >
      <p className="font-heading text-[15px]" style={{ color: C.navy }}>
        {rack.label} is unstocked.
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed" style={{ color: C.muted }}>
        {rack.empty}
      </p>
    </div>
  );
}