import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Rocket, MapPin, ExternalLink, Newspaper, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getSpaceNews } from '@/functions/getSpaceNews';
import SpaceNewsCard from '@/components/space/SpaceNewsCard';
import LaunchLiveStream from './LaunchLiveStream';
import LaunchDateTime from '@/components/launches/LaunchDateTime';

export default function LaunchDetailModal({ launch, onClose }) {
  const [relatedNews, setRelatedNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (!launch?.id) return;
    let cancelled = false;
    setRelatedNews([]);
    setNewsLoading(true);

    // Build a contextual search term from launch name → fallback to rocket name → provider
    const launchName = launch.name || '';
    const rocketConf = launch.rocket?.configuration;
    const rocketSearch = rocketConf?.full_name || rocketConf?.name || '';
    const provider = launch.launch_service_provider?.name || '';

    // Strip flight numbers / pipe characters to get the core vehicle/mission name
    const primaryTerm = launchName.split('|')[0]?.split('(')[0]?.trim() || rocketSearch;

    const tryFetch = (searchTerm) =>
      getSpaceNews({ search: searchTerm, type: 'articles', limit: 3, ordering: '-published_at' })
        .then(res => res.data?.results || []);

    tryFetch(primaryTerm)
      .then(async results => {
        if (!cancelled && results.length > 0) return results;
        // Fallback 1: rocket name
        if (rocketSearch && rocketSearch !== primaryTerm) {
          const r = await tryFetch(rocketSearch);
          if (!cancelled && r.length > 0) return r;
        }
        // Fallback 2: provider name
        if (provider) {
          return tryFetch(provider);
        }
        return [];
      })
      .then(results => { if (!cancelled) setRelatedNews(results); })
      .finally(() => { if (!cancelled) setNewsLoading(false); });

    return () => { cancelled = true; };
  }, [launch?.id]);

  if (!launch) return null;

  const launchDate = launch.net ? parseISO(launch.net) : null;
  const providerName = launch.launch_service_provider?.name || null;
  const providerUrl = launch.launch_service_provider?.url || null;
  const padName = launch.pad?.name || '';
  const locationName = launch.pad?.location?.name || '';
  const imageUrl = launch.image?.image_url || null;
  const statusName = launch.status?.name || 'TBD';
  const isGo = launch.status?.abbrev === 'Go';
  const missionDesc = launch.mission?.description || null;
  const missionType = launch.mission?.type || null;
  const rocketName = launch.rocket?.configuration?.full_name || launch.rocket?.configuration?.name || null;
  const windowStart = launch.window_start ? parseISO(launch.window_start) : null;
  const windowEnd = launch.window_end ? parseISO(launch.window_end) : null;

  return (
    <Dialog open={!!launch} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Hero image — fixed, does not scroll */}
        <div className="relative h-48 bg-slate-800 flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={launch.name} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Rocket className="w-14 h-14 text-slate-500" />
            </div>
          )}
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isGo ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-200'
            }`}
          >
            {statusName}
          </span>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <DialogHeader>
            {providerName && (
              <p className="text-xs font-semibold text-indigo-600">{providerName}</p>
            )}
            <DialogTitle className="text-base font-bold text-gray-900 leading-snug">
              {launch.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {rocketName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Rocket className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{rocketName}</span>
              </div>
            )}

            <LaunchDateTime isoString={launch.net} />

            {windowStart && windowEnd && (
              <p className="text-xs text-gray-400 pl-5">
                Window: {format(windowStart, 'HH:mm')} – {format(windowEnd, 'HH:mm')} UTC
              </p>
            )}

            {(padName || locationName) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{[padName, locationName].filter(Boolean).join(' · ')}</span>
              </div>
            )}

            {missionType && (
              <div className="pt-1">
                <Badge variant="secondary" className="text-xs">{missionType}</Badge>
              </div>
            )}
          </div>

          {missionDesc && (
            <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {missionDesc}
            </p>
          )}

          {launch.url && (
            <a
              href={launch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium pt-1"
            >
              View on TheSpaceDevs <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Live Watch */}
          <LaunchLiveStream vidURLs={launch.vidURLs} netIso={launch.net} />

          {/* Related News */}
          {(newsLoading || relatedNews.length > 0) && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Related News</h4>
              </div>
              {newsLoading ? (
                <div className="flex items-center justify-center h-16" role="status" aria-live="polite">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="sr-only">Loading related news...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {relatedNews.map(article => (
                    <SpaceNewsCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}