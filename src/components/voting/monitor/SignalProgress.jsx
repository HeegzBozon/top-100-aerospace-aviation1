import { brand, ink } from '@/components/nominate/NominateConfig';

// ── THE SCALE THE COUNTING COHORT IS MEASURED AGAINST ─────────────────────────
// A mini ballot sets four cards in front of a Fellow and writes seven comparisons, so a
// nominee's standing is read off how many times it has been set down in front of someone.
// The marks are held in card appearances rather than in ballots, because appearances are
// what the measurement actually spends: twelve for the floor, sixteen realistic, twenty
// at the ideal, thirty-two at the ambitious end. Each is turned into a ballot target
// against the pool that is standing, so the scale moves with the field instead of being
// a figure typed into the panel.
const APPEARANCES_PER_BALLOT = 4;
const COMPARISONS_PER_BALLOT = 7;

const MARKS = [
  { key: 'floor', label: 'Floor', appearances: 12 },
  { key: 'realistic', label: 'Realistic', appearances: 16 },
  { key: 'ideal', label: 'Ideal', appearances: 20 },
  { key: 'ambitious', label: 'Ambitious', appearances: 32 },
];

const commas = (value) => Math.round(Number(value) || 0).toLocaleString('en-US');
const tenths = (value) => (Math.round((Number(value) || 0) * 10) / 10).toFixed(1);

