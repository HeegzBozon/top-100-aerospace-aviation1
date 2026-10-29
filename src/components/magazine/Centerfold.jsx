import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The centerfold: one picture let out to the trim, with the edition's line held in a
// band beneath it. It is the only page in the book that sets no column of type beside
// the image — a held breath between the opening ten and the field chapters after it.
export default function Centerfold({ blocks = [], imageUrl, pageNumber, totalPages }) {
  const kicker = blocks.find((b) => b.type === 'kicker');
  const heading = blocks.find((b) => b.type === 'heading');
  const byline = blocks.find((b) => b.type === 'byline');
  const body = blocks.find((b) => b.type === 'body');
  const caption = blocks.find((b) => b.type === 'image')?.caption;
  const url = imageUrl || blocks.find((b) => b.type === 'image' && b.url)?.url;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: P.navyVoid }}>
      {url ? (
        <img
          src={url}
          alt={heading?.text || ''}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 34%' }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 100% at 50% 20%, ${P.navy} 0%, ${P.navyVoid} 100%)` }}
        />
      )}

      {/* The plate is closed on three sides by a hairline, the way a folded sheet is
          trimmed inside the trim: the band beneath it is the sheet's own foot. */}
      <div
        className="pointer-events-none absolute"
        style={{ inset: '10px 10px 46%', border: `1px solid ${P.gold}3D` }}
      />

      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-10 sm:px-8 sm:pb-5"
        style={{ background: 'linear-gradient(180deg, rgba(7,15,31,0) 0%, rgba(7,15,31,0.82) 46%, rgba(7,15,31,0.96) 100%)' }}
      >
        {kicker?.text && (
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.4em]" style={{ color: P.gold }}>
            {kicker.text}
          </p>
        )}
        {heading?.text && (
          <h2 className="font-serif text-xl leading-tight sm:text-2xl" style={{ color: P.cream }}>
            {heading.text}
          </h2>
        )}
        {byline?.text && (
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.24em]" style={{ color: `${P.gold}CC` }}>
            {byline.text}
          </p>
        )}
        {body?.text && (
          <p className="mt-3 max-w-[46ch] text-[11px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.7)' }}>
            {body.text}
          </p>
        )}
        {caption && (
          <p className="mt-3 text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(250,248,245,0.42)' }}>
            {caption}
          </p>
        )}
      </div>

      <span
        className="absolute right-4 top-3 font-mono text-[9px]"
        style={{ color: 'rgba(250,248,245,0.55)' }}
      >
        {String(pageNumber).padStart(2, '0')}
        <span style={{ opacity: 0.5 }}>/{String(totalPages).padStart(2, '0')}</span>
      </span>
    </div>
  );
}