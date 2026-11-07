import { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import useModalPicker from '@/components/handheld/useModalPicker';
import {
  MANIFEST,
  CROSSCHECK,
  BALLOT_DISTINCTION,
  CROSSCHECK_LINE,
} from '@/components/voting/ballotNaming';

// The committee's briefing: two surfaces, one objective each, and the method in three lines.
// It replaces the old voter guide — which walked the
// ballot's mechanics and read as instructions — with the work itself stated first, so a
// new Fellow knows what the two surfaces are FOR before being told how to hold the keys.
// It opens once, on the first pass through either surface, and is one press away after.
//
// A surface asks for its own briefing — `section="vote"`, `section="nominate"` — and is
// given that surface's objective alone. Nobody reading the vote is handed the nominating
// ladder, and nobody filing a nomination is handed the ballot's.
const BRIEFINGS = [
  {
    key: 'nominate',
    kicker: MANIFEST,
    lede: 'Your commission',
    objective: 'Five hundred names are on your desk.',
    body:
      'Welcome, and thank you. This season you hold the desk of an aerospace media house: a field of more than five hundred professionals has been placed before you, and the Top 100 is yours to set. Nobody hands you a shortlist. You make one, and you say why.',
    steps: [
      { label: 'Survey the field', line: 'Walk the season\u2019s professionals and read the records. Nothing is decided yet.' },
      { label: 'Set your order', line: 'Add the ones you would vouch for, strongest first, each with a written reason.' },
      { label: 'File the Manifest', line: 'Submit your order for the cycle. It stays editable while the window is open.' },
    ],
    more: {
      label: 'More on the commission',
      lines: [
        'Ranked choice records an order, not a favourite. Your second and third choices carry weight too, which is how a hundred seats get set from five hundred names.',
        'Your draft keeps the order as you work. Nothing counts until you submit.',
        'The field is yours to choose on the Manifest. In the Crosscheck, four names are shuffled and dealt to you.',
      ],
    },
  },
  {
    key: 'vote',
    kicker: `${CROSSCHECK} · the weighing`,
    lede: 'Your second duty',
    objective: 'Four names at the table. One order.',
    body:
      'The Crosscheck is where the field is measured. Four professionals are shuffled and dealt to you, and you give them an order: who takes the left seat, who is next in line, who keeps the desk.',
    steps: [
      {
        label: 'First tap — Commander',
        line: 'The one you would put in command.',
      },
      {
        label: 'Second tap — Pilot',
        line: 'The one next in line.',
      },
      {
        label: 'Third tap — Flight Engineer',
        line: 'The fourth takes the seat left standing. Set finished.',
      },
    ],
    more: {
      label: 'More on the weighing',
      lines: [
        'The same method as the Manifest, four names deep. The names are shuffled for you, so no set is one you chose.',
        'Every set you finish is one complete ballot. Skip a set and nothing is recorded. Hold it and it returns exactly as it was dealt.',
      ],
    },
    // The measure itself, and the keys that hold it. Both stand here rather than in print
    // laid over the set: the surface keeps the whole of its height for the four cards, and
    // the words are one press away on every machine, glass and desk alike.
    note: CROSSCHECK_LINE,
    keys: [
      ['arrows / wheel', 'walk the four'],
      ['Enter', 'place them'],
      ['card key', 'place that card'],
      ['\u24d8 on a card', 'read their file'],
    ],
  },
];

// The method behind the manuscript: what a ranked ballot is, stated flat and in order,
// before the ladder that says the work has been done. Nothing here names a tally or a
// weight — a voter is owed the instrument's shape, never its arithmetic.
function Steps({ steps }) {
  return (
    <>
      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}45` }}>
        Your three moves
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
  // A surface's own briefing, or the whole committee's when none is named.
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
        className="max-w-[440px] gap-0 overflow-hidden rounded-2xl border-0 p-0 [&>button]:right-3 [&>button]:top-3 [&>button]:opacity-60"
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
            {single?.lede || 'Mission briefing · two duties'}
          </p>
          <DialogTitle className="mt-1 font-heading text-[21px] leading-tight" style={{ color: brand.navy }}>
            {single ? single.objective : 'One season, two duties.'}
          </DialogTitle>
          <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
            {single
              ? single.body
              : `A field to read and a field to weigh, one duty at a time. ${BALLOT_DISTINCTION} Each surface asks for one and does not borrow the other.`}
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
                  {brief.steps && <Steps steps={brief.steps} />}
                  {brief.more && (
                    <details className="mt-2">
                      <summary
                        className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-[0.16em] marker:hidden"
                        style={{ color: '#8F5C2C' }}
                      >
                        {brief.more.label} +
                      </summary>
                      <div className="mt-1.5 space-y-1.5">
                        {brief.more.lines.map((line) => (
                          <p
                            key={line}
                            className="text-[11px] leading-relaxed"
                            style={{ color: `${brand.navy}80` }}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
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
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      className="text-[9.5px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: brand.navy }}
                    >
                      {brief.kicker}
                    </h3>
                    <span
                      className="text-[8px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: `${brand.navy}45` }}
                    >
                      Objective
                    </span>
                  </div>

                  <p className="mt-1 font-heading text-[16px] leading-snug" style={{ color: brand.navy }}>
                    {brief.objective}
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