import { ArrowUpRight } from 'lucide-react';
import { MAGAZINE_PALETTE as P, PORTRAIT_FOCUS } from '@/components/magazine/magazineConfig';
import HonoreeLink from '@/components/magazine/HonoreeLink';

// The face page: a portrait let out to the trim, her name set over it in the paper's own
// voice, the standing she holds above it. It is one half of a spread — the words page
// beside it carries her voice — and it is the only place in the book a face takes the
// whole page.
export default function FaceSpread({ blocks = [], imageUrl, pageNumber, totalPages, nomineeId }) {
  const kicker = blocks.find((b) => b.type === 'kicker');
  const heading = blocks.find((b) => b.type === 'heading');
  const byline = blocks.find((b) => b.type === 'byline');
  const caption = blocks.find((b) => b.type === 'image')?.caption;
  const url = imageUrl || blocks.find((b) => b.type === 'image' && b.url)?.url;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: P.navyVoid }}>
      {url ? (
        <img
          src={url}
          alt={heading?.text || ''}
          className="absolute inset-0 h-full w-full object-cover"
          style={PORTRAIT_FOCUS}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 96% at 50% 12%, ${P.navy} 0%, ${P.navyVoid} 100%)` }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,15,31,0.16) 0%, rgba(7,15,31,0.02) 34%, rgba(7,15,31,0.88) 100%)',
        }}
      />

      {/* The paper's own rule, held inside the trim rather than run to the edge. */}
      <span className="pointer-events-none absolute" style={{ inset: 9, border: `1px solid ${P.gold}3D` }} />

      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-8">
        {kicker?.text && (
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.42em] ppc-rise" style={{ color: P.gold }}>
            {kicker.text}
          </p>
        )}
        {heading?.text && (
          <HonoreeLink
            nomineeId={nomineeId}
            name={heading.text}
            className="group block w-fit"
          >
            <h2
              className="font-serif text-[2rem] leading-[0.95] ppc-rise group-hover:underline decoration-1 underline-offset-4"
              style={{ color: P.cream, animationDelay: '0.1s', textDecorationColor: `${P.gold}88` }}
            >
              {heading.text}
            </h2>
            {nomineeId && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em] opacity-80 transition-opacity group-hover:opacity-100"
                style={{ color: P.gold }}
              >
                Open profile <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            )}
          </HonoreeLink>
        )}
        {byline?.text && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] ppc-rise" style={{ color: 'rgba(250,248,245,0.72)', animationDelay: '0.18s' }}>
            {byline.text}
          </p>
        )}
        {caption && (
          <p className="mt-3 max-w-[34ch] text-[9px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.5)' }}>
            {caption}
          </p>
        )}
      </div>

      <span className="absolute bottom-3 right-4 font-mono text-[9px]" style={{ color: 'rgba(250,248,245,0.42)' }}>
        {String(pageNumber).padStart(2, '0')}
        <span style={{ opacity: 0.5 }}> / {String(totalPages).padStart(2, '0')}</span>
      </span>
    </div>
  );
}