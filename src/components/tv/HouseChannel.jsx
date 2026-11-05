import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Youtube } from 'lucide-react';
import useHouseChannel from '@/components/tv/useHouseChannel';

const aired = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// The house's own channel: what it last put out, played on the set, with the rest of the
// recent run laid underneath so a viewer can pick a different one. Reading a channel is a
// real fetch over the wire, so the three states are drawn rather than implied — tuning,
// off the air, and nothing aired yet.
export default function HouseChannel({ channel }) {
  const { channel: info, videos, isLoading, error, reload } = useHouseChannel(channel);
  const [chosenId, setChosenId] = useState(null);

  // A fresh read settles on the newest upload — the channel plays itself from the top.
  useEffect(() => {
    setChosenId(videos[0]?.id || null);
  }, [videos[0]?.id]);

  const playing = videos.find((video) => video.id === chosenId) || videos[0] || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-16 md:min-h-[400px]">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#c9a87c' }} />
        <p className="tv-kicker">Tuning the house channel</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-14 text-center md:min-h-[400px]">
        <p className="tv-kicker">Off the air</p>
        <h2 className="mt-2 font-heading text-xl" style={{ color: '#f4efe6' }}>
          The channel could not be tuned.
        </h2>
        <p className="mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: '#9fb3c6' }}>
          {error.message || 'The set did not reach the channel. It is usually a moment’s trouble with the feed.'}
        </p>
        <button type="button" onClick={() => reload()} className="tv-step mt-4">
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-14 text-center md:min-h-[400px]">
        <p className="tv-kicker">Standing by</p>
        <h2 className="mt-2 font-heading text-xl" style={{ color: '#f4efe6' }}>
          Nothing has aired yet.
        </h2>
        <p className="mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: '#9fb3c6' }}>
          The channel is open and has no uploads on it. The first one will be here the moment it goes out.
        </p>
        {info?.url && (
          <a href={info.url} target="_blank" rel="noopener noreferrer" className="tv-step mt-4">
            <Youtube className="h-3 w-3" /> Open the channel
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4">
      <div className="relative overflow-hidden rounded-[4px]" style={{ aspectRatio: '16 / 9', background: '#050b12' }}>
        <iframe
          key={playing.id}
          src={`https://www.youtube.com/embed/${playing.id}?rel=0&modestbranding=1`}
          title={playing.title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold leading-snug" style={{ color: '#f4efe6' }}>
            {playing.title}
          </h2>
          <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: '#8ba0b4' }}>
            {info?.title || channel.name}
            {playing.published_at ? ` · aired ${aired(playing.published_at)}` : ''}
          </p>
        </div>
        <a
          href={playing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tv-step shrink-0"
        >
          <Youtube className="h-3 w-3" /> Watch on YouTube
        </a>
      </div>

      {videos.length > 1 && (
        <div className="mt-3">
          <p className="tv-kicker">Latest uploads</p>
          <div className="mt-1.5 grid grid-cols-1 gap-1 md:grid-cols-2">
            {videos.map((video) => {
              const current = video.id === playing.id;
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setChosenId(video.id)}
                  aria-pressed={current}
                  className={`tv-upload ${current ? 'is-playing' : ''}`}
                >
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt="" loading="lazy" className="tv-upload-thumb" />
                  ) : (
                    <span className="tv-upload-thumb" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="tv-upload-title">{video.title}</span>
                    <span className="tv-upload-date">{aired(video.published_at)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}