import { brand, ink } from '@/components/nominate/NominateConfig';
import { measureBallot, share, CARDS_PER_SITTING, MARKS_PER_SITTING } from '@/lib/ballotMeasurement';

// ── SIGNAL PROGRESS ────────────────────────────────────────────────────────
// How far the cohort's analysis has got, read against the marks its own pool sets for it.
// Every figure comes from src/lib/ballotMeasurement.js — the same module the selection desk
// reads — so the committee and the admin portal can never hold two definitions of a sitting,
// a pool, coverage or a target. This surface only decides how the reading is printed.
const commas = (value) => Math.round(Number(value) || 0).toLocaleString('en-US');
const tenths = (value) => (Math.round((Number(value) || 0) * 10) / 10).toFixed(1);

// A share never reads as nothing while it is merely small: a cohort four ballots in is
// not at 0% of the floor, it is under a percent of it.
function pct(value) {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  if (value < 1) return '<1%';
  return `${Math.round(value)}%`;
}

const MARK_LABEL = 'text-[6.5px] font-bold uppercase tracking-[0.14em]';
const RULE = '1px solid rgb(var(--editorial-sand-rgb))';

// Signal progress: how far the cohort's analysis has got, read against the marks its own
// pool sets for it. Printed as an instrument rather than a chart — one figure in the
// largest hand on the plate, one measure under it, and the scale the figure is standing
// on printed along the foot. Nothing here is a forecast: every number is a count.
export default function SignalProgress({ data, loading, scope = 'community' }) {
  const readingTests = scope === 'test';
  const waiting = loading && !data;

  // The lane on the glass, and the pool both lanes are scaled against.
  const measurement = data?.measurement || null;
  const marks = Number(
    readingTests ? measurement?.comparisons_test : measurement?.comparisons_live
  ) || 0;
  const covered = Number(
    readingTests ? measurement?.covered_test : measurement?.covered_live
  ) || 0;
  const heldApart = Number(
    readingTests ? measurement?.comparisons_live : measurement?.comparisons_test
  ) || 0;

  const reading = measureBallot({ pool: measurement?.pool || 0, marks, covered });
  const rungs = data?.rungs || [];

  const reached = reading.floor.sittings > 0 && reading.sittings >= reading.floor.sittings;
  const atIdeal = reading.ideal.sittings > 0 && reading.sittings >= reading.ideal.sittings;
  const pill = atIdeal ? 'At the ideal' : reached ? 'Floor reached' : 'Below floor';

  const footer = !measurement
    ? 'This cohort’s pool could not be read, so no marks can be set. The reading returns with the next poll.'
    : reading.ready
      ? `${commas(reading.covered)} of ${commas(reading.pool)} nominees weighed at least once${readingTests ? ' in test runs' : ''} — ${pct(reading.coverage)} of the pool. ${CARDS_PER_SITTING} cards to the mini ballot and ${MARKS_PER_SITTING} marks written from it; the marks are set from the pool of ${commas(reading.pool)}, so they move with the field.` +
        (readingTests
          ? ' These are simulated reference marks only. Test runs change no rating, community milestone or report.'
          : heldApart
            ? ` ${commas(heldApart)} test comparisons are held apart from these figures.`
            : '')
      : 'The pool standing in this cohort has not been read yet, so no marks can be set.';

  const columns = [
    {
      label: 'Comparisons per nominee',
      value: tenths(reading.comparisonsPerNominee),
      floor: reading.floor.comparisons,
      ideal: reading.ideal.comparisons,
    },
    {
      label: 'Appearances per nominee',
      value: tenths(reading.appearancesPerNominee),
      floor: reading.floor.appearances,
      ideal: reading.ideal.appearances,
    },
  ];

  return (
    <div>
      {/* The head: what is being cast, the cohort it is read across, and where it stands. */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.label }}>
          {readingTests ? 'Test mini ballots cast' : 'Mini ballots cast'}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <p className="text-[6px] font-bold uppercase tracking-[0.12em]" style={{ color: ink.soft }}>
            {readingTests ? 'Test reference' : 'This cohort’s pool'}
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
        <span className="text-[27px]">{waiting ? '—' : commas(reading.sittings)}</span>
        <span className="text-[11px]" style={{ color: ink.soft }}>
          / {commas(reading.floor.sittings)} floor
        </span>
      </p>
      <p className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.1em]" style={{ color: ink.label }}>
        {pct(share(reading.sittings, reading.floor.sittings))} of floor ·{' '}
        {pct(share(reading.sittings, reading.ideal.sittings))} of ideal
      </p>

      {/* The measure: the whole scale to the ambitious end, the fill to where the cohort
          stands, and a tick for each mark below it. */}
      <div className="relative mt-2 h-[7px] rounded-full" style={{ background: 'rgb(var(--editorial-sand-rgb))' }}>
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${reading.fill * 100}%`,
            background:
              'linear-gradient(90deg, rgb(var(--editorial-label-rgb)) 0%, rgb(var(--editorial-copper-rgb)) 64%, rgb(var(--editorial-gold-rgb)) 100%)',
          }}
        />
        <span
          className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${Math.max(reading.fill * 100, 1.5)}%`,
            background: 'rgb(var(--editorial-copper-rgb))',
            boxShadow: '0 0 0 2px rgb(var(--editorial-cream-rgb)), 0 1px 3px rgba(30,58,90,0.35)',
          }}
        />
      </div>

      {/* What is left between where the cohort stands and the two marks that matter. */}
      <div className="mt-1.5 flex justify-end gap-3">
        <p className="text-[7px] tabular-nums" style={{ color: ink.soft }}>
          <span style={{ color: brand.navy }}>{commas(reading.toFloor)}</span> to the floor
        </p>
        <p className="text-[7px] tabular-nums" style={{ color: ink.soft }}>
          <span style={{ color: brand.navy }}>{commas(reading.toIdeal)}</span> at the ideal
        </p>
      </div>

      {readingTests && (
        <p className="mt-1.5 text-[7px] tabular-nums text-editorial-navy/75">
          {commas(data?.voters)} testers · {commas(data?.recentComparisons)} comparisons in the last 15 minutes
        </p>
      )}

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
              {pct(share(Number(column.value), column.floor))} floor ·{' '}
              {pct(share(Number(column.value), column.ideal))} ideal
            </p>
          </div>
        ))}
      </div>

      {/* The scale itself, printed along the foot the way an instrument prints its range. */}
      <div className="mt-2.5 grid grid-cols-4">
        {reading.ladder.map((mark) => (
          <div
            key={mark.key}
            className="px-1 pt-1"
            style={{ borderTop: mark.key === 'ambitious' ? '2px solid rgb(var(--editorial-copper-rgb))' : RULE }}
          >
            <p className="text-[6px] font-bold uppercase tracking-[0.08em]" style={{ color: ink.soft }}>
              {mark.label}
            </p>
            <p className="text-[9px] font-bold tabular-nums leading-tight" style={{ color: brand.navy }}>
              {commas(mark.sittings)}
            </p>
            <p className="text-[6px] tabular-nums" style={{ color: ink.label }}>
              {pct(share(reading.sittings, mark.sittings))}
            </p>
          </div>
        ))}
      </div>

      {/* How deep the cohort's own analysis runs: the ballot's milestone ladder read
          across everyone who has stood at it. */}
      <div className="mt-2.5" style={{ borderTop: RULE, paddingTop: 8 }}>
        <div className="flex items-baseline justify-between gap-2">
          <p className={MARK_LABEL} style={{ color: ink.soft }}>
            {readingTests ? 'Testers past each rung' : 'Fellows past each rung'}
          </p>
          <p className="text-[6.5px] tabular-nums" style={{ color: ink.soft }}>
            {commas(marks)} marks
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