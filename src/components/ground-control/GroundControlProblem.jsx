const TIMELINE = [
  { time: '4:40 PM', text: 'An RFQ lands in a shared inbox. Nobody owns it. It gets answered Tuesday, and by then the buyer has three other quotes.' },
  { time: 'Saturday', text: 'A discovery flight inquiry comes through the website while the office is closed. No reply goes out until Monday afternoon.' },
  { time: 'Day 3', text: 'A quote went out and nobody followed up. It dies quietly at "we will get back to you."' },
  { time: 'Six years', text: 'Every customer you have ever served sits in a spreadsheet. None of them have heard from you since the invoice cleared.' },
];

export default function GroundControlProblem() {
  return (
    <section className="bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">The Problem</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Your next customer already called.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-white/55">
          Most aerospace businesses under fifty people do not have a lead problem. They have a follow-up problem. The work comes in. It just does not always get answered.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          {TIMELINE.map((row, i) => (
            <div key={i} className={`flex gap-4 px-5 py-4 ${i % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
              <span className="w-20 shrink-0 font-mono text-xs font-bold text-[#c9a87c]">{row.time}</span>
              <p className="text-sm leading-relaxed text-white/70">{row.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base font-medium leading-relaxed text-white">
          You already know you are leaking revenue. What you do not have is the system to stop it, or the time to build one.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          Ground Control is that system, installed and managed for you. Built for machine shops and AS9100 suppliers, MRO and avionics, flight schools, charter operators, training providers, and the consultancies that serve them.
        </p>
      </div>
    </section>
  );
}