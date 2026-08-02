const FEATURES = [
  { n: '01', title: 'Missed-Call Text-Back', text: 'A call you cannot pick up becomes a text within seconds. The conversation starts instead of ending.' },
  { n: '02', title: 'One Inbox', text: 'Calls, texts, email, web chat, and social messages land in a single thread per customer. No more hunting across four apps.' },
  { n: '03', title: 'Your Pipeline', text: 'RFQ to quote. Inquiry to enrolled. Built around your process, not a generic sales funnel borrowed from another industry.' },
  { n: '04', title: 'Follow-Up That Runs Itself', text: 'Quotes get chased. Dormant customers get reactivated. The revenue you already earned stops walking out the door.' },
  { n: '05', title: 'Booking & Calendar', text: 'Customers book directly. Confirmations and reminders go out on their own. Fewer no-shows, fewer phone calls.' },
  { n: '06', title: 'Reputation', text: 'Review requests fire automatically after a job closes and route to Google, where your next customer is already looking.' },
  { n: '07', title: 'Mobile', text: 'Run the whole thing from the shop floor or the ramp. The owner does not need to be at a desk to close work.' },
  { n: '08', title: 'Managed, Not Handed Over', text: 'We build it, we maintain it, we answer when something breaks. You are buying an outcome, not another subscription to administer.' },
];

export default function GroundControlFeatures() {
  return (
    <section id="features" className="bg-[#0a1626] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">The System</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Every inquiry captured.<br /><span className="text-[#c9a87c]">Every follow-up sent.</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55">
          One platform, configured to how your shop actually works, then run for you. Nothing to install. Nothing to figure out.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.n} className="bg-[#0a1626] p-6 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl text-[#c9a87c]/60" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{f.n}</span>
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-white">{f.title}</h3>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-white/55">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}