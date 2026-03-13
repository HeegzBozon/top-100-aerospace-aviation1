import React, { useEffect, useState } from 'react';
import { Rocket, Clock, MapPin, ChevronRight, Loader2, AlertCircle, Radio } from 'lucide-react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import LaunchDetailModal from './LaunchDetailModal';

function LaunchCard({ launch, onClick }) {
  const launchDate = launch.net ? parseISO(launch.net) : null;
  const providerName = launch.launch_service_provider?.name || null;
  const padName = launch.pad?.name || '';
  const locationName = launch.pad?.location?.name || '';
  const imageUrl = launch.image?.image_url || launch.rocket?.configuration?.image_url || null;
  const statusName = launch.status?.name || 'TBD';
  const isGo = launch.status?.abbrev === 'Go';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex-shrink-0 w-64 sm:w-72 rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 snap-start cursor-pointer"
      aria-label={`View details for ${launch.name}`}
    >
      {/* Image */}
      <div className="relative h-36 bg-slate-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={launch.name}
            className="w-full h-full object-cover opacity-80"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-10 h-10 text-slate-400" />
          </div>
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isGo
              ? 'bg-green-500 text-white'
              : 'bg-slate-600 text-slate-200'
          }`}
        >
          {statusName}
        </span>
        {/* Stream available indicator */}
        {launch.vidURLs?.length > 0 && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <Radio className="w-2.5 h-2.5" />
            STREAM
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {providerName && <p className="text-xs font-medium text-indigo-600 truncate">{providerName}</p>}
        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{launch.name}</h3>

        {launchDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <time dateTime={launch.net}>
              {format(launchDate, 'MMM d, yyyy · HH:mm')} UTC
            </time>
          </div>
        )}

        {(padName || locationName) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{padName || locationName}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function UpcomingLaunchesSection() {
  const [launches, setLaunches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLaunch, setSelectedLaunch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLaunches = async () => {
      try {
        const res = await getUpcomingLaunches({ limit: 10, offset: 0 });
        if (!cancelled) {
          setLaunches(res.data?.launches || []);
        }
      } catch (err) {
        if (!cancelled) setError('Could not load upcoming launches.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchLaunches();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-6 px-4" aria-labelledby="launches-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          <h2 id="launches-heading" className="text-base font-bold text-gray-900">
            Upcoming Rocket Launches
          </h2>
        </div>
        <Link
          to={createPageUrl('LaunchParty')}
          className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium min-h-[44px] items-center"
          aria-label="View all upcoming rocket launches"
        >
          View all <ChevronRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center h-40" role="status" aria-live="polite">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="sr-only">Loading upcoming launches...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-red-500 py-4" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!isLoading && !error && launches.length === 0 && (
        <p className="text-sm text-gray-400 py-4">No upcoming launches found.</p>
      )}

      {/* Horizontal scroll list */}
      {!isLoading && !error && launches.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          role="list"
          aria-label="Upcoming rocket launches"
        >
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} onClick={() => setSelectedLaunch(launch)} />
          ))}
        </div>
      )}

      <LaunchDetailModal launch={selectedLaunch} onClose={() => setSelectedLaunch(null)} />

      {/* Attribution */}
      {!isLoading && !error && launches.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          Data via{' '}
          <a
            href="https://thespacedevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            TheSpaceDevs
          </a>
        </p>
      )}
    </section>
  );
}