import { qrSrc } from '@/lib/publicCard';

// ── The boarding pass ──
//
// The flavour carried to a desk, printed as the thing it is named for: a carrier band across
// the head, the passenger and their portrait, a matrix of the details the record holds, then
// the perforation — cut with two notches — and the stub the code is torn off with. Every line
// is drawn from the record already held.
const LABEL = 'font-body text-[7.5px] font-bold uppercase tracking-[0.22em]';
const VALUE = 'mt-1 truncate font-body text-[9.5px] font-bold uppercase tracking-[0.09em]';

const initialsOf = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

// A notch torn out of the stock: a disc the colour of the paper the pass sits on, half of it
// clipped away by the edge of the plate.
function Notch({ side }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-editorial-cream ${
        side === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
      }`}
    />
  );
}

export default function CredentialPass({ person, template, code, rows, hasExisting, year }) {
  const cells = rows.slice(0, 4);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[12px]"
      style={{
        background: template.stock,
        boxShadow: `inset 0 0 0 1px ${template.edge}, 0 26px 50px -32px rgba(3,8,15,0.9)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${template.grain} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${template.grain} 0 1px, transparent 1px 4px)`,
          opacity: 0.6,
        }}
      />

      {/* The carrier band: who is carrying the record, and what the document is. */}
      <div
        className="relative flex items-start justify-between gap-3 px-4 py-2.5"
        style={{
          background: template.band,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 ${template.ruleSoft}`,
        }}
      >
        <div className="min-w-0">
          <p
            className="font-heading text-[12px] leading-none tracking-[0.18em]"
            style={{ color: template.ink }}
          >
            TOP 100
          </p>
          <p className={`${LABEL} mt-1.5`} style={{ color: 'rgba(250,248,245,0.5)' }}>
            Aerospace &amp; Aviation
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={LABEL} style={{ color: template.rule }}>
            Boarding pass
          </p>
          <p className={`${LABEL} mt-1.5`} style={{ color: 'rgba(250,248,245,0.5)' }}>
            {hasExisting ? 'Returning' : 'First flight'}
          </p>
        </div>
      </div>

      {/* Passenger, and the plate the gate reads them by. */}
      <div className="relative flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <p className={LABEL} style={{ color: template.inkSoft }}>
            Passenger
          </p>
          <p
            className="mt-1 font-heading text-[23px] leading-[1.06]"
            style={{ color: template.ink, textShadow: template.engrave }}
          >
            {person.name || 'Your record is still blank'}
          </p>
          {(person.role || person.org) && (
            <p
              className="mt-2 font-body text-[8px] font-semibold uppercase leading-[1.6] tracking-[0.16em]"
              style={{ color: template.inkSoft }}
            >
              {[person.role, person.org].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div
          className="h-[54px] w-[43px] shrink-0 overflow-hidden rounded-[3px]"
          style={{ boxShadow: `inset 0 0 0 1px ${template.ruleSoft}` }}
        >
          {person.portrait ? (
            <img src={person.portrait} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="grid h-full w-full place-items-center font-heading text-[17px]"
              style={{ background: template.plate, color: '#1E3A5A' }}
            >
              {initialsOf(person.name) || '—'}
            </span>
          )}
        </div>
      </div>

      {/* The matrix: each detail in its own ruled cell, the way a pass prints them. */}
      {cells.length > 0 && (
        <dl
          className="relative mt-3.5 grid grid-cols-2"
          style={{ borderTop: `1px solid ${template.ruleSoft}` }}
        >
          {cells.map((row, i) => (
            <div
              key={row.label}
              className="min-w-0 px-4 py-2"
              style={{
                borderBottom: `1px solid ${template.ruleSoft}`,
                borderLeft: i % 2 === 1 ? `1px solid ${template.ruleSoft}` : undefined,
              }}
            >
              <dt className={LABEL} style={{ color: template.inkSoft }}>
                {row.label}
              </dt>
              <dd className={VALUE} style={{ color: template.ink }}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* The tear: a dashed rule running edge to edge, notched out of the stock. */}
      <div className="relative h-3.5" aria-hidden="true">
        <div
          className="absolute inset-x-4 top-1/2"
          style={{ borderTop: `1px dashed ${template.ruleSoft}` }}
        />
        <Notch side="left" />
        <Notch side="right" />
      </div>

      {/* The stub: the code the pass is torn off by, and who it belongs to. */}
      <div className="relative flex items-center gap-3 px-4 pb-3.5 pt-1">
        <div
          className="h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[3px] p-[3px]"
          style={{ background: template.plate }}
        >
          <img
            src={qrSrc(code.link, 232, 1)}
            alt="Scan to open this pass"
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={LABEL} style={{ color: template.inkSoft }}>
              Fellow
            </p>
            <p className={LABEL} style={{ color: template.inkSoft }}>
              Vol {year}
            </p>
          </div>
          <p
            className="mt-1 truncate font-heading text-[15px] leading-tight"
            style={{ color: template.ink }}
          >
            {person.name || '—'}
          </p>
          <p
            className="mt-1.5 truncate font-body text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{ color: template.inkSoft }}
          >
            {code.title}
          </p>
        </div>
      </div>
    </div>
  );
}