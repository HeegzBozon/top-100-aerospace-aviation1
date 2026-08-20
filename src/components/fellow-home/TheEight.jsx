import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { B } from './fellowHomeConfig';

// The Eight = the top eight positions of the Fellow's My TOP 100 ranked list.
// Vacancy never collapses: eight positions always render.
export default function TheEight({ rankings, isOwner, accent }) {
  const slots = Array.from({ length: 8 }, (_, i) => (rankings || [])[i] || null);
  const filled = slots.filter(Boolean).length;

  return (
    <section className="rounded-3xl p-5 sm:p-7" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-baseline gap-3 flex-wrap mb-1">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          The Eight
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
          {filled} of 8 named
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: B.muted }}>
        {isOwner
          ? 'The eight people at the top of your ranked list. Eight is the whole allowance.'
          : "The eight people at the top of this Fellow's ranked list."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((entry, i) => (
          <div key={i} className="rounded-2xl p-3 text-center" style={{ background: entry ? B.cream : 'transparent', border: entry ? `1px solid ${B.border}` : `1px dashed ${B.border}` }}>
            <div className="text-[10px] font-bold mb-2" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</div>
            {entry ? (
              <>
                <div className="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center" style={{ background: B.sand }}>
                  {entry.nominee_avatar ? (
                    <img src={entry.nominee_avatar} alt={entry.nominee_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: B.navy }}>{(entry.nominee_name || '?').charAt(0)}</span>
                  )}
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: B.navy }}>{entry.nominee_name}</p>
                {entry.nominee_title && (
                  <p className="text-[10px] mt-1 leading-tight" style={{ color: B.muted }}>{entry.nominee_title}</p>
                )}
              </>
            ) : (
              <Link to="/nominate" className="block group">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors group-hover:bg-black/[0.04]"
                  style={{ border: `1px dashed ${B.border}` }}
                >
                  <Plus className="w-4 h-4" style={{ color: B.muted }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: B.muted }}>
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