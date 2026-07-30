import { Star } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function HubEnergyTracker({ count }) {
  const filledStars = Math.min(5, Math.max(count > 0 ? 1 : 0, Math.ceil(count / 2)));

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={{ background: 'white', border: `1px solid ${brand.navy}10` }}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>
          Hub Energy
        </p>
        <p className="text-sm font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {count} {count === 1 ? 'nomination' : 'nominations'} collected
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-5 h-5"
            style={{
              color: i < filledStars ? brand.gold : `${brand.navy}15`,
              fill: i < filledStars ? brand.gold : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  );
}