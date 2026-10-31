import { qrSrc } from '@/lib/publicCard';

// The badge, worn.
//
// One face of an object a Fellow holds up in a corridor: the band says which room they
// are standing in, the plate carries their name cut into it, and the code hands the card
// over without a tap. Everything printed here comes from the plate template — a stock, a
// band, one machined rule — so the badge is never assembled from loose colours.

const LABEL = 'font-body text-[7.5px] font-bold uppercase tracking-[0.26em]';

const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();

export default function BadgeFront({ person, template, qrLink, qrTitle, qrNote, showQr = true, year }) {
  const t = template;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[18px]"
      style={{
        background: t.stock,
        boxShadow: `inset 0 0 0 1px ${t.edge}, inset 0 1px 0 rgba(255,255,255,0.18), 0 34px 60px -34px rgba(3,8,15,0.95)`,
      }}
    >
      {/* Moulded grain: fine, at the edge of reading, the way real stock catches light. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${t.grain} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${t.grain} 0 1px, transparent 1px 4px)`,
          opacity: 0.6,
        }}
      />

      {/* The slot the lanyard passes through, cut into the stock. */}
      <div className="relative flex justify-center pt-3">
        <div
          className="h-[6px] w-12 rounded-full"
          style={{ background: 'rgba(3,8,15,0.55)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.72)' }}
        />
      </div>

      {/* The band: the room this badge is worn in. */}
      <div
        className="relative mx-3 mt-2 rounded-[6px] px-3 py-2"
        style={{
          background: t.band,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 ${t.ruleSoft}`,
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className={LABEL} style={{ color: t.rule }}>
            TOP 100
          </p>
          <p className={`${LABEL} truncate`} style={{ color: 'rgba(250,248,245,0.66)' }}>
            Aerospace &amp; Aviation
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div
          className="h-[86px] w-[86px] rounded-full"
          style={{ boxShadow: `0 0 0 1px ${t.ruleSoft}, 0 16px 28px -18px rgba(3,8,15,0.95)` }}
        >
          {person?.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center rounded-full font-heading text-[30px]"
              style={{ background: t.plate, color: t.dark ? '#1E3A5A' : t.ink }}
            >
              {initialsOf(person?.name) || 'F'}
            </span>
          )}
        </div>

        <h1
          className="mt-3 max-w-[16rem] font-heading text-[25px] leading-[1.1]"
          style={{ color: t.ink, textShadow: t.engrave }}
        >
          {person?.name || 'A Fellow'}
        </h1>

        {person?.role ? (
          <p
            className="mt-1.5 max-w-[16rem] font-body text-[9px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: t.inkSoft }}
          >
            {person.role}
          </p>
        ) : null}

        {person?.org ? (
          <p className="mt-1 max-w-[16rem] font-body text-[11px]" style={{ color: t.ink }}>
            {person.org}
          </p>
        ) : null}

        {person?.place ? (
          <p className={`${LABEL} mt-2`} style={{ color: t.inkSoft }}>
            {person.place}
          </p>
        ) : null}
      </div>

      {showQr && qrLink ? (
        <div
          className="relative mx-3 mb-2 flex items-center gap-3 rounded-[8px] px-3 py-2"
          style={{ background: t.plate, boxShadow: `inset 0 0 0 1px ${t.ruleSoft}` }}
        >
          <img src={qrSrc(qrLink, 260, 1)} alt="Scan to open" className="h-[58px] w-[58px] shrink-0" />
          <div className="min-w-0">
            <p className="font-body text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: '#1E3A5A' }}>
              {qrTitle || 'Scan to connect'}
            </p>
            <p className="mt-0.5 truncate font-body text-[9.5px]" style={{ color: 'rgba(30,58,90,0.62)' }}>
              {qrNote || 'The card saves as a contact'}
            </p>
          </div>
        </div>
      ) : null}

      <div className="relative flex items-center justify-between px-4 pb-3">
        <p className={LABEL} style={{ color: t.inkSoft }}>
          {person?.seat || 'Fellow'}
        </p>
        <p className={LABEL} style={{ color: t.inkSoft }}>
          {year}
        </p>
      </div>
    </div>
  );
}