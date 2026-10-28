import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { brand } from '@/components/nominate/NominateConfig';

// The guide to the ranked ballot, walked in order for a voter arranging one for the first
// time. It states the mechanics only: an order is a preference, one name is the floor,
// suggestions are never placements. No weight is named — bands are visible, weights are not.
const STEPS = [
  {
    kicker: 'The order',
    title: 'A ballot is a sequence of preferences.',
    body: (
      <p>
        Position one is the person you would advance first. Position two is your next
        preference if the first is already spoken for, and so on down the list. The order
        carries the meaning; there is no score to enter anywhere.
      </p>
    ),
  },
  {
    kicker: 'The floor',
    title: 'One name is where it begins to count.',
    body: (
      <p>
        The surface asks for one name before it treats a ballot as a ballot. From there you
        may rank as many as a hundred — the length of the list is yours to decide.
      </p>
    ),
  },
  {
    kicker: 'The arranging',
    title: 'Drag a row, or promote it.',
    body: (
      <p>
        Moving a row moves everything under it. Every change saves to your ballot as you make
        it, so a half-arranged list is never lost, and returning to it resumes where you left
        the order standing.
      </p>
    ),
  },
  {
    kicker: 'The suggestions',
    title: 'A recommendation is not a placement.',
    body: (
      <p>
        Profiles are suggested from the sets you have already judged — the fields and places
        you keep advancing. Nothing joins your ballot unless you add it, and a suggestion is
        never ranked for you.
      </p>
    ),
  },
  {
    kicker: 'The reading',
    title: 'You rank. The institution measures.',
    body: (
      <p>
        Your order stays yours. The weighing itself happens one set of four at a time on the
        ballot, where the measure reads every pairing a candidate has produced. Bands are
        visible; weights are not.
      </p>
    ),
  },
];

export default function RankedChoiceGuide({ open, onOpenChange }) {
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
            How a ranked ballot works · {current.kicker}
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
              onClick={() => (last ? onOpenChange(false) : setStep((n) => n + 1))}
              className="ml-auto inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-4 text-[11px] font-bold transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110"
              style={{
                background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
                color: '#F4F0E7',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 10px -6px rgba(7,17,31,0.8)',
              }}
            >
              {last ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Arrange my ballot
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