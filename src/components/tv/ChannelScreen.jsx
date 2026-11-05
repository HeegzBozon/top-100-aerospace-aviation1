import HouseChannel from '@/components/tv/HouseChannel';
import NewsroomChannel from '@/components/tv/NewsroomChannel';
import ReservedChannel from '@/components/tv/ReservedChannel';
import { dialNumber } from '@/components/tv/tvChannels';

// The set itself: a moulded bezel with the marquee across its head naming what is on, and
// the glass below it carrying whatever the tuned channel puts there.
export default function ChannelScreen({ channel }) {
  return (
    <div className="tv-set">
      <div className="tv-marquee">
        <span className="tv-lamp" data-on="true" aria-hidden="true" />
        <span className="tv-marquee-number">{dialNumber(channel.number)}</span>
        <span className="tv-marquee-name">{channel.name}</span>
        <span className="tv-marquee-seam" aria-hidden="true" />
        <span className="tv-marquee-dial">{channel.dial}</span>
      </div>

      <div className="tv-glass">
        {channel.kind === 'youtube' && <HouseChannel channel={channel} />}
        {channel.kind === 'live' && <NewsroomChannel />}
        {channel.kind === 'reserved' && <ReservedChannel channel={channel} />}
      </div>
    </div>
  );
}