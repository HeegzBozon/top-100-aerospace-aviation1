import { C } from '@/components/crm/crmConfig';

// The front of the shop: the masthead over the awning, and the day's tally printed under
// it. The awning is the only borrowed thing on the surface — navy canvas with a scalloped
// hem — and it is drawn, not photographed, so it holds at any width.
export default function NewsstandHeader({ tally }) {
  return (
    <header>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: C.copper }}>
          The Newsstand
        </p>
        <p className="text-[7.5px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
          Publications desk &middot; Est. 2021
        </p>
      </div>

      <h1 className="mt-2 font-heading text-[2.15rem] leading-[0.94] tracking-[-0.01em] md:text-[3.6rem]" style={{ color: C.navy }}>
        Everything we print,
        <br />
        under one awning.
      </h1>

      <p className="mt-3 max-w-xl text-[12px] leading-relaxed md:text-[13px]" style={{ color: C.muted }}>
        The editions on the rack, the articles that ran inside them, the dispatches Fellows
        file from the field, and every release note the house puts out about the platform
        itself. Take one down and it reads where it lives.
      </p>

      <div aria-hidden className="mt-4">
        <div
          className="h-3 w-full rounded-t-[2px]"
          style={{ background: `repeating-linear-gradient(90deg, ${C.navy} 0 14px, ${C.navyDeep} 14px 28px)` }}
        />
        <div
          className="h-[8px] w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 7px -1px, ${C.navy} 7px, transparent 7.5px)`,
            backgroundSize: '14px 8px',
            backgroundRepeat: 'repeat-x',
          }}
        />
      </div>

      {tally ? (
        <p className="mt-3 text-[9px] uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          {tally}
        </p>
      ) : null}
    </header>
  );
}