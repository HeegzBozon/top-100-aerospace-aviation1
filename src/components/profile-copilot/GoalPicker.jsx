import { Briefcase, Handshake, Compass } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { COPILOT_GOALS } from './copilotGoals';

const ICONS = { Briefcase, Handshake, Compass };

// Step one: what is this presentation for? Nothing is composed until the Fellow
// says which outcome they are preparing for.
export default function GoalPicker({ value, onChange, disabled }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {COPILOT_GOALS.map((goal) => {
        const Icon = ICONS[goal.icon] || Compass;
        const selected = value === goal.key;
        return (
          <button
            key={goal.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(goal.key)}
            aria-pressed={selected}
            className="text-left rounded-2xl p-4 transition-all disabled:opacity-60"
            style={{
              background: selected ? `${B.copper}0d` : '#fff',
              border: `1px solid ${selected ? B.copper : B.border}`,
              boxShadow: selected ? `0 10px 28px -22px ${B.copper}` : 'none',
            }}
          >
            <Icon className="w-4 h-4 mb-3" style={{ color: selected ? B.copper : B.muted }} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: B.muted }}>
              {goal.kicker}
            </p>
            <p className="text-sm font-semibold leading-snug" style={{ color: B.navy }}>
              {goal.label}
            </p>
            <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: B.muted }}>
              {goal.blurb}
            </p>
          </button>
        );
      })}
    </div>
  );
}