import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';

// The Eight — eight ordinal slots, always rendered. Vacancy is the call to
// action: an empty position keeps its number and its outline and is never
// collapsed, hidden, filled in, or greyed out. Position one reads as position one.
export default function EightModule({ rankings, loading }) {
  const slots = Array.from({ length: 8 }, (_, i) => (rankings || [])[i] || null);
  const filled = slots.filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-editorial-navy/40" />
        <span className="font-body text-[12px] tracking-[0.08em] text-editorial-navy/50">Reading the list…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-body text-[11px] uppercase tracking-[0.18em] text-editorial-navy/60">
          {filled} of 8 named
        </p>
        <p className="max-w-md font-body text-[11px] leading-relaxed text-editorial-navy/50">
          Eight is the whole allowance. An entry carries no weight in how the institution measures anyone.
        </p>
      </div>

      <ol className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
        {slots.map((entry, i) => (
          <li key={i} className="text-center">
            <p className="font-heading text-[11px] tabular-nums tracking-[0.18em] text-editorial-copper">
              {String(i + 1).padStart(2, '0')}
            </p>

            {entry ? (
              <>
                <div className="mx-auto mt-3 h-16 w-16 overflow-hidden rounded-full bg-editorial-sand ring-1 ring-editorial-copper/30">
                  {entry.nominee_avatar ? (
                    <img
                      src={entry.nominee_avatar}
                      alt={entry.nominee_name || 'Named Fellow'}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-heading text-lg text-editorial-navy/70">
                      {(entry.nominee_name || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-heading text-[13px] leading-tight text-editorial-navy">
                  {entry.nominee_name}
                </p>
                {(entry.nominee_title || entry.nominee_company) && (
                  <p className="mt-1 font-body text-[10px] leading-tight text-editorial-navy/50">
                    {[entry.nominee_title, entry.nominee_company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </>
            ) : (
              <Link to="/nominate" className="group block">
                <div className="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-editorial-copper/45 transition-colors group-hover:border-editorial-copper group-hover:bg-editorial-copper/5">
                  <Plus className="h-4 w-4 text-editorial-copper/70" />
                </div>
                <p className="mt-3 font-body text-[10px] uppercase tracking-[0.16em] text-editorial-navy/40">
                  Open
                </p>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}