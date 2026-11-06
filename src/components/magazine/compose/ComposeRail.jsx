import { COMPOSE_STEPS, isStepDone } from './composeConfig';

// Where the lap stands. One tick per decision, copper once it is written, navy where
// the cursor is standing. It reports progress; it never hurries anyone — a tick can be
// walked back to at any time.

export default function ComposeRail({ values, index, onJump }) {
  const total = COMPOSE_STEPS.length;
  const written = COMPOSE_STEPS.filter((step) => step.kind !== 'review' && isStepDone(values, step)).length;

  return (
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
  );
}