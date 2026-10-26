import { B } from '@/components/fellow-home/fellowHomeConfig';

// The sequence rail. Pinned to the top of the picture so a reader always knows
// where in the briefing they stand, and can jump to any step.
export default function BriefingRail({ steps, active, onJump }) {
  return (
    <div
      className="sticky top-0 z-20 -mx-4 mt-4 px-4 py-2.5 md:-mx-8 md:mt-8 md:px-8"
      style={{ background: 'rgba(250,248,245,0.94)', backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-end justify-between gap-3">
        <span className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
          The sequence
        </span>
        <span className="truncate text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          {String(active + 1).padStart(2, '0')}/{String(steps.length).padStart(2, '0')} · {steps[active]?.title}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {steps.map((step, i) => (
          <button
            key={step.key}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Step ${step.index}, ${step.title}`}
            aria-current={i === active ? 'step' : undefined}
            className="flex-1 text-left"
          >
            <span
              className="block h-[3px] rounded-full transition-all"
              style={{ background: i <= active ? B.copper : 'rgba(30,58,90,0.16)' }}
            />
            <span
              className="mt-1.5 block text-[8px] font-bold tracking-[0.16em]"
              style={{ color: i === active ? B.navy : 'rgba(30,58,90,0.4)' }}
            >
              {step.index}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}