import { useState } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// The composition the Manifest opens with.
//
// Vacancy is the call to action: the first place is drawn as an outlined plate carrying
// its number, so the list reads as begun-and-waiting rather than as a page with nothing on
// it. Six records already measured are offered beneath it as seeds, never as a list.
export default function ListEmptyState({ onAdd, addedIds, onBrowse }) {
  const [featured, setFeatured] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Lazy load featured honorees only when empty state mounts
  if (!loaded) {
    setLoaded(true);
    base44.entities.Nominee.list('-aura_score', 6).then(setFeatured).catch(() => {});
  }

  return (
    <div className="py-10">
      <div className="flex items-start gap-4">
        <span className="flex h-16 w-14 shrink-0 items-center justify-center border border-dashed border-editorial-copper/60 font-heading text-2xl text-editorial-copper/70 tabular-nums">
          01
        </span>
        <div className="min-w-0">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
            The first place
          </p>
          <h3 className="mt-1.5 font-heading text-[22px] leading-tight text-editorial-navy">
            Begin your Manifest
          </h3>
          <p className="mt-1.5 max-w-sm font-body text-[12px] leading-relaxed text-editorial-navy/55">
            Name the people doing the work and the order is yours to set. A Manifest is a
            publication, not a vote — the field is measured on the Crosscheck.
          </p>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between gap-3 border-b border-editorial-copper pb-2">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-label">
              Six to begin with
            </p>
            <p className="font-body text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40">
              From the record
            </p>
          </div>

          <div className="divide-y divide-editorial-navy/10">
            {featured.map((n, index) => {
              const isAdded = addedIds.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !isAdded && onAdd(n)}
                  disabled={isAdded}
                  className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition-colors hover:bg-editorial-sand/40 disabled:hover:bg-transparent"
                >
                  <span className="w-5 shrink-0 text-right font-heading text-[12px] text-editorial-navy/30 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-editorial-copper/30 bg-editorial-navy font-heading text-xs text-editorial-cream">
                    {n.avatar_url || n.photo_url ? (
                      <img src={n.avatar_url || n.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      n.name?.[0]?.toUpperCase()
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-[13.5px] leading-snug text-editorial-navy">
                      {n.name}
                    </span>
                    {(n.title || n.professional_role) && (
                      <span className="mt-0.5 block truncate font-body text-[9px] uppercase tracking-[0.12em] text-editorial-navy/45">
                        {n.title || n.professional_role}
                      </span>
                    )}
                  </span>

                  {isAdded ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-editorial-copper" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 shrink-0 text-editorial-navy/35" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onBrowse}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-editorial-navy px-6 py-3 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-cream transition-colors hover:bg-editorial-navy/90"
      >
        <Search className="h-3.5 w-3.5 text-editorial-gold" aria-hidden="true" />
        Browse the field
      </button>
    </div>
  );
}