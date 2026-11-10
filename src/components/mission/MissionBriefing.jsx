import { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import useModalPicker from '@/components/handheld/useModalPicker';
import { CROSSCHECK_LINE } from '@/components/voting/ballotNaming';

// The committee's briefing, cut to the shape of the two ballots.
//
// It says three things and stops: what this ballot is called, what kind of ballot it is,
// and how that kind of ballot is worked. The commission essay, the objective and the
// method notes that used to stand here are gone — a Fellow holding the keys needs to know
// what they are holding, not why the house keeps it.
//
// A surface asks for its own briefing — `section="vote"`, `section="nominate"` — and is
// given that surface's ballot alone.
const BRIEFINGS = [
  {
    key: 'nominate',
    kicker: 'The first duty',
    title: 'This is the Manifest.',
    body: 'The Manifest is a ranked choice ballot.',
    stepsTitle: 'This is how a ranked choice ballot works',
    steps: [
      { label: 'Read the field', line: 'Every professional in the season, with their record.' },
      {
        label: 'Set your order',
        line: 'Name them strongest first: a first, a second, a third, and on down the line.',
      },
      {
        label: 'File it',
        line: 'Submit the order for the cycle. It stays editable while the window is open.',
      },
    ],
  },
  {
    key: 'vote',
    kicker: 'The second duty',
    title: 'This is the Crosscheck.',
    body: 'The Crosscheck is a mini ranked choice ballot.',
    stepsTitle: 'This is how the mini ranked choice ballot works',
    steps: [
      { label: 'Four at random', line: 'You are shown four candidates at random.' },
      { label: 'Your first', line: 'You pick your first favorite.' },
      { label: 'Your second', line: 'Then your second.' },
      { label: 'Your third', line: 'Then your third. Move on to the next evaluation.' },
    ],
    note: CROSSCHECK_LINE,
    keys: [
      ['arrows / wheel', 'walk the four'],
      ['Enter', 'place them'],
      ['card key', 'place that card'],
      ['\u24d8 on a card', 'read their file'],
    ],
  },
];

// How that kind of ballot is worked, stated flat and in order. Nothing here names a tally
// or a weight — a voter is owed the instrument's shape, never its arithmetic.
function Steps({ title, steps }) {
  return (
    <>
      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}45` }}>
        {title}
      </p>
      <ul className="mt-1">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className="flex gap-2.5 border-b py-[6px] last:border-b-0"
            style={{ borderColor: `${brand.navy}0F` }}
          >
            <span className="w-4 shrink-0 text-[9.5px] font-bold tabular-nums" style={{ color: '#B87333' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold" style={{ color: brand.navy }}>
                {step.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
                {step.line}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function MissionBriefing({ open, onOpenChange, section = null, hasStarted = false }) {
  // A surface's own briefing, or both of the committee's when none is named.
  const briefs = section ? BRIEFINGS.filter((brief) => brief.key === section) : BRIEFINGS;
  const single = briefs.length === 1 ? briefs[0] : null;
  // The press that closes the briefing names the work waiting behind it: a Fellow who has
  // already weighed a set is not beginning, they are taking the next one.
  const press = single?.key === 'vote' ? (hasStarted ? 'Next set' : 'First set') : 'Begin';

  // The briefing stands over the surface it was opened from, so the console's keys are
  // its while it is up: a turn reads it down, and the confirm key or the way back closes
  // it — never a mark on the ballot standing behind the glass.
  const bodyRef = useRef(null);
  useModalPicker({ open, onClose: () => onOpenChange(false), bodyRef });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[420px] gap-0 overflow-hidden rounded-2xl border-0 p-0 [&>button]:right-3 [&>button]:top-3 [&>button]:opacity-60"
        style={{
          background: brand.cream,
          boxShadow: `0 0 0 1px ${brand.navy}14, 0 34px 64px -24px rgba(7,17,31,0.70)`,
        }}
      >
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${brand.gold}, #B87333 55%, ${brand.gold})` }}
        />

        <div ref={bodyRef} className="max-h-[76vh] overflow-y-auto p-5">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: '#8F5C2C' }}>
            {single?.kicker || 'The two duties'}
          </p>
          <DialogTitle className="mt-1 font-heading text-[21px] leading-tight" style={{ color: brand.navy }}>
            {single ? single.title : 'One season, two duties.'}
          </DialogTitle>
          <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
            {single ? single.body : 'A field to set and a field to measure, one ballot each.'}
          </p>

          {single?.note && (
            <p
              className="mt-2 border-t pt-2 text-[10.5px] leading-relaxed"
              style={{ borderColor: `${brand.navy}12`, color: `${brand.navy}78` }}
            >
              {single.note}
            </p>
          )}

          {briefs.map((brief) => (
            <section key={brief.key} className="mt-4 border-t pt-3" style={{ borderColor: `${brand.navy}14` }}>
              {single ? (
                <>
                  {brief.steps && <Steps title={brief.stepsTitle} steps={brief.steps} />}
                  {brief.keys && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {brief.keys.map(([key, what]) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9.5px]"
                          style={{ border: `1px solid ${brand.navy}18`, color: `${brand.navy}99` }}
                        >
                          <span className="font-bold" style={{ color: brand.navy }}>{key}</span>
                          {what}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p
                    className="text-[9.5px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: brand.navy }}
                  >
                    {brief.kicker}
                  </p>
                  <p className="mt-1 font-heading text-[16px] leading-snug" style={{ color: brand.navy }}>
                    {brief.title}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
                    {brief.body}
                  </p>
                </>
              )}
            </section>
          ))}
        </div>

        <div className="border-t px-5 py-3" style={{ borderColor: `${brand.navy}12` }}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-full px-4 text-[11px] font-bold transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110"
            style={{
              background: `linear-gradient(180deg, #26486E, ${brand.navy})`,
              color: '#F4F0E7',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 4px 10px -6px rgba(7,17,31,0.8)',
            }}
          >
            {press} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}