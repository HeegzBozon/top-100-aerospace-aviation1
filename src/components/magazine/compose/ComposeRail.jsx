import { COMPOSE_STEPS, isStepDone } from './composeConfig';

// Where the lap stands. One tick per decision, copper once it is written, navy where
// the cursor is standing, and beneath them the measure of the whole issue. It reports
// progress; it never hurries anyone — a tick can be walked back to at any time.

export default function ComposeRail({ values, index, onJump }) {
  const total = COMPOSE_STEPS.length;
  const decisions = COMPOSE_STEPS.filter((step) => step.kind !== 'review');
  const written = decisions.filter((step) => isStepDone(values, step)).length;
  const percent = Math.round((written / decisions.length) * 100);

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-end gap-1.5" role="list" aria-label="The lap">
          {COMPOSE_STEPS.map((step, i) => {
            const done = step.kind !== 'review' && isStepDone(values, step);
            const current = i === index;
            return (
              <button
                key={step.key}
                type="button"
                role="listitem"
                onClick={() => onJump(step.key)}
                aria-label={`Step ${i + 1}: ${step.eyebrow}`}
                aria-current={current ? 'step' : undefined}
                className="group py-2"
              >
                <span
                  className={`block h-[2px] w-6 transition-all duration-500 sm:w-9 ${
                    current
                      ? 'bg-editorial-navy'
                      : done
                        ? 'bg-editorial-copper'
                        : 'bg-editorial-navy/15 group-hover:bg-editorial-navy/35'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-editorial-navy/45">
          {index + 1} of {total}
          <span className="ml-2 text-editorial-label">{written} written</span>
        </p>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <div
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-editorial-navy/10"
          role="progressbar"
          aria-label="Issue written"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span
            className="block h-full rounded-full bg-editorial-copper transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="font-body text-[10px] tabular-nums uppercase tracking-[0.22em] text-editorial-label">
          {percent}%
        </p>
      </div>
    </div>
  );
}