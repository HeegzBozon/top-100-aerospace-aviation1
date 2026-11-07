import { ArrowRight } from 'lucide-react';

// One road through the house, held as a plate. A mapped journey is walked from here; a
// suggested one is drawn in outline — its steps numbered, its surfaces named, and a tail
// that says where it would start — because a vacancy is the call to action, not a blank.
export default function JourneyCard({ journey, onRun = null }) {
  const mapped = journey.status === 'mapped';
  return (
    <article
      className={`flex flex-col p-5 ${mapped ? 'desk-plate' : 'desk-plate border-dashed border-editorial-gold/25'}`}
    >
      <p className="font-body text-[9px] font-bold uppercase tracking-[0.26em] text-editorial-gold">
        {mapped ? 'Mapped · walkable' : 'Suggested'}
      </p>
      <h3 className="mt-2 font-heading text-xl leading-tight text-editorial-cream">{journey.title}</h3>
      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-cream/45">
        {journey.actor}
      </p>
      <p className="mt-3 font-body text-xs leading-6 text-editorial-cream/70">{journey.promise}</p>

      <ol className="mt-4 space-y-1.5">
        {journey.steps.map((step, index) => (
          <li key={step} className="flex gap-2.5 font-body text-[11px] leading-5 text-editorial-cream/65">
            <span className="w-4 flex-none font-heading text-[11px] text-editorial-gold/80">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {journey.surfaces.map((surface) => (
          <span
            key={surface}
            className="rounded-sm border border-editorial-copper/35 px-1.5 py-0.5 font-body text-[9px] uppercase tracking-[0.12em] text-editorial-cream/55"
          >
            {surface}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        {mapped && onRun ? (
          <>
            <button type="button" className="desk-key desk-key-primary" onClick={onRun}>
              Run the New Analyst Journey
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
            {journey.note && (
              <p className="mt-2 font-body text-[10px] leading-5 text-editorial-cream/45">{journey.note}</p>
            )}
          </>
        ) : (
          <p className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-cream/35">
            Not yet walked
          </p>
        )}
      </div>
    </article>
  );
}