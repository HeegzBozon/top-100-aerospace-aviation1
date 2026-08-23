import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Network, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import DomainNetworkCard from './DomainNetworkCard';
import DomainNetworkComposer from './DomainNetworkComposer';

// Domain Networks — the standing Communities of Practice. The spine that
// links convening (Mission Rooms) to practice (Authority Pieces) to
// participation (Flightography). Participation is a convening fact and never
// a measurement input — it writes to Flightography, never to scoring.
export default function DomainNetworksView({ user, accent = B.navy, onSelectRooms }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [networks, setNetworks] = useState([]);
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
        const list = await base44.entities.DomainNetwork.list('-updated_date', 50);
        if (!alive) return;
        setNetworks(list || []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const isEmpty = !loading && !error && networks.length === 0;

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
          Standing Communities of Practice — where convening becomes method. Sessions, artifacts, and participation thread through each network.
        </p>
        {isAdmin && !isEmpty && (
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
          >
            <Plus className="w-3.5 h-3.5" /> Convene
          </button>
        )}
      </div>

      {composerOpen && isAdmin && (
        <div className="mb-5 max-w-md">
          <DomainNetworkComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading networks…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load networks.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Network className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>No Domain Networks convened yet.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>A standing Community of Practice is the spine — sessions, artifacts, and participation thread through it.</p>
          {isAdmin && (
            <>
              <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ background: accent, color: '#fff' }}>
                <Plus className="w-3.5 h-3.5" /> Convene a Network
              </button>
              {composerOpen && (
                <div className="w-full max-w-md mt-2">
                  <DomainNetworkComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {networks.map((n) => (
            <DomainNetworkCard key={n.id} network={n} onSelectRooms={onSelectRooms ? () => onSelectRooms() : undefined} />
          ))}
        </div>
      )}
    </>
  );
}