import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft } from 'lucide-react';
import { day } from '@/components/patronage/patronConfig';
import { PATRONAGE_LABEL } from './loungeConfig';
import {
  CARRIES,
  GOALS,
  HONEST_FIGURES,
  NEVER_BUYS,
  NOT_CLAIMED_LINES,
  NOT_SURE,
  rateNoteOf,
  rateOf,
  rungLine,
  slotFor,
} from './sponsorAgentConfig';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.22em]';

const asIntent = (goal) => ({
  interest: goal.interest,
  label: goal.label,
  headline: goal.headline,
  blurb: goal.blurb,
  next: goal.next,
});

// The Sponsor Lounge at work: one question, one answer, one rung of the ladder — with the
// price on it, the bundle under it, and the four duties that say what it never buys. The
// reader is never asked for a budget before they are told what the thing costs.
export default function SponsorAgent({ copy, onIntent, onGo }) {
  const [goalKey, setGoalKey] = useState(null);
  const goal = GOALS.find((entry) => entry.key === goalKey) || null;
  const slot = goal ? slotFor(goal.tier) : null;

  if (!goal) {
    return (
      <div className="bg-editorial-cream px-5 py-6 md:px-8">
        <p className="pd-label">Start here</p>
        <h4 className="mt-2 max-w-[34ch] font-heading text-[1.35rem] leading-snug text-editorial-navy">
          What are you trying to do this cycle?
        </h4>
        <p className="mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-editorial-navy/65">
          Three answers, three rungs. Pick the one that sounds like your year and the desk will
          put the rate, the bundle and the dates in front of you.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {GOALS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setGoalKey(entry.key)}
              className="group flex flex-col justify-between border border-editorial-navy/15 bg-editorial-cream px-3.5 py-3 text-left transition-colors hover:border-editorial-copper focus-visible:border-editorial-copper focus-visible:outline-none"
            >
              <span className="font-heading text-[15px] leading-snug text-editorial-navy">{entry.card}</span>
              <span className="mt-2 text-[10.5px] leading-relaxed text-editorial-navy/55">{entry.aside}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em] text-editorial-copper">
                Show me <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-editorial-copper/30 pt-3">
          <button
            type="button"
            onClick={() => onIntent(asIntent(NOT_SURE))}
            className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-copper hover:underline"
          >
            {NOT_SURE.label}
          </button>
          <button
            type="button"
            onClick={() => onGo(copy.patronage_url || '/mediakit')}
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-navy/55 hover:text-editorial-navy"
          >
            {PATRONAGE_LABEL} <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <p className="mt-4 max-w-[60ch] text-[10px] leading-relaxed text-editorial-navy/45">
          Every rung is attribution: your name, printed and labelled. None of them is a position,
          a Fellow, or a line in the measurement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-editorial-cream px-5 py-6 md:px-8">
      <button
        type="button"
        onClick={() => setGoalKey(null)}
        className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-copper hover:underline"
      >
        <ChevronLeft className="h-3 w-3" /> Change that answer
      </button>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div>
          <p className="pd-label">{goal.card}</p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-editorial-navy/55">{goal.fit}</p>
          <p className="mt-2.5 text-[12px] leading-relaxed text-editorial-navy/80">{goal.pitch}</p>

          <div className="mt-4 border-t border-editorial-copper/40 pt-3">
            <p className="pd-label">What this buys</p>
            <ul className="mt-2 space-y-1.5">
              {CARRIES.map((item) => (
                <li key={item.key} className="flex gap-2">
                  <Check className="mt-[3px] h-3 w-3 shrink-0 text-editorial-copper" />
                  <span className="text-[11.5px] leading-relaxed text-editorial-navy/75">
                    <span className="font-semibold text-editorial-navy">{item.label}.</span> {item.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border border-editorial-copper/50 bg-editorial-cream">
          <div className="border-b border-editorial-copper/35 px-3.5 py-3">
            <p className={LABEL}>{rungLine(slot) || 'On the card'}</p>
            <p className="mt-1 font-heading text-2xl leading-none text-editorial-navy">{rateOf(slot)}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-editorial-navy/55">{rateNoteOf(slot)}</p>
            {slot?.ad_close_date && (
              <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40">
                Ad close {day(slot.ad_close_date)}
              </p>
            )}
          </div>

          <div className="px-3.5 py-3">
            <p className={LABEL}>Who reads it</p>
            <ul className="mt-2 space-y-1.5">
              {HONEST_FIGURES.map((figure) => (
                <li key={figure.key} className="flex items-baseline justify-between gap-2">
                  <span className="text-[10.5px] leading-snug text-editorial-navy/60">{figure.label}</span>
                  <span className="shrink-0 font-heading text-[13px] text-editorial-navy">{figure.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[9px] leading-relaxed text-editorial-navy/40">
              Pulled {HONEST_FIGURES[0].date}, from {HONEST_FIGURES[0].source}. Each figure stands on
              its own and is never added to another.
            </p>
          </div>

          <div className="border-t border-editorial-copper/35 px-3.5 py-3">
            <p className={LABEL}>What it never buys</p>
            <ul className="mt-2 space-y-1">
              {NEVER_BUYS.map((duty) => (
                <li key={duty} className="text-[10.5px] leading-relaxed text-editorial-navy/55">
                  {duty}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[9px] leading-relaxed text-editorial-navy/40">
              And never claimed: {NOT_CLAIMED_LINES[1]} {NOT_CLAIMED_LINES[3]}
            </p>
          </div>

          <div className="border-t border-editorial-copper/35 px-3.5 py-3">
            <button type="button" onClick={() => onIntent(asIntent(goal))} className="desk-key desk-key-primary w-full justify-center">
              {goal.label} <ArrowRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onGo(copy.patronage_url || '/mediakit')}
              className="mt-2 inline-flex w-full items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em] text-editorial-navy/50 hover:text-editorial-navy"
            >
              {PATRONAGE_LABEL} <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[62ch] text-[10px] leading-relaxed text-editorial-navy/45">
        Nothing is reserved by asking, and nothing is quoted off the card. A hand raised here is
        answered by a named person within one business day.
      </p>
    </div>
  );
}