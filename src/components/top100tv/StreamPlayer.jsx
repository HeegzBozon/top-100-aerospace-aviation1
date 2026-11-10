import { ExternalLink, Radio } from 'lucide-react';
import RobustYouTubePlayer from '@/components/video/RobustYouTubePlayer';
import SponsorOverlay from '@/components/top100tv/SponsorOverlay';

// One channel, played. The resolver hands over the broadcast it found — or, when a channel
// is between broadcasts, the channel itself, which still opens on its own live window. Only
// a channel that could not be identified at all falls through to the dark plate.
export default function StreamPlayer({ stream, onError }) {
  if (!stream) return null;

  const playable = stream.video_id || stream.channel_id;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {playable ? (
        <RobustYouTubePlayer
          videoId={stream.video_id || null}
          channelId={stream.video_id ? null : stream.channel_id}
          title={stream.title}
          height="100%"
          onError={onError}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <Radio className="h-7 w-7 text-editorial-cream/30" />
          <p className="font-heading text-lg text-editorial-cream/80">Signal not carried</p>
          <p className="max-w-sm text-xs leading-relaxed text-editorial-cream/45">
            This channel could not be identified, so nothing is being pulled from it. The
            desk is told, and the square returns as soon as the source is filed again.
          </p>
          {stream.watch_url && (
            <a
              href={stream.watch_url}
              target="_blank"
              rel="noopener noreferrer"
              className="desk-key"
            >
              <ExternalLink className="h-3 w-3" />
              Open the channel
            </a>
          )}
        </div>
      )}

      <SponsorOverlay
        sponsorship={stream.sponsorship}
        position={stream.sponsorship?.overlay_position || 'bottom-left'}
      />
    </div>
  );
}