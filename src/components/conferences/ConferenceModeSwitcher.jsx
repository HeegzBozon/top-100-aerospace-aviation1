import { useNavigate } from 'react-router-dom';
import { B, CONFERENCE_MODES } from './conferenceConfig';

// The two ways to read the circuit. Attend is the index; Host is the workspace behind it.
// The switch is the same object on every surface, so a reader always knows which door they
// are standing at.
export default function ConferenceModeSwitcher({ mode = 'attend' }) {
  const navigate = useNavigate();

  return (
    <div
      className="inline-flex items-center rounded-full p-0.5"
      style={{ background: B.sand, border: `1px solid ${B.border}` }}
    >
      {CONFERENCE_MODES.map((option) => {
        const active = option.key === mode;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => { if (!active) navigate(option.to); }}
            aria-current={active ? 'page' : undefined}
            className="rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors"
            style={active
              ? { background: B.navy, color: '#fff' }
              : { color: B.muted }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}