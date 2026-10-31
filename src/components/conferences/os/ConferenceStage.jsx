// The plate the conferences machine opens on. A navy stage lit from above, a fine
// field of stars, one slow arc of copper turning over it, and a horizon rule that
// sets the instrument band apart from the reading. Purely atmospheric — it says
// nothing and measures nothing — and the sweep is a single transform that stops for
// a reader who asks for reduced motion.
export default function ConferenceStage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(128% 96% at 50% 0%, #274a72 0%, #17314f 44%, #0a1626 100%)' }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(250, 248, 245, 0.65) 0.5px, transparent 1px)',
          backgroundSize: '29px 29px',
          opacity: 0.2,
        }}
      />

      {/* The arc. A wrapper holds it centred; only the plate inside turns. */}
      <div className="absolute left-1/2 top-1/2 h-[132vmax] w-[132vmax] -translate-x-1/2 -translate-y-1/2">
        <div
          className="cfs-orbit h-full w-full rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(201,168,124,0) 0deg, rgba(201,168,124,0.16) 26deg, rgba(201,168,124,0) 62deg, rgba(201,168,124,0) 360deg)',
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-[38%] h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.42), transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: 'linear-gradient(180deg, rgba(5,11,20,0) 0%, rgba(5,11,20,0.66) 100%)' }}
      />
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 130px rgba(4,9,17,0.6)' }} />
    </div>
  );
}