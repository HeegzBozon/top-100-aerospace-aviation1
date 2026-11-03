import { Check } from 'lucide-react';
import { BUNDLE, P } from './patronConfig';

// What a slot actually buys. Named in full, because the bundle — not the placement — is what
// the rate is defended on.
export default function PatronBundle() {
  return (
    <section className="border-t" style={{ borderColor: P.hair }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.32em] md:text-[9.5px]" style={{ color: P.copper }}>
              What a slot includes
            </p>
            <h2 className="mt-3 font-heading text-2xl leading-tight md:text-[2.1rem]" style={{ color: P.navy }}>
              The bundle
            </h2>
          </div>
          <p className="max-w-[34ch] text-[11px] leading-relaxed" style={{ color: P.muted }}>
            One sponsor per issue. Category exclusive within that issue only.
          </p>
        </div>

        <ul className="mt-7 grid gap-3 md:mt-9 md:grid-cols-2 md:gap-4">
          {BUNDLE.map((item) => (
            <li
              key={item.key}
              className="flex gap-3 border p-4 md:p-5"
              style={{ borderColor: P.hair, background: 'white' }}
            >
              <Check className="mt-0.5 h-4 w-4 flex-none" style={{ color: P.copper }} />
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.14em]" style={{ color: P.navy }}>
                  {item.label}
                </p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: P.ink }}>
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 border-l-2 pl-4 text-[11px] leading-relaxed" style={{ borderColor: P.gold, color: P.muted }}>
          We can decline any placement. No sponsor reviews editorial before it sends, and no sponsor influences
          a topic or who is featured. There is no guaranteed reach: a make-good is offered only for a missed
          send date or our own error.
        </p>
      </div>
    </section>
  );
}