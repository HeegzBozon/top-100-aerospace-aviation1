import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import useProfileNeighbors from '@/components/profile/useProfileNeighbors';

const B = {
  navyDeep: '#16293f',
  navy: '#1e3a5a',
  gold: '#c9a87c',
  cream: '#faf8f5',
  sand: '#efe7dc',
};

const DISCIPLINE_LABELS = {
  space_rd: 'Space Research & Development',
  commercial_aviation: 'Commercial Aviation',
  defense: 'Defense Aerospace',
  manufacturing: 'Aerospace Manufacturing',
  operations: 'Flight Operations',
  engineering: 'Aerospace Engineering',
  policy: 'Space & Aviation Policy',
  entrepreneurship: 'Aerospace Entrepreneurship',
};

function SiblingCard({ fellow }) {
  const img = fellow.avatar_url || fellow.photo_url;
  return (
    <Link
      to={`/profiles/${fellow.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/60"
      style={{ border: `1px solid ${B.navy}14` }}
    >
      <div
        className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: B.sand, border: `1px solid ${B.gold}33` }}
      >
        {img ? (
          <img src={img} alt={fellow.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-sm font-semibold" style={{ color: B.navy }}>
            {fellow.name?.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: B.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          {fellow.name}
        </div>
        <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(22,41,63,0.6)' }}>
          {fellow.title || fellow.professional_role || 'Fellow'}
        </div>
      </div>
      <ArrowUpRight
        className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: B.gold }}
      />
    </Link>
  );
}

// On-brand internal-linking rail rendered below the profile deck. Real <a>
// links with Fellow-name anchor text let PageRank flow between profile pages
// and give crawlers a traversable graph within each discipline cluster.
export default function ProfileNeighborsRail({ nominee }) {
  const { siblings, prev, next, loading } = useProfileNeighbors(nominee);

  if (loading || (!siblings.length && !prev && !next)) return null;

  const disciplineLabel = nominee?.discipline
    ? DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || 'Aerospace'
    : 'Aerospace';

  return (
    <section
      className="px-4 py-10 md:py-14"
      style={{ background: B.cream, borderTop: `1px solid ${B.gold}22` }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Visible breadcrumb — UX + indexable internal links (mirrors JSON-LD) */}
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline" style={{ color: 'rgba(22,41,63,0.5)' }}>
            Home
          </Link>
          <span style={{ color: 'rgba(22,41,63,0.3)' }}>/</span>
          <Link to="/Top100Women2025" className="hover:underline" style={{ color: 'rgba(22,41,63,0.5)' }}>
            Directory
          </Link>
          <span style={{ color: 'rgba(22,41,63,0.3)' }}>/</span>
          <span className="truncate" style={{ color: B.navyDeep }}>
            {nominee?.name}
          </span>
        </nav>

        <div className="flex items-baseline justify-between mb-5">
          <h2
            className="text-lg md:text-xl font-semibold"
            style={{ color: B.navyDeep, fontFamily: "'Playfair Display', serif" }}
          >
            More in {disciplineLabel}
          </h2>
          <Link
            to="/Top100Women2025"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] hover:underline"
            style={{ color: B.gold }}
          >
            View Directory
          </Link>
        </div>

        {siblings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {siblings.map((f) => (
              <SiblingCard key={f.id} fellow={f} />
            ))}
          </div>
        )}

        {(prev || next) && (
          <div className="flex items-center justify-between gap-3 pt-2" style={{ borderTop: `1px solid ${B.navy}10` }}>
            {prev ? (
              <Link
                to={`/profiles/${prev.id}`}
                className="inline-flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: B.navy }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[180px]">{prev.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/profiles/${next.id}`}
                className="inline-flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: B.navy }}
              >
                <span className="truncate max-w-[180px]">{next.name}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </section>
  );
}