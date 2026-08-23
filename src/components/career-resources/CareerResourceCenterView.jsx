import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, GraduationCap, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import CareerResourceCard from './CareerResourceCard';
import CareerResourceComposer from './CareerResourceComposer';

// Career Resource Center — the CoE's curated credential and practice library.
// Distinct from the Job Board (postings): this is the transferable-method
// output that gives members a reason to return to the convening.
export default function CareerResourceCenterView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resources, setResources] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const list = await base44.entities.CareerResource.list('-updated_date', 100);
        if (!alive) return;
        setResources((list || []).filter((r) => r.is_active));
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const isEmpty = !loading && !error && resources.length === 0;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
          The Center's curated credential and practice library — guides, frameworks, and pathways distilled from the convening corpus.
        </p>
        {isAdmin && !isEmpty && (
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Resource
          </button>
        )}
      </div>

      {composerOpen && isAdmin && (
        <div className="mb-5 max-w-md">
          <CareerResourceComposer accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading resources…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load resources.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <GraduationCap className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>No career resources yet.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>The CoE curates guides, frameworks, and pathways here — the transferable method members return for.</p>
          {isAdmin && (
            <>
              <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ background: accent, color: '#fff' }}>
                <Plus className="w-3.5 h-3.5" /> Add a Resource
              </button>
              {composerOpen && (
                <div className="w-full max-w-md mt-2">
                  <CareerResourceComposer accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <CareerResourceCard key={r.id} resource={r} accent={accent} />
          ))}
        </div>
      )}
    </>
  );
}