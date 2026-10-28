import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { brand } from '@/components/nominate/NominateConfig';

// The voter guide: the same ground the mechanics popover covers, walked in order for
// a voter standing on the ballot for the first time. It opens itself once per voter
// and is one press away afterwards from the prompt. It names no weight — bands are
// visible, weights are not — and no face carries its own standing.
const CONTROLS = [
  { key: 'Tap', text: 'Marks the face under your hand.' },
  { key: 'X Y A B', text: 'Each key votes for the face it sits over, in reading order.' },
  { key: '\u2190 \u2192', text: 'Walks the four faces. The copper ring shows where you stand.' },
  { key: 'Enter', text: 'Marks the face under the ring.' },
  { key: 'I', text: 'Opens the candidate\u2019s file — the record behind the face.' },
];

const STEPS = [
  {
    kicker: 'The set',
    title: 'Four faces, drawn at random.',
    body: (
      <p>
        Every set draws four candidates from the active pool. Four is all you are ever shown
        at once, so no set is weighed against a longer list and no face is placed by its own
        record.
      </p>
    ),
  },
  {
    kicker: 'The marks',
    title: 'Two marks, never a score.',
    body: (
      <>
        <p>
          First you are asked for the face you would advance first. Then for the one you would
          advance last. Nothing else is asked of you, and nothing is inferred from a pairing you
          were never shown.
        </p>
        <p className="mt-2">
          The three that remain stand behind the first mark and ahead of the last.
        </p>
      </>
    ),
  },
  {
    kicker: 'The controls',
    title: 'How to make a mark.',
    body: (
      <ul className="space-y-1.5">
        {CONTROLS.map(({ key, text }) => (
          <li key={key} className="flex items-start gap-2">
            <span
              className="mt-[1px] shrink-0 rounded-md px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
              style={{ background: `${brand.gold}22`, border: `1px solid ${brand.gold}55`, color: brand.navy }}
            >
              {key}
            </span>
            <span className="text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    kicker: 'The reading',
    title: 'The instrument does the arithmetic.',
    body: (
      <>
        <p>
          Your two marks settle five of the six pairings in a set. The measure reads every pairing
          a candidate has produced and solves for the strength that best explains them together,
          so beating a strong field moves a candidate further than beating a weak one.
        </p>
        <p className="mt-2">
          You rank. The institution measures. Bands are visible, weights are not.
        </p>
      </>
    ),
  },
];

export default function VoterGuide({ open, onOpenChange }) {
  const [step, setStep] = useState(0);

  // Every opening begins at the first page, so the guide always reads in order.
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[440px] gap-0 overflow-hidden rounded-2xl border-0 p-0 [&>button]:right-3 [&>button]:top-3 [&>button]:opacity-60"
        style={{
          background: brand.cream,
          boxShadow: `0 0 0 1px ${brand.navy}14, 0 34px 64px -24px rgba(7,17,31,0.70)`,
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' && !last) setStep((n) => n + 1);
          if (event.key === 'ArrowLeft' && step > 0) setStep((n) => n - 1);
        }}
      >
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${brand.gold}, #B87333 55%, ${brand.gold})` }}
        />

        <div className="p-5">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: `${brand.navy}55` }}>
            Voter guide · {current.kicker}
          </p>
          <DialogTitle className="mt-1 font-heading text-[19px] leading-tight" style={{ color: brand.navy }}>
            {current.title}
          </DialogTitle>
          <div className="mt-2 text-[12px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
            {current.body}
          </div>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span
                key={s.kicker}
                className="h-1 rounded-full transition-all"
                style={{
                  width: i === step ? 18 : 6,
                  background: i === step ? brand.gold : `${brand.navy}22`,
                }}
              />
            ))}
            <span className="ml-auto text-[10px] font-semibold tabular-nums" style={{ color: `${brand.navy}55` }}>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: `${brand.navy}12` }}>
            <button
              type="button"
              onClick={() => setStep((n) => Math.max(0, n - 1))}
              disabled={step === 0}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-40"
              style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-auto inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-4 text-[11px] font-bold transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110"
              style={{
                background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
                color: '#F4F0E7',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 10px -6px rgba(7,17,31,0.8)',
              }}
            >
              {last ? (
                <>
                  <Info className="h-3.5 w-3.5" /> Start weighing
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}