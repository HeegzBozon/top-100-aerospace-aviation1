import { useState, useEffect } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';

export default function DesktopSearchPanel({ addedIds, onAdd }) {
  const [query, setQuery] = useState('');
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Nominee.list('-aura_score', 200).then(r => {
      setNominees(r);
      setLoading(false);
    });
  }, []);

  const filtered = nominees.filter(n => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      n.name?.toLowerCase().includes(q) ||
      n.title?.toLowerCase().includes(q) ||
      n.professional_role?.toLowerCase().includes(q) ||
      n.company?.toLowerCase().includes(q) ||
      n.organization?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="flex flex-col h-full rounded-3xl border overflow-hidden"
      style={{ background: 'white', borderColor: `${brand.navy}10` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: `${brand.navy}08` }}>
        <h2 className="text-base font-bold mb-3" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Browse Nominees
        </h2>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border"
          style={{ background: `${brand.cream}`, borderColor: `${brand.navy}15` }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}50` }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, role, company..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: brand.navy }}
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: `${brand.gold}40`, borderTopColor: brand.gold }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: `${brand.navy}50` }}>No results for "{query}"</p>
          </div>
        ) : (
          filtered.slice(0, 150).map(nominee => {
            const isAdded = addedIds.has(nominee.id);
            return (
              <div
                key={nominee.id}
                className="flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-default"
                style={{
                  background: isAdded ? `${brand.navy}04` : 'white',
                  borderColor: isAdded ? `${brand.gold}40` : `${brand.navy}08`,
                }}
              >
                {/* Avatar */}
                <div
                  className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                >
                  {nominee.avatar_url || nominee.photo_url ? (
                    <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name} className="w-full h-full object-cover" />
                  ) : nominee.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>{nominee.name}</p>
                  <p className="text-[10px] truncate" style={{ color: `${brand.navy}55` }}>
                    {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
                  </p>
                </div>

                {/* Add button */}
                <button
                  onClick={() => !isAdded && onAdd(nominee)}
                  className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: isAdded ? `${brand.gold}20` : `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
                  }}
                >
                  {isAdded ? (
                    <Check className="w-3.5 h-3.5" style={{ color: brand.gold }} />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}