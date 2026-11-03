import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, Loader2, RefreshCw, AlertCircle, Search, Users, Activity } from 'lucide-react';
import useSiteTraffic from '@/components/admin/selection/useSiteTraffic';

// The God's Eye — one surface for everything the platform counts. Every collection the
// app keeps is read at once (see the getGodsEye function), so what is on the screen is the
// whole record rather than a sample of it. Counts only: nothing here reads a Fellow's
// measurement, and nothing here is ranked.

const B = {
  surface: '#141b24',
  line: 'rgba(255,255,255,0.08)',
  ink: '#d4e0ec',
  soft: '#5d7a94',
  copper: '#b87333',
  gold: '#c9a87c',
};

const num = (n) => (typeof n === 'number' ? n.toLocaleString() : '—');

const money = (cents) => {
  if (typeof cents !== 'number') return '—';
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const prettyName = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

function Tile({ label, value, note, accent = B.gold }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: B.surface, border: `1px solid ${B.line}` }}>
      <p className="text-[10px] uppercase tracking-wider leading-none mb-1.5" style={{ color: '#6b8199' }}>{label}</p>
      <p className="text-lg font-bold leading-none tabular-nums" style={{ color: accent }}>{value}</p>
      {note && <p className="text-[10px] mt-1.5 leading-tight" style={{ color: B.soft }}>{note}</p>}
    </div>
  );
}

export default function GodsEye() {
  const [snapshot, setSnapshot] = useState(null);
  const [state, setState] = useState('loading');
  const [query, setQuery] = useState('');
  const traffic = useSiteTraffic(28);

  const load = async (fresh = false) => {
    setState('loading');
    try {
      const res = await base44.functions.invoke('getGodsEye', fresh ? { fresh: true } : {});
      if (res?.data?.error) throw new Error(res.data.error);
      setSnapshot(res.data);
      setState('ready');
    } catch {
      setState('error');
    }
  };

  useEffect(() => { load(); }, []);

  const domains = useMemo(() => {
    if (!snapshot?.domains) return [];
    const q = query.trim().toLowerCase();
    if (!q) return snapshot.domains;
    return snapshot.domains
      .map((d) => ({ ...d, entities: d.entities.filter((e) => e.name.toLowerCase().includes(q) || prettyName(e.name).toLowerCase().includes(q)) }))
      .filter((d) => d.entities.length > 0);
  }, [snapshot, query]);

  const peak = useMemo(() => {
    const all = (snapshot?.domains || []).flatMap((d) => d.entities.map((e) => e.count || 0));
    return Math.max(1, ...all);
  }, [snapshot]);

  if (state === 'loading') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: B.gold }} />
          <p className="text-sm" style={{ color: B.soft }}>Reading the whole record…</p>
        </div>
      </div>
    );
  }

  if (state === 'error' || !snapshot) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[420px]">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#e08a7a' }} />
          <h3 className="font-semibold mb-1" style={{ color: B.ink }}>The record could not be read</h3>
          <p className="text-sm mb-4" style={{ color: B.soft }}>The counters are read in one pass and that pass failed. Nothing was changed.</p>
          <button onClick={() => load(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: B.copper, color: '#fff' }}>
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  const t = traffic.totals;

  return (
    <div className="p-6 space-y-6">
      {/* Head */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${B.gold}18`, border: `1px solid ${B.gold}35` }}>
            <Eye className="w-5 h-5" style={{ color: B.gold }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: B.ink }}>God's Eye</h2>
            <p className="text-xs" style={{ color: B.soft }}>
              Every collection the platform keeps, counted in one pass — {snapshot.collections} record types.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] tabular-nums" style={{ color: B.soft }}>
            Read {new Date(snapshot.generated_at).toLocaleTimeString()}
          </span>
          <button onClick={() => load(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: B.ink, border: `1px solid ${B.line}` }}>
            <RefreshCw className="w-3.5 h-3.5" /> Re-read
          </button>
        </div>
      </div>

      {/* The four numbers worth knowing first */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Records on the platform" value={num(snapshot.total)} note={`across ${snapshot.collections} collections`} accent={B.gold} />
        <Tile
          label="Visitors · 28 days"
          value={traffic.state === 'ready' ? num(t?.users) : '—'}
          note={traffic.state === 'ready' ? `${num(t?.sessions)} sessions · ${num(t?.views)} page views` : traffic.state === 'empty' ? 'No analytics property connected' : traffic.state === 'error' ? 'Analytics unavailable' : 'Reading…'}
          accent="#85c1e9"
        />
        <Tile label="Collected · succeeded payments" value={money(snapshot.collectedCents)} note="Sum of completed payments" accent="#8ad4a8" />
        <Tile label="Open reader notes" value={num(snapshot.highlights.find((h) => h.key === 'notes')?.value)} note="Notes and corrections filed on issues" accent="#e0a96b" />
      </div>

      {/* Every headline counter */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Activity className="w-3.5 h-3.5" style={{ color: B.soft }} />
          <h3 className="text-[10px] uppercase tracking-[0.16em]" style={{ color: B.soft }}>Headline counters</h3>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {snapshot.highlights.map((h) => (
            <Tile key={h.key} label={h.label} value={num(h.value)} />
          ))}
        </div>
      </div>

      {/* The whole inventory */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: B.soft }} />
            <h3 className="text-[10px] uppercase tracking-[0.16em]" style={{ color: B.soft }}>Every collection</h3>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: B.soft }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a record type"
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs w-60 outline-none"
              style={{ background: B.surface, color: B.ink, border: `1px solid ${B.line}` }}
            />
          </div>
        </div>

        {domains.length === 0 ? (
          <p className="text-xs py-8 text-center" style={{ color: B.soft }}>No collection answers to “{query}”.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {domains.map((domain) => (
              <div key={domain.key} className="rounded-xl overflow-hidden" style={{ background: B.surface, border: `1px solid ${B.line}` }}>
                <div className="px-3.5 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.line}` }}>
                  <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: B.gold }}>{domain.label}</span>
                  <span className="text-[10px] tabular-nums" style={{ color: B.soft }}>
                    {num(domain.entities.reduce((s, e) => s + (e.count || 0), 0))}
                  </span>
                </div>
                <div className="p-2.5 space-y-1">
                  {domain.entities.map((e) => (
                    <div key={e.name} className="relative flex items-center justify-between rounded px-2 py-1" style={{ overflow: 'hidden' }}>
                      <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.max(2, ((e.count || 0) / peak) * 100)}%`, background: 'rgba(201,168,124,0.10)' }} />
                      <span className="relative text-[11px]" style={{ color: B.ink }}>{prettyName(e.name)}</span>
                      <span className="relative text-[11px] tabular-nums" style={{ color: e.count ? B.gold : B.soft }}>{num(e.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed pt-1" style={{ color: B.soft }}>
        Counts describe the platform's own housekeeping. They are never read by discovery, ranking, scoring, or influence —
        and the numbers here are not measurement of any Fellow.
      </p>
    </div>
  );
}