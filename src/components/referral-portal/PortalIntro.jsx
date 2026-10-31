// Step one: who, to whom, why — and what the institution is, in one line.
export default function PortalIntro({ view, onContinue }) {
  return (
    <>
      <p className="pd-label">For {view.you || 'you'}</p>
      <h1 className="mt-3 font-heading text-[1.65rem] leading-tight">
        {view.referrer_name} would like to introduce you to {view.other}.
      </h1>
      <p className="mt-3 font-body text-sm leading-relaxed">The conversation is about {view.why}.</p>
      {view.context && (
        <blockquote className="mt-4 border-l-2 border-editorial-gold pl-3 font-heading text-base italic leading-snug">
          “{view.context}”
          <span className="mt-1 block font-body text-[11px] not-italic text-editorial-navy/60">— {view.referrer_name}</span>
        </blockquote>
      )}
      <div className="mt-5 rounded border border-editorial-copper/30 bg-editorial-sand/50 p-3 font-body text-xs leading-relaxed">
        Nothing happens until you say so. Your contact details are never passed on without your choice.
      </div>
      <button onClick={onContinue} className="mt-6 w-full rounded bg-editorial-copper py-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-editorial-cream transition hover:brightness-110">
        Continue
      </button>
    </>
  );
}