// A share never reads as nothing while it is merely small: a cohort four ballots in is
// not at 0% of the floor, it is under a percent of it.
function share(value, target) {
  if (!target) return '—';
  const pct = ((Number(value) || 0) / target) * 100;
  if (pct <= 0) return '0%';
  if (pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
}

const MARK_LABEL = 'text-[6.5px] font-bold uppercase tracking-[0.14em]';
const RULE = '1px solid rgb(var(--editorial-sand-rgb))';

// Signal progress: how far the cohort's analysis has got, read against the marks its own
// pool sets for it. Printed as an instrument rather than a chart — one figure in the
// largest hand on the plate, one measure under it, and the scale the figure is standing
// on printed along the foot. Nothing here is a forecast: every number is a count.
export default function SignalProgress({ data, loading, pool: poolSize = 0, scope = 'community' }) {
  // The pool is reported by the ballot itself — the field the cards are actually dealt
  // from — so the marks and the Crosscheck can never be reading different fields.
  const readingTests = scope === 'test';
  const pool = Number(poolSize) || 0;
  const ballots = Number(data?.reviews) || 0;
  const comparisons = Number(data?.comparisons) || 0;
  const weighedOnce = Number(data?.weighedOnce) || 0;
  const testComparisons = Number(data?.testComparisons) || 0;
  const rungs = data?.rungs || [];
  const waiting = loading && !data;

  // The test reading is a different instrument, not a turned-down one. A test run has no
  // marks to be held against — it moves no rating, no ladder and no report — so the panel
  // prints the three counts the house actually wants from a walkthrough and says plainly
  // that none of them is part of the count.
  if (readingTests) {
    const figures = [
      { label: 'Test runs', value: ballots },
      { label: 'Comparisons', value: comparisons },
      { label: 'Testers', value: Number(data?.voters) || 0 },
    ];
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.label }}>
            Test runs recorded
          </p>
          <span
            className="rounded-full px-1.5 py-[2px] text-[6px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: 'rgb(var(--editorial-copper-rgb))',
              color: 'rgb(var(--editorial-cream-rgb))',
            }}
          >
            {waiting ? 'Reading' : 'Not measured'}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-3">
          {figures.map((figure, index) => (
            <div
              key={figure.label}
              className={index === 0 ? 'pr-2' : index === 1 ? 'px-2' : 'pl-2'}
              style={index ? { borderLeft: RULE } : undefined}
            >
              <p className={MARK_LABEL} style={{ color: ink.soft }}>
                {figure.label}
              </p>
              <p className="mt-0.5 font-heading text-[17px] leading-none" style={{ color: brand.navy }}>
                {waiting ? '—' : commas(figure.value)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-2 text-[7.5px] leading-snug" style={{ color: ink.soft }}>
          The house&rsquo;s own walkthroughs. A test run writes its seven comparisons and moves nothing: no
          rating, no ladder, no report.
        </p>
      </div>
    );
  }

  const marks = MARKS.map((mark) => ({
    ...mark,
    ballots: pool ? Math.ceil((pool * mark.appearances) / APPEARANCES_PER_BALLOT) : 0,
  }));
  const floor = marks[0].ballots;
  const ideal = marks[2].ballots;
  const ceiling = marks[3].ballots || 1;

  // Per nominee, and the two marks each is read against.
  const perNominee = {
    comparisons: pool ? comparisons / pool : 0,
    appearances: pool ? (ballots * APPEARANCES_PER_BALLOT) / pool : 0,
  };
  const perNomineeMarks = {
    comparisons: {
      floor: (floor * COMPARISONS_PER_BALLOT) / (pool || 1),
      ideal: (ideal * COMPARISONS_PER_BALLOT) / (pool || 1),
    },
    appearances: {
      floor: (floor * APPEARANCES_PER_BALLOT) / (pool || 1),
      ideal: (ideal * APPEARANCES_PER_BALLOT) / (pool || 1),
    },
  };

  const reached = floor > 0 && ballots >= floor;
  const atIdeal = ideal > 0 && ballots >= ideal;
  const pill = atIdeal ? 'At the ideal' : reached ? 'Floor reached' : 'Below floor';
  const fill = Math.min(1, ballots / ceiling);

  const footer = pool
    ? `${commas(weighedOnce)} of ${commas(pool)} nominees weighed at least once — ${share(weighedOnce, pool)} of the pool. Four cards to the mini ballot and seven comparisons written from it; the marks are set from the pool of ${commas(pool)}, so they move with the field.` +
      (testComparisons ? ` ${commas(testComparisons)} test comparisons are held apart from these figures.` : '')
    : 'The pool standing in this cohort has not been read yet, so no marks can be set.';

  const columns = [
    {
      label: 'Comparisons per nominee',
      value: tenths(perNominee.comparisons),
      marks: perNomineeMarks.comparisons,
    },
    {
      label: 'Appearances per nominee',
      value: tenths(perNominee.appearances),
      marks: perNomineeMarks.appearances,
    },
  ];

  return (
    <div>
      {/* The head: what is being cast, the cohort it is read across, and where it stands. */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.label }}>
          Mini ballots cast
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <p className="text-[6px] font-bold uppercase tracking-[0.12em]" style={{ color: ink.soft }}>
            Every open cohort
          </p>
          <span
            className="rounded-full px-1.5 py-[2px] text-[6px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: reached ? 'rgb(var(--editorial-navy-rgb))' : 'rgb(var(--editorial-copper-rgb))',
              color: 'rgb(var(--editorial-cream-rgb))',
            }}
          >
            {waiting ? 'Reading' : pill}
          </span>
        </div>
      </div>

      {/* The figure itself, and the two shares it is standing on. */}
      <p className="mt-1 flex items-baseline gap-1 font-heading leading-none" style={{ color: brand.navy }}>
        <span className="text-[27px]">{waiting ? '—' : commas(ballots)}</span>
        <span className="text-[11px]" style={{ color: ink.soft }}>
          / {commas(floor)} floor
        </span>
      </p>
      <p className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.1em]" style={{ color: ink.label }}>
        {share(ballots, floor)} of floor · {share(ballots, ideal)} of ideal
      </p>

      {/* The measure: the whole scale to the ambitious end, the fill to where the cohort
          stands, and a tick for each mark below it. */}
      <div className="relative mt-2 h-[7px] rounded-full" style={{ background: 'rgb(var(--editorial-sand-rgb))' }}>
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fill * 100}%`,
            background:
              'linear-gradient(90deg, rgb(var(--editorial-label-rgb)) 0%, rgb(var(--editorial-copper-rgb)) 64%, rgb(var(--editorial-gold-rgb)) 100%)',
          }}
        />
        <span
          className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${Math.max(fill * 100, 1.5)}%`,
            background: 'rgb(var(--editorial-copper-rgb))',
            boxShadow: '0 0 0 2px rgb(var(--editorial-cream-rgb)), 0 1px 3px rgba(30,58,90,0.35)',
          }}
        />
      </div>

      {/* What is left between where the cohort stands and the two marks that matter. */}
      <div className="mt-1.5 flex justify-end gap-3">
        <p className="text-[7px] tabular-nums" style={{ color: ink.soft }}>
          <span style={{ color: brand.navy }}>{commas(Math.max(0, floor - ballots))}</span> to the floor
        </p>
        <p className="text-[7px] tabular-nums" style={{ color: ink.soft }}>
          <span style={{ color: brand.navy }}>{commas(Math.max(0, ideal - ballots))}</span> at the ideal
        </p>
      </div>

      {/* Two readings that say whether the volume is being spent evenly. */}
      <div className="mt-2.5 grid grid-cols-2" style={{ borderTop: RULE }}>
        {columns.map((column, index) => (
          <div
            key={column.label}
            className={index ? 'pl-2 pt-1.5' : 'pr-2 pt-1.5'}
            style={index ? { borderLeft: RULE } : undefined}
          >
            <p className={MARK_LABEL} style={{ color: ink.soft }}>
              {column.label}
            </p>
            <p className="mt-0.5 font-heading text-[17px] leading-none" style={{ color: brand.navy }}>
              {waiting ? '—' : column.value}
            </p>
            <p className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.08em]" style={{ color: ink.label }}>
              {share(perNominee[index ? 'appearances' : 'comparisons'], column.marks.floor)} floor ·{' '}
              {share(perNominee[index ? 'appearances' : 'comparisons'], column.marks.ideal)} ideal
            </p>
          </div>
        ))}
      </div>

      {/* The scale itself, printed along the foot the way an instrument prints its range. */}
      <div className="mt-2.5 grid grid-cols-4">
        {marks.map((mark) => (
          <div
            key={mark.key}
            className="px-1 pt-1"
            style={{ borderTop: mark.key === 'ambitious' ? '2px solid rgb(var(--editorial-copper-rgb))' : RULE }}
          >
            <p className="text-[6px] font-bold uppercase tracking-[0.08em]" style={{ color: ink.soft }}>
              {mark.label}
            </p>
            <p className="text-[9px] font-bold tabular-nums leading-tight" style={{ color: brand.navy }}>
              {commas(mark.ballots)}
            </p>
            <p className="text-[6px] tabular-nums" style={{ color: ink.label }}>
              {share(ballots, mark.ballots)}
            </p>
          </div>
        ))}
      </div>

      {/* How deep the cohort's own analysis runs: the ballot's milestone ladder read
          across everyone who has stood at it. */}
      <div className="mt-2.5" style={{ borderTop: RULE, paddingTop: 8 }}>
        <div className="flex items-baseline justify-between gap-2">
          <p className={MARK_LABEL} style={{ color: ink.soft }}>
            Fellows past each rung
          </p>
          <p className="text-[6.5px] tabular-nums" style={{ color: ink.soft }}>
            {commas(comparisons)} comparisons
          </p>
        </div>
        {waiting ? (
          <div className="mt-1 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 flex-1 animate-pulse rounded" style={{ background: 'rgba(30,58,90,0.05)' }} />
            ))}
          </div>
        ) : (
          <div className="mt-1 flex gap-1">
            {rungs.map((rung) => (
              <div
                key={rung.sets}
                className="flex-1 rounded px-1 py-1 text-center"
                style={{ background: rung.reached ? 'rgba(184,115,51,0.10)' : 'rgba(30,58,90,0.04)' }}
              >
                <p
                  className="text-[9px] font-bold tabular-nums leading-none"
                  style={{ color: rung.reached ? brand.navy : ink.soft }}
                >
                  {rung.reached}
                </p>
                <p className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.06em]" style={{ color: ink.soft }}>
                  {rung.sets}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The reading in words, so the figures cannot be misread as a forecast. */}
      <p className="mt-2 text-[7.5px] leading-relaxed" style={{ color: ink.soft }}>
        {footer}
      </p>
    </div>
  );
}