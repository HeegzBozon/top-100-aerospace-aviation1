import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import EightVisibilityToggle from '@/components/fellow-home/EightVisibilityToggle';

// The Eight slide — eight ordinal slots, always rendered. Vacancy is the
// call to action: empty slots show as visible outlined placeholders with the
// position number. Never collapse, never gray out.
export default function EightSlide({ rankings, isOwner, accent, isPublic, savingVisibility, onVisibilityChange, loading }) {
  const slots = Array.from({ length: 8 }, (_, i) => (rankings || [])[i] || null);
  const filled = slots.filter(Boolean).length;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div className="text-center px-6 max-w-4xl w-full py-20">
        <div className="flex items-baseline justify-center gap-3 flex-wrap mb-2">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            My TOP 100
          </h2>
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
            {filled} of 8 named
          </span>
          {isOwner && onVisibilityChange && (
            <div className="absolute top-20 right-6 sm:right-12">
              <EightVisibilityToggle isPublic={isPublic} saving={savingVisibility} onChange={onVisibilityChange} accent={accent} />
            </div>
          )}
        </div>
        <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: B.muted }}>
          {isOwner ? 'The eight people at the top of your ranked list. Eight is the whole allowance.' : "The eight people at the top of this Fellow's ranked list."}
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {slots.map((entry, i) => (
              <div key={i} className="text-center">
                <div className="text-xs font-bold mb-2" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</div>
                {entry ? (
                  <>
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center"
                      style={{ background: B.sand, border: `1px solid ${B.border}` }}
                    >
                      {entry.nominee_avatar ? (
                        <img src={entry.nominee_avatar} alt={entry.nominee_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold" style={{ color: B.navy }}>{(entry.nominee_name || '?').charAt(0)}</span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold leading-tight" style={{ color: B.navy }}>{entry.nominee_name}</p>
                  </>
                ) : (
                  <Link to="/nominate" className="block group">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors group-hover:bg-black/[0.03]"
                      style={{ border: `1px dashed ${B.border}` }}
                    >
                      <Plus className="w-4 h-4" style={{ color: B.muted }} />
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: B.muted }}>
                      {isOwner ? 'Open' : 'Unnamed'}
                    </p>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <Link
            to="/nominate"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-75 transition-opacity"
            style={{ color: B.navy }}
          >
            {filled < 8 ? 'Name the rest' : 'Reorder your list'} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
}