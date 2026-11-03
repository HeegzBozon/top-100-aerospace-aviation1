import { useEffect, useMemo, useState } from 'react';
import { findLaunchStream } from '@/functions/findLaunchStream';
import { fromYouTube } from './theatreConfig';

// The stream for the mission on the pad: whatever the feed already carries, otherwise a
// search for the provider's own broadcast.
export default function useTheatreStream(launch) {
  const fromFeed = useMemo(
    () => (launch?.vidURLs || []).map((v) => fromYouTube(v?.url)).find(Boolean) || null,
    [launch],
  );
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setFound(null);
    if (!launch?.id || fromFeed) return undefined;
    let live = true;
    setSearching(true);
    findLaunchStream({
      launchId: launch.id,
      launchName: launch.mission?.name || launch.name,
      provider: launch.launch_service_provider?.name || '',
    })
      .then((res) => {
        const url = res?.data?.url;
        if (live && url) setFound(fromYouTube(url));
      })
      .catch(() => {})
      .finally(() => {
        if (live) setSearching(false);
      });
    return () => {
      live = false;
    };
  }, [launch?.id, fromFeed]);

  return { streamId: fromFeed || found, searching };
}