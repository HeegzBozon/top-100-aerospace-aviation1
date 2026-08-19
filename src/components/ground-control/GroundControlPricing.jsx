const TIERS = [
  { name: 'Starter', price: '$97', best: 'Run it yourself — the Loom starter kit', rows: ['Missed-call text-back', 'One pipeline', '500 texts / 5,000 emails', 'Dashboard access', 'Community support'] },
  { name: 'Preflight', price: '$497', best: 'Owner-operators who need the leaks closed', rows: ['One pipeline', 'Two core automations', '500 texts / 5,000 emails', 'Dashboard access', 'Email support, 48 hrs'] },
  { name: 'Takeoff', price: '$997', best: 'Growing shops with a real pipeline to manage', rows: ['Up to three pipelines', 'Six automations incl. quote follow-up', 'One lead-capture funnel', '2,000 texts / 25,000 emails', 'Priority support, 24 hrs'], featured: true },
  { name: 'Cruise', price: '$1,997', best: 'Teams who want the campaigns run for them', rows: ['Up to three pipelines', 'Six automations + campaign automation', 'Campaigns written & run for you', '5,000 texts / 100,000 emails', 'Same-day support'] },
];

export default function GroundControlPricing() {
  return (
    <section className="bg-[#07111f] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Pricing</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Four levels of support.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name} className={`flex flex-col rounded-2xl border p-6 ${t.featured ? 'border-[#c9a87c]/50 bg-[#c9a87c]/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
              {t.featured && <span className="mb-3 inline-block w-fit rounded-full bg-[#c9a87c] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#07111f]">Most Popular</span>}
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c]">{t.name}</h3>
              <p className="mt-2 font-serif text-4xl text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{t.price}<span className="text-sm font-sans text-white/40">/mo</span></p>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{t.best}</p>
              <ul className="mt-5 space-y-2.5">
                {t.rows.map((r) => (
                  <li key={r} className="flex gap-2 text-[12px] leading-snug text-white/70">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c9a87c]" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[11px] leading-relaxed text-white/55">
            <span className="font-bold uppercase tracking-widest text-[#c9a87c]">Onboarding</span> — $1,500 for Preflight and Takeoff, $2,500 for Cruise. Waived on annual prepay. Eight to twelve hours of build and training. <span className="font-bold uppercase tracking-widest text-[#c9a87c]">Terms</span> — 90-day initial term, then month to month. Your data is yours and leaves with you.
          </p>
        </div>
      </div>
    </section>
  );
}