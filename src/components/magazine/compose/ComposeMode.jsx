import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ComposeRail from './ComposeRail';
import ComposePrompt from './ComposePrompt';
import SectionPlanPrompt from './SectionPlanPrompt';
import SuggestionPlate from './SuggestionPlate';
import ComposeReview from './ComposeReview';
import useComposer from './useComposer';
import { guideLabel } from './editorialGuide';

// Compose mode.
//
// The classic studio, walked the other way: instead of a workbench with everything on
// it at once, one decision stands open at a time, and the writer keeps moving. It is a
// lap, not a gate — every prompt can be written, skipped, taken again or left for the
// classic editor, and each answer is filed to the issue the moment it is continued.
//
// The keys carry the rhythm: Enter continues, ⌘K asks the editor, ← and → walk the lap,
// Tab takes the first line offered, Esc puts the offer away (and, with none open, hands
// the issue back to the classic editor).

const KEY =
  'inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-navy/60 transition-colors hover:text-editorial-navy disabled:opacity-30';
const GO =
  'inline-flex items-center gap-2 bg-editorial-navy px-4 py-2.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-cream transition-opacity hover:opacity-85 disabled:opacity-40';

export default function ComposeMode({ issue, standard, articles = [], onSave, onExit, onPublish }) {
  const composer = useComposer({ issue, standard, onSave });
  const {
    index,
    step,
    values,
    offer,
    asking,
    askError,
    saving,
    saveError,
    savedAt,
    resumedFrom,
    isReview,
    setValue,
    setPlan,
    commit,
    back,
    jump,
    skip,
    ask,
    dismissOffer,
    takeLine,
    takePlan,
  } = composer;

  // The hands. Everything the lap can be walked with, without reaching for the pointer.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ask();
        return;
      }
      if (e.key === 'Escape') {
        if (offer) dismissOffer();
        else onExit();
        return;
      }
      if (e.key === 'Tab' && offer?.kind === 'lines' && (tag === 'INPUT' || tag === 'TEXTAREA')) {
        e.preventDefault();
        takeLine(offer.options[0].text);
        return;
      }
      if (e.key === 'Enter') {
        if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'A') return;
        if (tag === 'TEXTAREA' && !mod) return;
        e.preventDefault();
        commit();
        return;
      }
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        commit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [offer, ask, commit, back, onExit, dismissOffer, takeLine]);

  // The cursor lands in the line being asked for, so the lap is typed rather than
  // clicked. Not on a phone: raising the keys before the writer has decided to write
  // would take half the picture on every step.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.getElementById('compose-field')?.focus();
  }, [index]);

  return (
    <div className="min-h-screen bg-editorial-cream">
      <div className="mx-auto w-full max-w-[44rem] px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-label">
              Compose
            </p>
            <p className="mt-1.5 font-heading text-[15px] text-editorial-navy">
              {values.title || 'A new issue'}
            </p>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy/50 hover:text-editorial-copper"
          >
            Classic editor
            <kbd className="rounded-sm border border-editorial-navy/20 px-1 text-[9px] tracking-normal">Esc</kbd>
          </button>
        </header>

        <div className="mt-5">
          <ComposeRail values={values} index={index} onJump={jump} />
        </div>

        {/* What happened to the last answer, said plainly: every step is filed to the
            issue the moment it is continued, and the lap picks up where it was left. */}
        <p
          aria-live="polite"
          className="mt-2 flex flex-wrap items-center gap-x-3 font-body text-[10px] uppercase tracking-[0.16em] text-editorial-navy/40"
        >
          <span>{saving ? 'Filing to the issue…' : savedAt ? 'Filed. Leave at any point.' : 'Every answer is filed as you continue.'}</span>
          {resumedFrom > 0 && !savedAt && (
            <span className="text-editorial-label">Picked up at step {resumedFrom + 1}</span>
          )}
        </p>

        <p aria-live="polite" className="sr-only">
          Step {index + 1}. {step.question}
        </p>

        <main key={step.key} className="ppc-rise mt-8 sm:mt-12">
          {isReview ? (
            <ComposeReview
              values={values}
              issue={issue}
              standard={standard}
              articles={articles}
              onJump={jump}
              onOpenClassic={onExit}
              onPublish={onPublish}
              onAnotherLap={() => jump('direction')}
            />
          ) : (
            <>
              <ComposePrompt
                step={step}
                value={step.kind === 'plan' ? '' : values[step.key] || ''}
                onChange={setValue}
                onAsk={ask}
                asking={asking}
                guideLabel={guideLabel(standard)}
              />
              {step.kind === 'plan' && (
                <SectionPlanPrompt
                  sections={values.sections}
                  onChange={setPlan}
                  onAsk={ask}
                  asking={asking}
                />
              )}
              {offer && (
                <SuggestionPlate
                  offer={offer}
                  onTakeLine={takeLine}
                  onTakePlan={takePlan}
                  onDismiss={dismissOffer}
                />
              )}
              {askError && (
                <p className="mt-4 font-body text-[11px] leading-5 text-editorial-copper">{askError}</p>
              )}
            </>
          )}
        </main>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-editorial-navy/10 pt-5">
          <button type="button" onClick={back} disabled={index === 0} className={KEY}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {!isReview && (
            <>
              <button type="button" onClick={commit} disabled={saving} className={GO}>
                {saving ? 'Filing…' : 'Continue'} <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={skip} className={KEY}>
                Skip
              </button>
            </>
          )}
          <p className="ml-auto hidden font-body text-[9px] uppercase tracking-[0.16em] text-editorial-navy/30 sm:block">
            Enter continues · ⌘K asks · ← → move
          </p>
        </div>

        {saveError && (
          <p role="alert" className="mt-3 font-body text-[11px] leading-5 text-editorial-copper">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}