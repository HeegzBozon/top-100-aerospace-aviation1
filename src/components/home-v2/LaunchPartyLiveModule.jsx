import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ExternalLink, Loader2, Radio, Rocket } from 'lucide-react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { findLaunchStream } from '@/functions/findLaunchStream';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtube.com')) return parsedUrl.searchParams.get('v');
    if (parsedUrl.hostname === 'youtu.be') return parsedUrl.pathname.slice(1).split('?')[0];
  } catch {
    return null;
  }
  return null;
}

function getLaunchImage(launch) {
  if (!launch?.image) return null;
  return typeof launch.image === 'string' ? launch.image : launch.image.image_url;
}

function MissionRow({ launch }) {
  const date = launch?.net ? format(parseISO(launch.net), 'MMM d · h:mm a') : 'Time TBD';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
        {getLaunchImage(launch) ? (
          <img src={getLaunchImage(launch)} alt="" className="h-full w-full object-cover opacity-80" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Rocket className="h-5 w-5 text-[#c9a87c]" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{launch.name}</p>
        <p className="text-xs text-white/45">{date}</p>
      </div>
    </div>
  );
}

export default function LaunchPartyLiveModule() {
  const [launches, setLaunches] = useState([]);
  const [youtubeId, setYoutubeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const nextLaunch = launches[0];
  const upcomingMissions = useMemo(() => launches.slice(1, 4), [launches]);

  useEffect(() => {
    getUpcomingLaunches({ limit: 4 })
      .then((res) => setLaunches(res?.data?.launches || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!nextLaunch) return;

    const launchStreamId = (nextLaunch.vidURLs || [])
      .map((stream) => extractYouTubeId(stream?.url || stream))
      .find(Boolean);

    if (launchStreamId) {
      setYoutubeId(launchStreamId);
      return;
    }

    findLaunchStream({
      launchId: nextLaunch.id,
      launchName: nextLaunch.mission?.name || nextLaunch.name,
      provider: nextLaunch.launch_service_provider?.name || '',
    }).then((res) => {
      const streamId = extractYouTubeId(res?.data?.url);
      if (streamId) setYoutubeId(streamId);
    });
  }, [nextLaunch]);

  if (loading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center rounded-2xl border-[#4a90b8]/20 bg-[#0a1526]">
        <Loader2 className="h-8 w-8 animate-spin text-[#c9a87c]" />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="relative overflow-hidden rounded-2xl border-[#4a90b8]/20 bg-black shadow-xl lg:col-span-3">
        <div className="aspect-video">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title="TOP 100 Launch Party Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="relative h-full w-full">
              {getLaunchImage(nextLaunch) && (
                <img src={getLaunchImage(nextLaunch)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1526]/95 via-[#1e3a5a]/80 to-black/80" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
                <Radio className="mb-3 h-10 w-10 text-[#c9a87c]" />
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#c9a87c]">Launch Party Live</p>
                <h3 className="mt-2 text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Stream coming soon
                </h3>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Launch Party
        </div>
      </Card>

      <Card className="rounded-2xl border-[#4a90b8]/20 bg-[#0a1526] p-5 text-white lg:col-span-2">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#c9a87c]">Upcoming Missions</p>
        <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Next on the launch calendar
        </h3>
        <div className="space-y-3">
          {upcomingMissions.map((launch) => (
            <MissionRow key={launch.id} launch={launch} />
          ))}
        </div>
        <Link to="/LaunchParty">
          <Button className="mt-5 w-full rounded-full bg-[#c9a87c] font-bold text-[#0a1526] hover:bg-[#b09268]">
            Open Launch Party <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}