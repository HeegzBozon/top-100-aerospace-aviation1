import { Eye, EyeOff, Lock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { slideLabel } from '@/components/profile-deck/slideDeckConfig';

// The recommended order, still subject to the Fellow. Positions 1 and 2 are
// shown locked rather than offered: identity and credential are never moved.
export default function ProposalSlides({ order, selected, onToggle, accent }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: B.muted }}>
        Recommended presentation order
      </p>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${B.border}`, background: '#fff' }}>
        {['identity', 'verification'].map((key, i) => (
          <div key={key} className="flex items-center gap-3 px-3.5 py-2.5" style={{ borderBottom: `1px solid ${B.border}` }}>
            <span className="text-[10px] font-bold w-5" style={{ color: B.muted }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[12px] flex-1" style={{ color: B.muted }}>{slideLabel(key)}</span>
            <Lock className="w-3 h-3" style={{ color: B.muted }} aria-label="Locked position" />
          </div>
        ))}
        {order.map((key, i) => {
          const on = selected.has(key);
          return (
            <div
              key={key}
              className="flex items-center gap-3 px-3.5 py-2.5"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${B.border}`, opacity: on ? 1 : 0.45 }}
            >
              <span className="text-[10px] font-bold w-5" style={{ color: on ? accent : B.muted }}>
                {String(i + 3).padStart(2, '0')}
              </span>
              <span className="text-[12px] flex-1 font-medium" style={{ color: B.navy }}>{slideLabel(key)}</span>
              <button
                type="button"
                onClick={() => onToggle(key)}
                aria-pressed={on}
                aria-label={on ? `Hide ${slideLabel(key)}` : `Include ${slideLabel(key)}`}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: on ? accent : B.muted }}
              >
                {on ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] mt-2" style={{ color: B.muted }}>
        Identity and Credential stay at positions 1 and 2. Nothing is applied until you approve it.
      </p>
    </div>
  );
}