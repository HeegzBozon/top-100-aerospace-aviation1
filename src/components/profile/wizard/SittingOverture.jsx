import { Camera, PenLine, ArrowRight } from 'lucide-react';
import { WIZARD_COLORS as B } from './WizardField';

const ICONS = { photographer: Camera, biographer: PenLine };

// The arrival beat. The craftsperson speaks before the first question.
export default function SittingOverture({ sitting, onEnter, onBack }) {
  const Icon = ICONS[sitting.id];
  return (
    <div className="pb-2" style={{ animation: 'pw-rise 0.5s ease-out' }}>
      <div className="flex items-center gap-2.5 mb-5">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: B.navy, color: B.gold }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: B.gold }}>
            {sitting.chapter} · {sitting.craft}
          </p>
          <p className="text-sm font-semibold" style={{ color: B.navy }}>{sitting.name}</p>
        </div>
      </div>

      <h2
        className="text-[26px] sm:text-[30px] font-bold leading-tight mb-4"
        style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        “{sitting.greeting}”
      </h2>

      <p
        className="text-[15px] leading-[1.75] pl-4 mb-5"
        style={{ color: B.navy, borderLeft: `2px solid ${B.gold}`, opacity: 0.88 }}
      >
        {sitting.monologue}
      </p>

      <p className="text-sm italic mb-7" style={{ color: B.muted }}>
        {sitting.signoff}
      </p>

      <div className="flex items-center justify-between mb-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: B.muted }}
          >
            Not now
          </button>
        ) : <span />}
        <button
          onClick={onEnter}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: B.navy, color: '#fff' }}
        >
          Begin the sitting <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}