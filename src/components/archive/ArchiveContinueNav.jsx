import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ARCHIVE_VOLUMES, getVolumeIndex } from '@/components/archive/archiveVolumes';

const navy = '#1e3a5a';
const gold = '#c9a87c';

export default function ArchiveContinueNav({ currentSeasonId }) {
  const idx = getVolumeIndex(currentSeasonId);
  if (idx === -1) return null;

  const prev = ARCHIVE_VOLUMES[idx - 1];
  const next = ARCHIVE_VOLUMES[idx + 1];
  const others = ARCHIVE_VOLUMES.filter((v, i) => i !== idx && i !== idx - 1 && i !== idx + 1);

  return (
    <section className="border-t px-4 sm:px-6 py-10 sm:py-16" style={{ borderColor: `${navy}12`, background: 'white' }}>
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: gold }}>
          Keep Exploring
        </p>
        <h2 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-8"
          style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
          There are {ARCHIVE_VOLUMES.length - 1} more volumes on record.
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {prev && (
            <Link
              to={`/archive/${prev.seasonId}`}
              className="group flex items-start gap-3 p-5 border transition-all hover:-translate-y-0.5"
              style={{ borderColor: `${navy}18`, background: '#faf8f5' }}
            >
              <ArrowLeft className="w-4 h-4 mt-1 shrink-0 opacity-50 group-hover:opacity-100" style={{ color: navy }} />
              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: gold }}>Previous · {prev.year}</p>
                <p className="text-sm sm:text-base font-light leading-snug"
                  style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>{prev.title}</p>
                <p className="mt-1 text-[11px]" style={{ color: `${navy}70` }}>{prev.note}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link
              to={`/archive/${next.seasonId}`}
              className="group flex items-start justify-between gap-3 p-5 border transition-all hover:-translate-y-0.5"
              style={{ borderColor: `${navy}18`, background: '#faf8f5' }}
            >
              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: gold }}>Next · {next.year}</p>
                <p className="text-sm sm:text-base font-light leading-snug"
                  style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>{next.title}</p>
                <p className="mt-1 text-[11px]" style={{ color: `${navy}70` }}>{next.note}</p>
              </div>
              <ArrowRight className="w-4 h-4 mt-1 shrink-0 opacity-50 group-hover:opacity-100" style={{ color: navy }} />
            </Link>
          )}
        </div>

        {others.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {others.map((v) => (
              <Link
                key={v.seasonId}
                to={`/archive/${v.seasonId}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-medium transition-all hover:-translate-y-0.5"
                style={{ borderColor: `${gold}45`, color: navy, background: '#faf8f5' }}
              >
                <span style={{ color: gold }}>{v.year}</span>
                {v.title}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}