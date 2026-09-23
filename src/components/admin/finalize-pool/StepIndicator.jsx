import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="sticky top-0 z-20 bg-editorial-cream/95 backdrop-blur border-b border-editorial-copper/30 py-4">
      <ol className="flex flex-wrap items-center gap-2 md:gap-4">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                done ? 'bg-editorial-gold border-editorial-gold text-editorial-navy'
                  : active ? 'border-editorial-gold text-editorial-navy bg-white'
                  : 'border-editorial-navy/20 text-editorial-navy/40 bg-white'}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs uppercase tracking-widest ${active ? 'text-editorial-navy font-bold' : 'text-editorial-navy/50'}`}>
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