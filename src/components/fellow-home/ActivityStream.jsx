import { Check } from 'lucide-react';
import { B, moduleLabel } from './fellowHomeConfig';

// The reason to open this page tomorrow. Lives on the profile, not in a bell.
export default function ActivityStream({ loading, error, events, accent, onAcknowledge }) {
  if (loading) {
    return (
      <div className="rounded-2xl px-5 py-4" style={{ background: B.navy }}>
        <div className="h-3 w-40 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.18)' }} />
        <div className="h-3 w-64 rounded-full mt-3 animate-pulse" style={{ background: 'rgba(255,255,255,0.12)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl px-5 py-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
        <p className="text-sm" style={{ color: B.muted }}>
          Your activity could not be loaded just now. It will return on your next visit.
        </p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div
        className="rounded-2xl px-5 py-5"
        style={{ background: '#fff', border: `1px dashed ${B.border}` }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: accent }}>
          Since you were last here
        </p>
        <p className="text-sm" style={{ color: B.navy }}>
          Nothing has moved on your page yet.
        </p>
        <p className="text-xs mt-1" style={{ color: B.muted }}>
          Endorsements, list appearances, and verified Flightography entries will surface here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: B.navy }}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
          Since you were last here
        </p>
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] hover:opacity-80 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            <Check className="w-3 h-3" /> Acknowledge
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {events.map((e) => (
          <li key={e.id} className="text-sm flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: accent }} />
            <span>
              {e.summary}
              {e.module_key && (
                <span className="ml-2 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {moduleLabel(e.module_key)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}