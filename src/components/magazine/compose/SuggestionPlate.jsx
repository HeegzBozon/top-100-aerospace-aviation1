import { X } from 'lucide-react';

// What the editor offered, held apart from the page until it is taken.
//
// The lines are set the way they would print, so a writer judges the sentence and not
// a proposal. Taking one writes it into the prompt; dismissing it leaves the issue
// exactly as it was.

export default function SuggestionPlate({ offer, onTakeLine, onTakePlan, onDismiss }) {
  return (
    <div className="mt-7 border-l-2 border-editorial-copper bg-editorial-sand/45 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-label">
          {offer.kind === 'plan' ? 'A plan for the issue' : 'The editor offers'}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-1 font-body text-[9px] uppercase tracking-[0.16em] text-editorial-navy/45 hover:text-editorial-navy"
        >
          <X className="h-3 w-3" /> Esc
        </button>
      </div>

      {offer.kind === 'plan' ? (
        <div className="mt-3">
          {offer.note && (
            <p className="mb-3 font-body text-[12px] leading-5 text-editorial-navy/60">{offer.note}</p>
          )}
          <ol className="space-y-1.5">
            {offer.sections.map((section, i) => (
              <li key={section.id} className="flex items-baseline gap-3">
                <span className="font-heading text-[11px] text-editorial-copper">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-heading text-[15px] text-editorial-navy">{section.name}</span>
                <span className="font-body text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40">
                  {section.section_group.replace(/_/g, ' ')}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => onTakePlan(offer.sections)}
            className="mt-4 border-b border-editorial-copper pb-0.5 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-editorial-copper hover:opacity-70"
          >
            Take this plan
          </button>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-editorial-navy/10">
          {offer.options.map((option, i) => (
            <li key={`${option.text}-${i}`}>
              <button
                type="button"
                onClick={() => onTakeLine(option.text)}
                className="group block w-full py-3 text-left"
              >
                <span className="block font-heading text-[17px] leading-6 text-editorial-navy group-hover:text-editorial-copper sm:text-[19px]">
                  {option.text}
                </span>
                {option.why && (
                  <span className="mt-1 block font-body text-[11px] leading-4 text-editorial-label">
                    {option.why}
                    {i === 0 && <span className="ml-2 text-editorial-navy/35">Tab to take the first</span>}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}