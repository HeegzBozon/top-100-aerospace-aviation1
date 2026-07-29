import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ArchiveHonoreeCard from '@/components/archive/ArchiveHonoreeCard';
import ArchiveHonoreeDetail from '@/components/archive/ArchiveHonoreeDetail';

const navy = '#1e3a5a';
const gold = '#c9a87c';

export default function SeasonArchive() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const [s, list] = await Promise.all([
        base44.entities.Season.filter({ id: seasonId }),
        base44.entities.Nominee.filter({ season_id: seasonId }, '-created_date', 500),
      ]);
      if (!active) return;
      setSeason(s?.[0] || null);
      setNominees(
        [...list].sort(
          (a, b) => (a.raw_nomination_data?.rank ?? 9999) - (b.raw_nomination_data?.rank ?? 9999)
        )
      );
      setLoading(false);
    })();
    return () => { active = false; };
  }, [seasonId]);

  return (
    <div className="min-h-screen" style={{ background: '#faf8f5' }}>
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md border-b"
        style={{ background: 'rgba(250,248,245,0.92)', borderColor: `${navy}12` }}>
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          aria-label="Go back"
          className="h-8 shrink-0 rounded-full flex items-center justify-center gap-1 px-2 lg:px-3"
          style={{ background: `${navy}0D`, color: navy }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden lg:inline text-[11px] font-bold uppercase tracking-[0.12em]">Back</span>
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${navy}60` }}>The Archive</p>
          <p className="text-xs font-semibold truncate" style={{ color: navy }}>{season?.name || 'Loading…'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: gold }}>
            TOP 100 Aerospace &amp; Aviation
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight" style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
            {season?.name || 'Season Archive'}
          </h1>
          {season?.theme && (
            <p className="mt-3 text-sm sm:text-base" style={{ color: `${navy}99` }}>{season.theme}</p>
          )}
          {!loading && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: `${navy}70` }}>
              {nominees.length} honorees on record
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: navy }} />
          </div>
        ) : nominees.length === 0 ? (
          <p className="text-sm py-16 text-center" style={{ color: `${navy}80` }}>
            No honorees recorded for this season yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {nominees.map((n) => (
              <ArchiveHonoreeCard
                key={n.id}
                nominee={n}
                rank={n.raw_nomination_data?.rank ?? '—'}
                onClick={() => setSelected(n)}
              />
            ))}
          </div>
        )}
      </div>

      <ArchiveHonoreeDetail nominee={selected} onClose={() => setSelected(null)} />
    </div>
  );
}