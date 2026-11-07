import { howItWorks } from './voteGateCopy';

// The how-to, kept apart from the letter: two ballots, three steps each. The copy lives in
// voteGateCopy so the page and the printable invitation are written from the same words.
export default function GateHowItWorks() {
  return (
    <section aria-labelledby="gate-how" className="mt-12 sm:mt-16">
      <p className="pd-label">{howItWorks.label}</p>
      <h2 id="gate-how" className="mt-2 font-heading text-2xl text-editorial-navy sm:text-3xl">{howItWorks.heading}</h2>
      <p className="mb-6 mt-3 max-w-2xl font-body text-sm leading-relaxed text-editorial-navy/85">
        {howItWorks.intro}
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        {howItWorks.ballots.map((ballot) => (
          <div key={ballot.name} className="border-t-2 border-editorial-copper pt-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading text-lg text-editorial-navy">{ballot.name}</h3>
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-label">{ballot.kind}</span>
            </div>
            <ol className="flex flex-col gap-2.5">
              {ballot.steps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 font-body text-sm leading-relaxed text-editorial-navy/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-editorial-navy/10 text-[10px] font-bold text-editorial-navy">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}