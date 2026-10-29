import { MAGAZINE_PALETTE as P, PORTRAIT_FOCUS } from '@/components/magazine/magazineConfig';

const initialsOf = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

// A plate: several faces held on one page, so the run of the hundred has a pulse rather
// than a hundred identical pages. The page reads its own grid from how many faces it
// carries — two stacked, three (one let wide, two beneath), or four in quarters — and the
// dark rules between them are the plate's own gaps, not borders drawn on the pictures.
export default function PortraitPlate({ tiles = [], label, pageNumber, totalPages }) {
  const count = tiles.length;
  const grid =
    count >= 4
      ? { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }
      : count === 3
        ? { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1.35fr 1fr' }
        : { gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr' };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: P.cream }}>
      <div
        className="flex flex-none items-baseline justify-between px-5 pb-2.5 pt-3.5"
        style={{ borderBottom: `1px solid ${P.gold}33` }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.34em]" style={{ color: P.copper }}>
          {label || 'The Index'}
        </span>
        <span className="font-mono text-[9px]" style={{ color: 'rgba(30,58,90,0.38)' }}>
          {String(pageNumber).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-[3px] p-[3px]" style={{ ...grid, background: P.navyDeep }}>
        {tiles.map((tile, i) => (
          <figure
            key={i}
            className="relative min-h-0 overflow-hidden"
            style={i === 0 && count === 3 ? { gridColumn: 'span 2' } : undefined}
          >
            {tile.url ? (
              <img
                src={tile.url}
                alt={tile.name || ''}
                className="absolute inset-0 h-full w-full object-cover"
                style={PORTRAIT_FOCUS}
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `radial-gradient(120% 100% at 50% 10%, ${P.navy} 0%, ${P.navyDeep} 100%)` }}
              >
                <span className="font-serif text-3xl" style={{ color: `${P.gold}77` }}>{initialsOf(tile.name)}</span>
              </div>
            )}
            <div
              className="absolute inset-x-0 bottom-0 px-2.5 pb-2 pt-6"
              style={{ background: 'linear-gradient(180deg, rgba(7,15,31,0) 0%, rgba(7,15,31,0.88) 100%)' }}
            >
              {tile.standing && (
                <p className="text-[7.5px] font-bold uppercase tracking-[0.34em]" style={{ color: P.gold }}>
                  {tile.standing}
                </p>
              )}
              <p className="font-serif text-[13px] leading-tight" style={{ color: P.cream }}>{tile.name}</p>
              {tile.line && (
                <p className="mt-0.5 truncate text-[7.5px] uppercase tracking-[0.14em]" style={{ color: 'rgba(250,248,245,0.66)' }}>
                  {tile.line}
                </p>
              )}
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}