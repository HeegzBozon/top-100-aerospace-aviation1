import { Sparkles } from 'lucide-react';
import { DIRECTIONS } from './composeConfig';

// One prompt, laid open.
//
// The question is the page: set large in the house face, with the answer written
// straight under it on a ruled line rather than into a box. Nothing is labelled twice,
// and the only key beside the prompt is the one that asks the editor for a line.

const RULE =
  'mt-6 w-full border-0 bg-transparent px-0 pb-3 font-heading text-editorial-navy outline-none placeholder:text-editorial-navy/25 focus:ring-0';

export default function ComposePrompt({ step, value, onChange, onAsk, asking, guideLabel }) {
  return (
    <div>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-copper">
        {step.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-[27px] leading-[1.12] text-editorial-navy sm:text-[40px]">
        {step.question}
      </h2>
      <p className="mt-3 max-w-md font-body text-[13px] leading-5 text-editorial-navy/60">{step.help}</p>

      {step.kind === 'plan' ? null : step.kind === 'choice' ? (
        <div className="mt-7">
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((direction) => {
              const on = value === direction.line;
              return (
                <button
                  key={direction.key}
                  type="button"
                  onClick={() => onChange(direction.line)}
                  className={`rounded-full border px-3.5 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    on
                      ? 'border-editorial-copper bg-editorial-navy text-editorial-cream'
                      : 'border-editorial-navy/20 text-editorial-navy hover:border-editorial-copper'
                  }`}
                >
                  {direction.label}
                </button>
              );
            })}
          </div>
          <input
            id="compose-field"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={step.placeholder}
            aria-label={step.question}
            className={`${RULE} border-b border-editorial-navy/25 text-[19px] sm:text-[23px]`}
          />
        </div>
      ) : step.kind === 'paragraph' ? (
        <textarea
          id="compose-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder}
          rows={9}
          aria-label={step.question}
          className={`${RULE} min-h-[13rem] resize-none border-b border-editorial-navy/25 font-body text-[15px] leading-7 sm:text-[16px]`}
        />
      ) : (
        <input
          id="compose-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder}
          aria-label={step.question}
          className={`${RULE} border-b border-editorial-navy/25 text-[22px] sm:text-[30px]`}
        />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* The plan asks for itself, in its own panel: one key there, not two. */}
        {step.kind !== 'plan' && (
          <button
            type="button"
            onClick={onAsk}
            disabled={asking}
            className="inline-flex items-center gap-1.5 border-b border-editorial-copper/50 pb-0.5 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-editorial-copper transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {asking ? 'The editor is reading…' : 'Ask the editor'}
            <kbd className="ml-1 rounded-sm border border-editorial-copper/30 px-1 font-body text-[9px] tracking-normal">
              ⌘K
            </kbd>
          </button>
        )}
        <span className="font-body text-[10px] uppercase tracking-[0.16em] text-editorial-navy/35">
          {guideLabel}
        </span>
      </div>
    </div>
  );
}