import { Antenna } from 'lucide-react';
import { dialNumber } from '@/components/tv/tvChannels';

// A slot on the dial with nothing on it yet. The set says so plainly rather than showing
// static: the number is held, and the line explains what will take it.
export default function ReservedChannel({ channel }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center md:min-h-[400px]">
      <span className="tv-reserved-mark">
        <Antenna className="h-5 w-5" />
      </span>
      <p className="tv-kicker mt-4">Channel {dialNumber(channel.number)}</p>
      <h2 className="mt-2 font-heading text-xl md:text-2xl" style={{ color: '#f4efe6' }}>
        Nothing on this one yet.
      </h2>
      <p className="mt-3 max-w-md text-[12.5px] leading-relaxed" style={{ color: '#9fb3c6' }}>
        {channel.note}
      </p>
    </div>
  );
}