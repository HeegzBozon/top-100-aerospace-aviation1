import { CROSSCHECK, MANIFEST } from '@/components/voting/ballotNaming';

// The how-to, kept apart from the letter: two ballots, three steps each.
const BALLOTS = [
  {
    name: MANIFEST,
    kind: 'Ranked choice',
    steps: ['Choose the professionals you back.', 'Put them in order, strongest first.', 'Save it. It stays editable while the window is open.'],
  },
  {
    name: CROSSCHECK,
    kind: 'Mini ranked choice',
    steps: ['Four professionals are shuffled for you.', 'Tap your Commander, then Pilot, then Engineer.', 'The fourth takes the last seat. The set is recorded.'],
  },
];

export default function GateHowItWorks() {
  return (
    <section aria-labelledby="gate-how" className="mt-12 sm:mt-16">
      <p className="pd-label">How it works</p>
      <h2 id="gate-how" className="mt-2 font-heading text-2xl text-editorial-navy sm:text-3xl">A Community Nominated Ranked Choice Ballot</h2>
      <p className="mb-6 mt-3 max-w-2xl font-body text-sm leading-relaxed text-editorial-navy/85">
        Analysts set the field. The community nominates, and the community analyzes: it puts the names
        forward, and it selects among them by ranked choice. There is no hidden formula deciding who stands.
        The community is the algorithm. It is cast two ways.
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        {BALLOTS.map((ballot) => (
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