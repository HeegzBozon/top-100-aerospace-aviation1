import { ArrowDown } from 'lucide-react';
import { P, FIREWALL_LINE } from './patronConfig';

// The head of the media kit. It says what the offer is in two lines, then makes the one
// promise a buyer needs to read before anything else: patronage does not touch the record.
export default function PatronHero() {
  return (
    <section className="relative overflow-hidden" style={{ background: P.navyDeep }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(250,248,245,0.5) 0.5px, transparent 0.7px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="relative mx-auto w-full max-w-5xl px-5 pb-12 pt-10 md:px-10 md:pb-20 md:pt-16">
        <div className="h-px w-16 md:w-28" style={{ background: `linear-gradient(90deg, ${P.copper}, ${P.gold} 60%, transparent)` }} />

        <p className="mt-4 text-[8.5px] font-bold uppercase tracking-[0.34em] text-editorial-cream/55 md:text-[10px]">
          The publication &middot; Patronage
        </p>

        <h1 className="mt-3 max-w-[19ch] font-heading text-[2.4rem] leading-[0.98] tracking-[-0.01em] text-editorial-cream md:text-[4.2rem]">
          Become a Patron of Record
        </h1>

        <p className="mt-5 max-w-[46ch] text-[13px] leading-relaxed text-editorial-cream/75 md:text-[15px]">
          A governance-first publication and index, with a published 2027 calendar. Patronage puts your name
          against the work we do, in the issue, on the community feed, and in the Volume.
        </p>

        <div
          className="mt-7 border-l-2 pl-4 md:mt-9 md:pl-5"
          style={{ borderColor: P.copper }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: P.gold }}>
            The firewall
          </p>
          <p className="mt-2 max-w-[50ch] text-[12.5px] leading-relaxed text-editorial-cream/80 md:text-[14px]">
            {FIREWALL_LINE}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
          <a
            href="#enquire"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[9.5px] font-bold uppercase tracking-[0.18em]"
            style={{ background: P.copper, color: P.cream }}
          >
            Raise a hand
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
          <a
            href="#calendar"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-editorial-cream/80"
            style={{ borderColor: 'rgba(250,248,245,0.28)' }}
          >
            The calendar
          </a>
        </div>
      </div>
    </section>
  );
}