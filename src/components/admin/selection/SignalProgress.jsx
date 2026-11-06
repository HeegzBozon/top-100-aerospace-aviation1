import { useState } from 'react';
import { CONFIDENCE, MARGINS, BANDS, marksRequired, bandFor, share } from './signalConfig';

// The monitor's progress instrument: how much of the pool the community has actually
// weighed, how many marks the reading needs before it holds still, and which band the
// signal has reached. Coverage is counted from the live ledger alone, so a test set can
// never move this figure.
//
// Two axes, read together: people reached, and marks behind them. Both are drawn, because
// neither one alone is progress.

const num = (value) => (Number(value) || 0).toLocaleString();
const pct = (value) => `${Math.round((Number(value) || 0) * 10) / 10}%`;

export default function SignalProgress({ totals, scopeLabel, standings = [], mode = 'live' }) {
  const [confKey, setConfKey] = useState('95');
  const [marginKey, setMarginKey] = useState('5');

  const pool = Number(totals?.pool) || 0;
  const marks = Number(totals?.comparisons_live) || 0;
  const testMarks = Number(totals?.comparisons_test) || 0;

  // Who the community's marks have reached. The ledger resolves it in one pass; until that
  // reading is on the wire, the same count is taken from the board's appearance tally —
  // which is only the community's when the community's reading is the one on the glass.
  const tallied = standings.filter((row) => (row.appearances || 0) > 0).length;
  const stated = Number(totals?.evaluated);
  const evaluated = Number.isFinite(stated) ? stated : mode === 'live' ? tallied : null;

  const conf = CONFIDENCE.find((c) => c.key === confKey) || CONFIDENCE[1];
  const margin = MARGINS.find((m) => m.key === marginKey) || MARGINS[0];
  const required = marksRequired(pool, conf.z, margin.e);

  const coverage = evaluated === null ? 0 : share(evaluated, pool);
  const marksShare = share(marks, required);
  const strength = evaluated === null ? marksShare : Math.min(coverage, marksShare);
  const band = bandFor(strength);
  const remaining = Math.max(0, pool - (evaluated || 0));
  const marksToGo = Math.max(0, required - marks);

  if (!pool) {
    return (
      <div className="rounded-xl border border-editorial-navy/10 bg-card px-4 py-5 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <p className="mt-1.5 font-heading text-base text-editorial-navy">No pool is standing here yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-editorial-navy/55">
          Coverage is counted against the nominees eligible in this scope. Once a pool is
          settled, this instrument will report how much of it the field has reached.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-editorial-navy/10 bg-card px-3 py-2.5">
      {/* Head: what is being counted, and where the signal stands. */}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <span className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40">
            {scopeLabel || 'Scope'}
          </span>
          <span className="rounded-full border border-editorial-copper/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">
            {band.label}
          </span>
        </span>
      </div>

      {/* The pool figure: X of the N standing in scope. */}
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="flex items-baseline gap-1 font-heading leading-none text-editorial-navy">
          <span className="text-[30px] tabular-nums">{evaluated === null ? '—' : num(evaluated)}</span>
          <span className="text-[17px] tabular-nums text-editorial-navy/35">/ {num(pool)}</span>
        </p>
        <p className="pb-0.5 text-right text-[10px] leading-tight text-editorial-navy/55">
          {evaluated === null ? (
            'Coverage is counted on the community reading'
          ) : (
            <>
              <span className="font-semibold tabular-nums text-editorial-navy">{pct(coverage)}</span> of the
              pool evaluated
              <br />
              {remaining > 0 ? `${num(remaining)} still unreached` : 'every nominee reached'}
            </>
          )}
        </p>
      </div>

      {/* The pool's measure. */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-editorial-navy/10">
        <div
          className="h-full rounded-full bg-editorial-copper transition-[width] duration-500"
          style={{ width: `${coverage}%` }}
        />
      </div>

      {/* The second axis: marks behind the reading, against the target the two keys set. */}
      <div className="mt-2.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1.5 border-t border-editorial-navy/10 pt-2">
        <div>
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            Marks toward a reliable signal
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
            <span className="font-heading text-[15px] tabular-nums">{num(marks)}</span>
            <span className="text-[11px] tabular-nums text-editorial-navy/35">of {num(required)}</span>
            <span className="text-[9.5px] text-editorial-navy/45">
              {marksToGo > 0 ? `${num(marksToGo)} to go` : 'target met'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Keys
            label="Confidence"
            options={CONFIDENCE}
            value={confKey}
            onChange={setConfKey}
          />
          <Keys label="Margin" options={MARGINS} value={marginKey} onChange={setMarginKey} />
        </div>
      </div>

      {/* The bands, in order. A band is crossed only when both axes clear it. */}
      <div className="mt-2 flex items-end gap-1">
        {BANDS.map((step) => {
          const reached = strength >= step.at;
          return (
            <div key={step.key} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  reached ? 'bg-editorial-copper' : 'bg-editorial-navy/10'
                }`}
              />
              <p
                className={`mt-1 text-[8px] uppercase tracking-[0.1em] ${
                  step.key === band.key
                    ? 'font-semibold text-editorial-copper'
                    : reached
                      ? 'text-editorial-navy/45'
                      : 'text-editorial-navy/25'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* The assumptions, stated where the target is read. */}
      <p className="mt-1.5 text-[9px] leading-relaxed text-editorial-navy/40">
        A sample target for a pool of {num(pool)}, at {conf.label} confidence and {margin.label} margin. It
        says how many marks the reading needs to hold still; it is an estimate, not a guarantee.
        {testMarks > 0
          ? ` ${num(testMarks)} test ${testMarks === 1 ? 'mark is' : 'marks are'} held apart from this figure.`
          : ''}
      </p>
    </div>
  );
}

function Keys({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] uppercase tracking-[0.1em] text-editorial-navy/35">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-editorial-navy/15">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={option.key === value}
            className={`px-1.5 py-0.5 text-[9px] font-semibold tabular-nums transition-colors ${
              option.key === value
                ? 'bg-editorial-navy text-editorial-cream'
                : 'text-editorial-navy/55 hover:bg-editorial-navy/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}