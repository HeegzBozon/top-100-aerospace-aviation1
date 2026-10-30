import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// A placed page: the house's own advertisement, or the patron's reserved slot.
//
// It is drawn in its own frame — a copper double rule, the label set small and plain at
// the head of the page — so a reader can tell in one glance that this page was placed
// rather than measured. Nothing here is styled to look like editorial.
export default function HouseAdPage({ blocks = [], label, pageNumber, totalPages }) {
  const heading = blocks.find((b) => b.type === 'heading');
  const body = blocks.find((b) => b.type === 'body');
  const byline = blocks.find((b) => b.type === 'byline');
  const image = blocks.find((b) => b.type === 'image' && b.url);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ background: P.cream }}>
      <div className="pointer-events-none absolute" style={{ inset: '12px', border: `2px solid ${P.copper}33` }} />
      <div className="pointer-events-none absolute" style={{ inset: '17px', border: `1px solid ${P.copper}26` }} />

      <div className="relative flex min-h-0 flex-1 flex-col justify-center px-8 py-10 text-center sm:px-12">
        <p className="text-[9px] font-bold uppercase tracking-[0.44em]" style={{ color: P.copper }}>
          {label}
        </p>

        <div className="mx-auto my-6 h-px w-14" style={{ background: P.copper }} />

        {image && (
          <img
            src={image.url}
            alt={image.caption || ''}
            className="mx-auto mb-6 max-h-40 w-auto object-contain"
            loading="lazy"
          />
        )}

        {heading?.text && (
          <h2 className="font-serif text-xl leading-snug sm:text-2xl" style={{ color: P.navy }}>
            {heading.text}
          </h2>
        )}

        {body?.text && (
          <p
            className="mx-auto mt-4 max-w-[38ch] text-[12px] leading-relaxed sm:text-[13px]"
            style={{ color: 'rgba(30,58,90,0.72)' }}
          >
            {body.text}
          </p>
        )}

        {byline?.text && (
          <p className="mt-6 text-[9px] uppercase tracking-[0.28em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
            {byline.text}
          </p>
        )}
      </div>

      <div className="relative flex flex-none justify-center pb-3">
        <span className="font-mono text-[10px]" style={{ color: 'rgba(30,58,90,0.3)' }}>
          {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}