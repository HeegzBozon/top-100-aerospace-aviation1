import { Link } from 'react-router-dom';
import { ARCHIVE_VOLUMES } from '@/components/archive/archiveVolumes';

const navy = '#1e3a5a';
const gold = '#c9a87c';

export default function ArchiveVolumeSwitcher({ currentSeasonId }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 border-b"
      style={{ background: 'rgba(250,248,245,0.92)', borderColor: `${navy}0F` }}>
      {ARCHIVE_VOLUMES.map((v) => {
        const active = v.seasonId === currentSeasonId;
        return (
          <Link
            key={v.seasonId}
            to={`/archive/${v.seasonId}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors"
            style={{
              background: active ? navy : `${navy}0A`,
              color: active ? '#faf8f5' : `${navy}80`,
              border: `1px solid ${active ? navy : `${navy}12`}`,
            }}
          >
            <span style={{ color: active ? gold : gold }}>{v.year}</span>{' '}
            {v.title.startsWith('TOP 100') ? 'Record' : v.title.split(' ')[0]}
          </Link>
        );
      })}
    </div>
  );
}