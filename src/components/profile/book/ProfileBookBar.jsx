import { BookOpen, Clapperboard, BookMarked, Download } from 'lucide-react';
import { stageLabel } from '@/components/episode/episodeStages';

const NAVY = '#132539';

const MODES = [
  { key: 'book', label: 'Book', Icon: BookMarked },
  { key: 'read', label: 'Read', Icon: BookOpen },
  { key: 'watch', label: 'Watch', Icon: Clapperboard },
];

// One strip above the record: how it is presented, and where the episode stands.
// The record is the same in all three — a book, a plain page reader, or the film
// cut from it.
export default function ProfileBookBar({
  mode,
  onChange,
  pageCount,
  canWatch,
  episodeStatus,
  onDossier,
}) {
  const options = MODES.filter((m) => m.key !== 'watch' || canWatch);

  return (
    <div style={{ background: NAVY, borderBottom: '1px solid rgba(201,168,124,0.25)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-10">
        <p
          className="font-body text-[9.5px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(201,168,124,0.78)' }}
        >
          {pageCount ? `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}` : 'The record'}
          {episodeStatus ? ` · Episode ${stageLabel(episodeStatus).toLowerCase()}` : ''}
        </p>

        <div className="flex items-center gap-2">
          {onDossier && (
            <button
              type="button"
              onClick={onDossier}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(201,168,124,0.85)' }}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden font-body text-[9.5px] font-bold uppercase tracking-[0.18em] sm:inline">
                Dossier
              </span>
            </button>
          )}

          <div
            role="group"
            aria-label="How to view this record"
            className="flex items-center gap-0.5 rounded-full p-0.5"
            style={{ border: '1px solid rgba(250,248,245,0.15)' }}
          >
            {options.map(({ key, label, Icon }) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key)}
                  aria-pressed={active}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors"
                  style={
                    active
                      ? { background: '#B87333', color: '#FAF8F5' }
                      : { color: 'rgba(250,248,245,0.6)' }
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.2em]">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}