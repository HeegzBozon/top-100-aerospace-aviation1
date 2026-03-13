import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Rocket, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { Button } from '@/components/ui/button';
import LaunchDetailModal from '@/components/home/LaunchDetailModal';
import { LaunchListItem } from '@/components/epics/02-signal-feed/launches';
import { LaunchCalendarView } from '@/components/epics/02-signal-feed/launches';
import { LaunchDateTime } from '@/components/epics/02-signal-feed/launches';
import { LaunchTheatre } from '@/components/epics/02-signal-feed/launches';

const PAGE_SIZE = 10;

function LaunchGridCard({ launch, onClick }) {
  const providerName = launch.launch_service_provider?.name || null;
  const locationName = launch.pad?.location?.name || launch.pad?.name || '';
  const imageUrl = launch.image || null;
  const statusName = launch.status?.name || 'TBD';
  const isGo = launch.status?.abbrev === 'Go';
  const hasStream = launch.vidURLs?.length > 0;
  const missionDesc = launch.mission?.description || null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex flex-col rounded-xl overflow-hidden bg-white border border-[#1e3a5a]/10 shadow-sm hover:shadow-md hover:border-[#c9a87c]/40 transition-all duration-200 cursor-pointer"
      aria-label={`View details for ${launch.name}`}
    >
      <div className="relative h-44 bg-[#0f1d2d] overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={launch.name} className="w-full h-full object-cover opacity-70" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-12 h-12 text-[#c9a87c]/30" />
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${isGo ? 'bg-green-500/90 text-white' : 'bg-[#1e3a5a] text-white/60'}`}>
          {statusName}
        </span>
        {hasStream && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <div className="p-4 space-y-2 flex-1">
        {providerName && <p className="text-xs font-semibold text-[#c9a87c] truncate">{providerName}</p>}
        <h2 className="text-sm font-bold text-[#1e3a5a] leading-tight">{launch.name}</h2>
        <LaunchDateTime isoString={launch.net} />
        {locationName && (
          <div className="flex items-center gap-1.5 text-xs text-[#1e3a5a]/50">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{locationName}</span>
          </div>
        )}
        {missionDesc && <p className="text-xs text-[#1e3a5a]/40 line-clamp-3 pt-1">{missionDesc}</p>}
      </div>
    </article>
  );
}

export default function LaunchParty() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [view, setView] = useState('list');
  const listRef = useRef(null);

  const fetchLaunches = useCallback(async (currentOffset, append = false) => {
    try {
      const res = await getUpcomingLaunches({ limit: PAGE_SIZE, offset: currentOffset });
      const results = res.data?.launches || [];
      setLaunches(prev => append ? [...prev, ...results] : results);
      setHasMore(results.length === PAGE_SIZE);
    } catch {
      setError('Could not load upcoming launches. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchLaunches(0); }, [fetchLaunches]);

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    setIsLoadingMore(true);
    fetchLaunches(nextOffset, true);
  };

  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {!isLoading && !error && launches.length > 0 && (
        <LaunchTheatre launch={launches[0]} onScrollDown={scrollToList} />
      )}

      {isLoading && (
        <div className="w-full min-h-[300px] flex items-center justify-center bg-gradient-to-br from-[#0f1d2d] to-[#152a42]">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a87c]" />
        </div>
      )}

      <header ref={listRef} className="border-b border-[#1e3a5a]/10 px-4 py-4 sm:px-6 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-[#1e3a5a]">All Upcoming Launches</h1>
            <p className="text-xs text-[#1e3a5a]/50">Live data via TheSpaceDevs</p>
          </div>

          <div className="flex items-center rounded-lg p-1 gap-1 bg-[#1e3a5a]/[0.06]">
            {['list', 'grid', 'calendar'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all min-h-[36px] ${
                  view === v
                    ? 'bg-[#1e3a5a] text-[#c9a87c] shadow-sm'
                    : 'text-[#1e3a5a]/55'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 py-8 justify-center" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {view === 'list' && (
              <div className="flex flex-col gap-3">
                {launches.map(launch => (
                  <LaunchListItem key={launch.id} launch={launch} onClick={() => setSelectedLaunch(launch)} />
                ))}
              </div>
            )}

            {view === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {launches.map(launch => (
                  <LaunchGridCard key={launch.id} launch={launch} onClick={() => setSelectedLaunch(launch)} />
                ))}
              </div>
            )}

            {view === 'calendar' && (
              <LaunchCalendarView launches={launches} onSelectLaunch={setSelectedLaunch} />
            )}

            {view !== 'calendar' && hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="min-h-[44px] px-8 font-semibold bg-[#1e3a5a] text-[#c9a87c] hover:bg-[#1e3a5a]/90"
                >
                  {isLoadingMore ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</> : 'Load More'}
                </Button>
              </div>
            )}

            <p className="text-center text-xs mt-6 text-[#1e3a5a]/35">
              Data provided by{' '}
              <a href="https://thespacedevs.com" target="_blank" rel="noopener noreferrer"
                className="underline hover:opacity-80 text-[#4a90b8]">
                TheSpaceDevs
              </a>
            </p>
          </>
        )}
      </main>

      <LaunchDetailModal launch={selectedLaunch} onClose={() => setSelectedLaunch(null)} />
    </div>
  );
}