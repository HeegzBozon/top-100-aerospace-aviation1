import { AUDIENCE_FIGURES, NOT_CLAIMED, P } from './patronConfig';

// Four numbers, each with the month it was pulled, and each standing on its own. They are
// never added together: the people who read by email are part of the newsletter list, not a
// second list. What we do not claim is printed beside them rather than left to be inferred.
export default function PatronAudienceLedger() {
  return (
    <section className="border-t" style={{ borderColor: P.hair }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-10 md:py-14">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.32em] md:text-[9.5px]" style={{ color: P.copper }}>
          The audience
        </p>
        <h2 className="mt-3 max-w-[26ch] font-heading text-2xl leading-tight md:text-[2.1rem]" style={{ color: P.navy }}>
          Who the work reaches, as measured
        </h2>

        <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden md:mt-9 md:grid-cols-4" style={{ background: P.hair }}>
          {AUDIENCE_FIGURES.map((figure) => (
            <div key={figure.key} className="bg-white px-4 py-5 md:px-5 md:py-6" style={{ background: P.cream }}>
              <dd className="font-heading text-[1.55rem] leading-none md:text-[2rem]" style={{ color: P.navy }}>
                {figure.value}
              </dd>
              <dt className="mt-2 text-[10.5px] leading-snug md:text-[11.5px]" style={{ color: P.ink }}>
                {figure.label}
              </dt>
              <p className="mt-2 text-[8px] uppercase tracking-[0.16em] md:text-[8.5px]" style={{ color: P.faint }}>
                {figure.date} &middot; {figure.source}
              </p>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: P.copper }}>
              What we do not claim
            </p>
            <ul className="mt-3 space-y-2">
              {NOT_CLAIMED.map((line) => (
                <li key={line} className="flex gap-2.5 text-[11.5px] leading-relaxed" style={{ color: P.ink }}>
                  <span className="mt-[7px] h-px w-3 flex-none" style={{ background: P.copper }} />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
            These are the same figures the reports are written against, so a Patron can compare what was
            promised here with what was delivered afterwards. If a number moves, this page is dated again
            rather than quietly corrected.
          </p>
        </div>
      </div>
    </section>
  );
}