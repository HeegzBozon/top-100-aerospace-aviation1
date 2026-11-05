import { dialNumber } from '@/components/tv/tvChannels';

// The guide: every station the set receives, in dial order, with the one being watched
// printed as the key it is standing on. On a desk it stands beside the screen as a column;
// on the glass it lies under it as a strip the thumb walks across.
export default function ChannelGuide({ channels, tunedKey, onTune }) {
  return (
    <section className="tv-guide" aria-label="Channel guide">
      <div className="tv-guide-head">
        <span>Guide</span>
        <span className="tv-guide-count">
          {channels.length} {channels.length === 1 ? 'station' : 'stations'}
        </span>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
        {channels.map((channel) => {
          const tuned = channel.key === tunedKey;
          return (
            <button
              key={channel.key}
              type="button"
              onClick={() => onTune(channel)}
              aria-pressed={tuned}
              className={`tv-key w-[178px] shrink-0 md:w-full ${tuned ? 'is-tuned' : ''}`}
            >
              <span className="tv-key-number">{dialNumber(channel.number)}</span>
              <span className="min-w-0 flex-1">
                <span className="tv-key-name">{channel.name}</span>
                <span className="tv-key-strap">{channel.strap}</span>
              </span>
              <span className="tv-lamp" data-on={tuned ? 'true' : 'false'} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}