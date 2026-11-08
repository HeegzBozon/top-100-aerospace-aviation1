import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { QUESTIONS } from './sponsorScript';
import SponsorVerdict from './SponsorVerdict';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.22em]';

// The interview. Each answer is said out loud in the transcript, one question stands open
// at a time, and the whole exchange is carried forward to the desk — so a sponsor answers
// four questions once, and the person who replies already knows the deal.
export default function SponsorDialogue({ copy, onIntent, onPay, onGo }) {
  const [answers, setAnswers] = useState({});

  const answered = QUESTIONS.filter((question) => answers[question.key]);
  const open = QUESTIONS.find((question) => !answers[question.key]);
  const transcript = answered.map((question) => ({
    key: question.key,
    ask: question.ask,
    answer: answers[question.key].label,
    value: answers[question.key].value,
  }));

  const answer = (question, option) => setAnswers((prev) => ({ ...prev, [question.key]: option }));

  const reopenFrom = (key) => {
    const at = QUESTIONS.findIndex((question) => question.key === key);
    const next = { ...answers };
    QUESTIONS.slice(at).forEach((question) => delete next[question.key]);
    setAnswers(next);
  };

  return (
    <div className="bg-editorial-cream px-5 py-6 md:px-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="pd-label">Discovery · four questions</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-navy/35">
          {answered.length} of {QUESTIONS.length}
        </p>
      </div>

      <div className="mt-3 space-y-3">
        <div className="max-w-[54ch] border-l-2 border-editorial-copper pl-3">
          <p className="text-[12px] leading-relaxed text-editorial-navy/80">
            {copy.deskLine ||
              'Four questions, and one of them is about money. Answer straight and I will tell you which rung of the card fits — or that none of them does.'}
          </p>
        </div>

        {transcript.map((entry) => (
          <div key={entry.key} className="space-y-2">
            <p className="max-w-[54ch] border-l-2 border-editorial-copper pl-3 text-[12px] leading-relaxed text-editorial-navy/80">
              {entry.ask}
            </p>
            <div className="flex items-start justify-between gap-3 bg-editorial-navy px-3 py-2">
              <p className="text-[11.5px] leading-relaxed text-editorial-cream">{entry.answer}</p>
              <button
                type="button"
                onClick={() => reopenFrom(entry.key)}
                aria-label={`Change the answer to: ${entry.ask}`}
                className="mt-[1px] inline-flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.16em] text-editorial-cream/45 hover:text-editorial-cream"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Change
              </button>
            </div>
          </div>
        ))}

        {open && (
          <div>
            <p className="max-w-[54ch] border-l-2 border-editorial-copper pl-3 text-[12px] leading-relaxed text-editorial-navy/80">
              {open.ask}
            </p>
            {open.why && <p className="mt-1 pl-3 text-[10px] leading-relaxed text-editorial-navy/40">{open.why}</p>}
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {open.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => answer(open, option)}
                  className="group flex items-center justify-between gap-2 border border-editorial-navy/15 px-3 py-2 text-left text-[11.5px] leading-snug text-editorial-navy transition-colors hover:border-editorial-copper focus-visible:border-editorial-copper focus-visible:outline-none"
                >
                  {option.label}
                  <ArrowRight className="h-3 w-3 shrink-0 text-editorial-copper opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {answered.length > 0 && open && (
          <p className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/35">
            <Check className="h-3 w-3 text-editorial-copper" /> {answered.length} answered · carried to the desk with
            your name
          </p>
        )}
      </div>

      {!open && (
        <SponsorVerdict
          answers={answers}
          transcript={transcript}
          copy={copy}
          onIntent={onIntent}
          onPay={onPay}
          onGo={onGo}
        />
      )}

      <p className={`${LABEL} mt-5 text-editorial-navy/35`}>
        No position, no Fellow and no vote is ever part of the price
      </p>
    </div>
  );
}