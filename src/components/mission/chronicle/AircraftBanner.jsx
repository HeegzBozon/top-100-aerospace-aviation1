import { aircraftByKey, nextAircraft, SCENE_IMAGE, XP_TOTAL } from './missionConfig';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The hangar header: the airframe the Fellow chose, and how far along the season's
// path they stand. The backdrop is the field at night; the sprite is theirs. Both are
// cosmetic — the meter counts steps taken, never standing.
export default function AircraftBanner({ chronicle, xp, doneCount, total }) {
  const craft = aircraftByKey(chronicle?.aircraft_key);
  const next = nextAircraft(xp);
  const share = XP_TOTAL ? Math.min(100, Math.round((xp / (next ? next.unlockXp : XP_TOTAL)) * 100)) : 0;

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl" style={{ background: B.navyDeep }}>
      <img src={SCENE_IMAGE} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(22,41,63,0.55) 0%, rgba(22,41,63,0.88) 100%)' }}
      />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5">
        {craft ? (
          <img
            src={craft.image}
            alt={`${craft.name}, ${craft.role}`}
            className="h-24 w-24 flex-none rounded-xl object-cover"
            style={{ imageRendering: 'pixelated', border: '1px solid rgba(250,248,245,0.18)' }}
          />
        ) : (
          <div
            className="flex h-24 w-24 flex-none items-center justify-center rounded-xl text-center text-[8px] font-bold uppercase tracking-[0.2em]"
            style={{ border: '1px dashed rgba(250,248,245,0.3)', color: 'rgba(250,248,245,0.55)' }}
          >
            No airframe yet
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
            {craft ? craft.role : 'The hangar'}
          </p>
          <h2 className="mt-1 font-heading text-xl text-editorial-cream md:text-2xl">
            {craft ? craft.name : 'Take an airframe'}
          </h2>
          <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.66)' }}>
            {craft ? craft.note : 'Every Fellow starts with one. The hangar is the first chapter.'}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.22em]">
              <span style={{ color: 'rgba(250,248,245,0.62)' }}>
                {String(doneCount).padStart(2, '0')}/{String(total).padStart(2, '0')} steps · {xp} xp
              </span>
              {next ? (
                <span style={{ color: B.gold }}>
                  {next.name} at {next.unlockXp} xp
                </span>
              ) : (
                <span style={{ color: B.gold }}>All airframes held</span>
              )}
            </div>
            <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full" style={{ background: 'rgba(250,248,245,0.18)' }}>
              <span
                className="block h-full rounded-full transition-all"
                style={{ width: `${share}%`, background: B.gold }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}