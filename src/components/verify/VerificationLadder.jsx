import { Check } from 'lucide-react';
import { RUNGS, rungOf, reached } from './verificationLadder';

// The credential, read top to bottom. Every rung says what earns it, so the ladder
// is an explanation of the record rather than a scoreboard — and the rung the record
// stands on is the only one marked as current.
export default function VerificationLadder({ nominee }) {
  const current = rungOf(nominee);

  return (
    <ol className="mt-5">
      {RUNGS.map((entry, index) => {
        const done = reached(current, entry.key);
        const here = entry.key === current;
        return (
          <li
            key={entry.key}
            className="flex gap-3.5 border-b border-editorial-navy/10 py-3.5 last:border-0"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                done
                  ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                  : 'border-editorial-navy/30 text-editorial-navy/40'
              } ${here ? 'ring-2 ring-editorial-copper/30 ring-offset-1' : ''}`}
            >
              {done ? <Check className="h-[11px] w-[11px]" strokeWidth={3.5} /> : index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`font-body text-[13px] ${
                  here ? 'font-semibold text-editorial-navy' : 'text-editorial-navy/70'
                }`}
              >
                {entry.label}
              </p>
              <p className="mt-0.5 font-body text-[12px] leading-relaxed text-editorial-navy/55">
                {entry.hint}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}