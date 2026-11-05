import { Check } from 'lucide-react';

// Where the wizard is standing.
//
// On a desk the whole run of steps is printed across the head of the panel — it is a
// short line and there is width for it. On a phone that line wraps onto two or three
// rows of small caps, which is a third of the picture spent on a label. So the handheld
// prints the one thing an operator needs: the step they are on, its name, and how far
// through the run it is, with the measure drawn underneath as a rule. Nothing else.
export default function StepIndicator({ steps, current }) {
  const active = steps[current];
  const measure = steps.length ? ((current + 1) / steps.length) * 100 : 0;

  return (
    <div className="sticky top-0 z-20 bg-editorial-cream/95 backdrop-blur border-b border-editorial-copper/30 py-2.5 md:py-4">
      {/* The phone: one line, one measure. */}
      <div className="md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-editorial-gold bg-white text-[11px] font-bold text-editorial-navy">
            {current + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-editorial-navy">
            {active?.label || 'Step'}
          </span>
          <span className="flex-none text-[11px] font-bold tabular-nums text-editorial-navy/50">
            {current + 1}/{steps.length}
          </span>
        </div>
        <span className="mt-2 block h-[2px] w-full overflow-hidden rounded-full bg-editorial-navy/10">
          <span
            className="block h-full rounded-full bg-editorial-copper transition-[width] duration-300"
            style={{ width: `${measure}%` }}
          />
        </span>
      </div>

      {/* The desk: the full run, spaced. */}
      <ol className="hidden flex-wrap items-center gap-2 md:flex md:gap-4">
        {steps.map((s, i) => {
          const done = i < current;
          const isActive = i === current;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                done ? 'bg-editorial-gold border-editorial-gold text-editorial-navy'
                  : isActive ? 'border-editorial-gold text-editorial-navy bg-white'
                  : 'border-editorial-navy/20 text-editorial-navy/40 bg-white'}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs uppercase tracking-widest ${isActive ? 'text-editorial-navy font-bold' : 'text-editorial-navy/50'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="hidden md:block w-8 h-px bg-editorial-copper/40" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}