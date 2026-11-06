import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { MANIFEST, CROSSCHECK, BALLOT_DISTINCTION } from '@/components/voting/ballotNaming';

// The committee's briefing: two surfaces, one objective each, and the key results that
// say the objective has been reached. It replaces the old voter guide — which walked the
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
    objective: 'Build the field.',
    body:
      "An Analyst builds the field before measuring it. Naming puts someone forward, and the order says how strongly you stand behind them. The Manifest is your own TOP 100 in order — you choose who to back, and nothing is counted until you submit it. A short list you would vouch for is worth more than a long one you would not.",
    results: [
      'Name one person you vouch for',
      'Build your list in order',
      'Write a reason for each name',
      'Check the field you have built',
      'Submit your nominations',
    ],
  },
  {
    key: 'vote',
    kicker: CROSSCHECK,
    objective: 'Analyse the field.',
    body:
      'You serve this season as an Analyst. Voting is analysis: a mini ranked-choice ballot, four records deep. They arrive together, assigned by the house — you do not choose who you compare. Put all four in order: the one that leads, then the next, then the next, and the fourth places itself. Every set you finish is a complete ballot. A record you cannot judge closes the set; nothing is scored from a set that is not complete.',
    results: ['1 set analysed', '10 sets analysed', '20 sets analysed', '50 sets analysed', '100 sets analysed'],
  },
];

function KeyResults({ kicker, results }) {
  return (
    <>
      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}45` }}>
        Key results
      </p>
      <ul aria-label={`${kicker} key results`} className="mt-1">
        {results.map((result, i) => (
          <li
            key={result}
            className="flex items-center gap-2.5 border-b py-[5px] last:border-b-0"
            style={{ borderColor: `${brand.navy}0F` }}
          >
            <span className="w-4 shrink-0 text-[9.5px] font-bold tabular-nums" style={{ color: '#B87333' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-[11.5px] font-medium" style={{ color: `${brand.navy}CC` }}>
              {result}
            </span>
            <span
              className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ border: `1px solid ${brand.navy}33` }}
              aria-hidden
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function MissionBriefing({ open, onOpenChange, section = null }) {
  // A surface's own briefing, or the whole committee's when none is named.
  const briefs = section ? BRIEFINGS.filter((brief) => brief.key === section) : BRIEFINGS;
  const single = briefs.length === 1 ? briefs[0] : null;

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

        <div className="max-h-[76vh] overflow-y-auto p-5">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: '#8F5C2C' }}>
            Mission briefing &middot; objectives &amp; key results
          </p>
          <DialogTitle className="mt-1 font-heading text-[21px] leading-tight" style={{ color: brand.navy }}>
            {single ? single.objective : 'Two duties, one Analyst.'}
          </DialogTitle>
          <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}80` }}>
            {single
              ? single.body
              : `${BALLOT_DISTINCTION} Each surface has a single objective. The key results are the ladder that says you have reached it.`}
          </p>

          {briefs.map((brief) => (
            <section key={brief.key} className="mt-4 border-t pt-3" style={{ borderColor: `${brand.navy}14` }}>
              {single ? (
                <KeyResults kicker={brief.kicker} results={brief.results} />
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

                  <KeyResults kicker={brief.kicker} results={brief.results} />
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
            Begin <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}