import { C } from '@/components/crm/crmConfig';

// An edition standing on the rack. A published cover prints as it was made; an edition
// with no cover of its own is set as a typographic plate, so nothing on the rack is ever a
// grey box. The plate catches the light down one edge the way a real cover does.
export default function NewsstandCover({ item, focused = false, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — ${item.meta || item.kicker}`}
      className="group block w-full text-left"
    >
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-[3px]"
        style={{
          background: C.navy,
          border: `1px solid ${item.cover ? 'rgba(30,58,90,0.18)' : 'rgba(30,58,90,0.35)'}`,
          boxShadow: focused
            ? `0 0 0 2px ${C.copper}, 0 16px 30px rgba(30,58,90,0.22)`
            : '0 10px 22px rgba(30,58,90,0.16)',
          transition: 'box-shadow 200ms ease',
        }}
      >
        {item.cover ? (
          <img
            src={item.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full flex-col justify-between p-3">
            <span className="block">
              <span className="block h-px w-6" style={{ background: C.copper }} />
              <span className="mt-2 block text-[6.5px] font-bold uppercase tracking-[0.24em] text-editorial-cream/55">
                TOP 100
              </span>
            </span>
            <span className="block">
              <span className="block font-heading text-[12.5px] leading-[1.08] text-editorial-cream line-clamp-3">
                {item.title}
              </span>
              {item.subtitle ? (
                <span className="mt-1.5 block text-[6.5px] italic leading-snug" style={{ color: C.gold }}>
                  {item.subtitle}
                </span>
              ) : null}
            </span>
            <span className="block text-[6px] font-bold uppercase tracking-[0.2em] text-editorial-cream/40">
              {item.foot}
            </span>
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              'inset 0 0 0 1px rgba(250,248,245,0.16), inset -16px 0 26px -20px rgba(0,0,0,0.65)',
          }}
        />
      </div>

      <p className="mt-2 text-[7.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
        {item.kicker}
      </p>
      <p className="mt-1 font-heading text-[13.5px] leading-snug" style={{ color: C.navy }}>
        {item.title}
      </p>
      {item.meta ? (
        <p className="mt-0.5 text-[9px]" style={{ color: C.muted }}>
          {item.meta}
        </p>
      ) : null}
    </button>
  );
}