import { Gamepad2, Layers, Plane, Rocket, Shield, Sparkles, Trophy } from 'lucide-react';
import { ARCADE_BADGES, earnedIds } from './arcadeProgress';

const ICONS = { gamepad: Gamepad2, shield: Shield, rocket: Rocket, trophy: Trophy, layers: Layers, plane: Plane, sparkle: Sparkles };

// THE CABINET BADGES, as they are worn.
//
// Unstruck badges stay on the plate as outlined plates with their name showing — vacancy is
// what invites the next visit. Nothing here is counted toward a Fellow's record.
export default function ArcadeBadges({ progress }) {
  const got = earnedIds(progress);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="pd-label text-editorial-gold/80">Cabinet Badges</p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-editorial-cream/45">
          {got.length}/{ARCADE_BADGES.length}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {ARCADE_BADGES.map((b) => {
          const Icon = ICONS[b.icon] || Trophy;
          const on = got.includes(b.id);
          return (
            <div key={b.id} className="flex flex-col items-center gap-1 text-center" title={b.blurb}>
              <span
                className={`flex aspect-square w-full items-center justify-center rounded-full border ${
                  on
                    ? 'border-editorial-gold bg-gradient-to-br from-editorial-gold/40 to-editorial-copper/30 text-editorial-cream shadow-[0_0_10px_rgba(201,168,124,0.55)]'
                    : 'border-dashed border-editorial-cream/20 text-editorial-cream/20'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className={`text-[8.5px] uppercase leading-tight tracking-[0.1em] ${on ? 'text-editorial-cream/75' : 'text-editorial-cream/35'}`}>
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-editorial-cream/45">
        Cabinet badges are struck at the machines and kept on this device, the way a house record is. They are never
        counted toward a Fellow's record or the platform's measurement.
      </p>
    </div>
  );
}