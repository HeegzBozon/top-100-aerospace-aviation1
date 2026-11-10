import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Focus, Grid3x3, Radio, RotateCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StreamPlayer from '@/components/top100tv/StreamPlayer';
import StreamGridCard from '@/components/top100tv/StreamGridCard';
import ChannelRail from '@/components/top100tv/ChannelRail';
import FlightographySidecar from '@/components/top100tv/FlightographySidecar';
import { ROW_KEYS, WALL_ROWS } from '@/components/top100tv/tvWall';

// TOP 100 TV — the house's wall of live signal.
//
// The channels are the industry's own broadcasts, carried as they happen: the frontier,
// the industry desk, the world desk. Nothing here is sponsored into position; a patron is
// credited on the channel they backed, and the wall's order is the desk's alone.
export default function Top100TV() {
  const [viewMode, setViewMode] = useState('focus');
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['tvStreams'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTVStreams', {});
      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const streams = useMemo(() => data || [], [data]);

  const selected = useMemo(
    () => streams.find((s) => s.id === selectedId) || streams[0] || null,
    [streams, selectedId]
  );

  const onAir = streams.filter((s) => s.is_live).length;

  const openChannel = (id) => {
    setSelectedId(id);
    setViewMode('focus');
  };

  return (
    <div className="min-h-full bg-editorial-navy">
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-10 pt-6 md:px-8 md:pt-8">
        <header className="border-b border-editorial-copper/40 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="pd-label">The Wire · Broadcast</p>
              <h1 className="mt-1 font-heading text-3xl leading-none text-editorial-cream md:text-4xl">
                TOP 100 TV
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-editorial-cream/60">
                The industry's own signal, carried as it happens. Channels are placed by the
                desk, never bought into position — a patron is credited on the broadcast they
                backed and nothing more.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 md:items-end">
              <div className="flex items-center gap-2">
                <span className="desk-lamp h-1.5 w-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-cream/70">
                  {isLoading ? 'Reading the wall' : `${onAir} of ${streams.length} on air`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('focus')}
                  aria-pressed={viewMode === 'focus'}
                  className={`desk-key ${viewMode === 'focus' ? 'desk-key-live' : ''}`}
                >
                  <Focus className="h-3 w-3" />
                  Watch
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`desk-key ${viewMode === 'grid' ? 'desk-key-live' : ''}`}
                >
                  <Grid3x3 className="h-3 w-3" />
                  The wall
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  aria-label="Read the wall again"
                  className="desk-key desk-key-quiet"
                >
                  <RotateCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {isLoading && <WallLoading />}

        {!isLoading && isError && (
          <WallNotice
            title="The wall did not answer"
            body="The desk could not reach the broadcast list. Nothing is lost — read it again."
            action={
              <button type="button" onClick={() => refetch()} className="desk-key desk-key-primary">
                <RotateCw className="h-3 w-3" />
                Read again
              </button>
            }
          />
        )}

        {!isLoading && !isError && streams.length === 0 && (
          <WallNotice
            title="The wall is quiet"
            body="No channel is being carried at the moment. The line-up returns as soon as a source is filed."
          />
        )}

        {!isLoading && !isError && streams.length > 0 && viewMode === 'focus' && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="arcade-glass relative aspect-video w-full overflow-hidden rounded-md">
                <StreamPlayer stream={selected} />
              </div>

              {selected && (
                <div className="desk-plate mt-3 flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {selected.is_live ? (
                        <>
                          <span className="desk-lamp h-1.5 w-1.5" />
                          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-cream/70">
                            On air
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-editorial-cream/30" />
                          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-cream/45">
                            Off air
                          </span>
                        </>
                      )}
                      {selected.region && (
                        <span className="text-[9px] uppercase tracking-[0.14em] text-editorial-cream/35">
                          · {selected.region}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 truncate font-heading text-xl text-editorial-cream">
                      {selected.title}
                    </h2>
                    {selected.domain && (
                      <p className="mt-0.5 truncate text-[11px] text-editorial-cream/45">
                        {selected.domain}
                        {selected.sponsorship?.is_sponsored
                          ? ` · Presented by ${selected.sponsorship.sponsor_name}`
                          : ''}
                      </p>
                    )}
                  </div>

                  {selected.watch_url && (
                    <a
                      href={selected.watch_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="desk-key"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open at source
                    </a>
                  )}
                </div>
              )}

              <div className="mt-3 lg:hidden">
                <ChannelRail streams={streams} selectedId={selected?.id} onSelect={setSelectedId} />
              </div>
            </div>

            <aside className="hidden min-h-0 flex-col gap-3 lg:flex">
              <ChannelRail streams={streams} selectedId={selected?.id} onSelect={setSelectedId} />
              <FlightographySidecar stream={selected} />
            </aside>
          </div>
        )}

        {!isLoading && !isError && streams.length > 0 && viewMode === 'grid' && (
          <div className="mt-6 space-y-7">
            {ROW_KEYS.map((row) => {
              const inRow = streams.filter((s) => (s.row || 3) === row);
              if (!inRow.length) return null;
              const tier = WALL_ROWS[row];
              return (
                <section key={row}>
                  <div className="flex items-baseline gap-3 border-b border-editorial-cream/10 pb-2">
                    <span className="font-heading text-lg text-editorial-gold">
                      {String(row).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-heading text-lg leading-tight text-editorial-cream">
                        {tier.label}
                      </h2>
                      <p className="truncate text-[11px] text-editorial-cream/45">{tier.note}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {inRow.map((stream) => (
                      <StreamGridCard
                        key={stream.id}
                        stream={stream}
                        isSelected={selected?.id === stream.id}
                        onClick={() => openChannel(stream.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WallLoading() {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="arcade-glass relative aspect-video w-full animate-pulse rounded-md" />
        <div className="desk-plate mt-3 h-16 animate-pulse" />
      </div>
      <div className="hidden lg:block">
        <div className="desk-plate h-64 animate-pulse" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-editorial-cream/40 lg:hidden">
        Reading the wall
      </p>
    </div>
  );
}

function WallNotice({ title, body, action }) {
  return (
    <div className="desk-plate mt-8 flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Radio className="h-6 w-6 text-editorial-cream/30" />
      <h2 className="font-heading text-xl text-editorial-cream">{title}</h2>
      <p className="max-w-md text-[12.5px] leading-relaxed text-editorial-cream/50">{body}</p>
      {action}
    </div>
  );
}