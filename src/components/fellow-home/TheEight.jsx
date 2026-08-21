import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { B } from './fellowHomeConfig';
import EightVisibilityToggle from './EightVisibilityToggle';

// The Eight = the top eight positions of the Fellow's My TOP 100 ranked list.
// Vacancy never collapses: eight positions always render.
export default function TheEight({ rankings, isOwner, accent, isPublic = true, savingVisibility, onVisibilityChange }) {
  const slots = Array.from({ length: 8 }, (_, i) => (rankings || [])[i] || null);
  const filled = slots.filter(Boolean).length;

  return (
    <section className="rounded-3xl p-5 sm:p-7" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          My TOP 100
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
          {filled} of 8 named
        </span>
        {isOwner && onVisibilityChange && (
          <div className="ml-auto">
            <EightVisibilityToggle
              isPublic={isPublic}
              saving={savingVisibility}
              onChange={onVisibilityChange}
              accent={accent}
            />
          </div>
        )}
      </div>
      <p className="text-sm mb-6" style={{ color: B.muted }}>
        {isOwner
          ? 'The eight people at the top of your ranked list. Eight is the whole allowance.'
          : "The eight people at the top of this Fellow's ranked list."}
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {slots.map((entry, i) => (
          <div key={i} className="text-center">
            <div className="text-[9px] font-bold mb-1.5" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</div>
            {entry ? (
              <>
                <div className="w-11 h-11 rounded-full mx-auto mb-1.5 overflow-hidden flex items-center justify-center" style={{ background: B.sand, border: `1px solid ${B.border}` }}>
                  {entry.nominee_avatar ? (
                    <img src={entry.nominee_avatar} alt={entry.nominee_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: B.navy }}>{(entry.nominee_name || '?').charAt(0)}</span>
                  )}
                </div>
                <p className="text-[11px] font-semibold leading-tight" style={{ color: B.navy }}>{entry.nominee_name}</p>
              </>
            ) : (
              <Link to="/nominate" className="block group">
                <div
                  className="w-11 h-11 rounded-full mx-auto mb-1.5 flex items-center justify-center transition-colors group-hover:bg-black/[0.04]"
                  style={{ border: `1px dashed ${B.border}` }}
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: B.muted }} />
                </div>
                <p className="text-[11px] font-semibold" style={{ color: B.muted }}>
                  {isOwner ? 'Open' : 'Unnamed'}
                </p>
              </Link>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <Link
          to="/nominate"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-75 transition-opacity"
          style={{ color: B.navy }}
        >
          {filled < 8 ? 'Name the rest' : 'Reorder your list'} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
}