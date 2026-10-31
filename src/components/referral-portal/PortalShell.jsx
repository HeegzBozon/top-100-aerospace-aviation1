// The mini-portal's own frame: a navy masthead with the referrer's name, a cream sheet, and
// a three-step progress rule. Nothing from the public app's chrome appears here.
const STEPS = ['Introduction', 'Your answer', 'Next steps'];

export default function PortalShell({ referrer, step = 0, children }) {
  return (
    <main className="min-h-screen bg-editorial-navy px-4 py-8 text-editorial-cream">
      <div className="mx-auto w-full max-w-md">
        <header className="ppc-rise">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-editorial-gold">TOP 100 Aerospace & Aviation</p>
          <p className="mt-1 font-heading text-lg italic text-editorial-cream/85">
            {referrer ? `A private introduction from ${referrer}` : 'A private introduction'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => (
              <div key={s}>
                <div className={`h-0.5 transition-colors duration-500 ${i <= step ? 'bg-editorial-copper' : 'bg-editorial-cream/15'}`} />
                <p className={`mt-1.5 font-body text-[9px] uppercase tracking-[0.16em] ${i === step ? 'text-editorial-gold' : 'text-editorial-cream/40'}`}>{s}</p>
              </div>
            ))}
          </div>
        </header>
        <section key={step} className="ppc-rise mt-5 rounded-lg border border-editorial-gold/30 bg-editorial-cream p-6 text-editorial-navy shadow-2xl">
          {children}
        </section>
        <p className="mt-5 text-center font-body text-[10px] text-editorial-cream/45">This page is private to you. It is not listed or searchable.</p>
      </div>
    </main>
  );
}