import useHonoreeVolumes from '@/hooks/useHonoreeVolumes';
import HonoreeChip from '@/components/voting/HonoreeChip';

// The archived volumes a candidate is on the record for, wherever a card shows them: the
// same chips, read from the same archive, at the scale the surface can carry them.
export default function HonoreeChips({ nominee, size = 'sm', max, className = '' }) {
  const volumes = useHonoreeVolumes(nominee);
  const shown = max ? volumes.slice(0, max) : volumes;
  if (shown.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {shown.map((volume) => (
        <HonoreeChip key={volume.seasonId} volume={volume} size={size} />
      ))}
    </div>
  );
}