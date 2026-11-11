import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// A part of the book, opened by its own plate: where the reader is, counted off the issue
// itself, what the part is called, and the one line the opening carries. The number is set
// as the plate's watermark rather than as a caption, so a part reads as a part.
export default function ChapterDivider({ page, issue, blocks = [], pages = [] }) {
  const carries = blocks.find((block) => block.type === 'body')?.text || '';
  const parts = pages.filter((entry) => entry.layout_type === 'chapter_divider');
  const at = parts.findIndex((entry) => entry.id === page.id);
  const number = page.chapter_number ?? (at >= 0 ? at + 1 : null);
  const counted = at >= 0 && parts.length > 1
    ? `Part ${String(at + 1).padStart(2, '0')} of ${String(parts.length).padStart(2, '0')}`
    : 'Part';

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-8 text-center" style={{ background: P.navy }}>
      <span className="text-[8px] font-bold uppercase tracking-[0.38em] ppc-rise" style={{ color: P.gold }}>
        {counted}
      </span>
      {number != null && (
        <span className="mt-4 font-serif text-6xl leading-none ppc-rise" style={{ color: P.gold, opacity: 0.34, animationDelay: '0.15s' }}>
          {String(number).padStart(2, '0')}
        </span>
      )}
      <div className="my-5 h-px w-14 ppc-rise" style={{ background: P.copper, animationDelay: '0.25s' }} />
      <h2 className="font-serif text-3xl leading-tight ppc-rise" style={{ color: P.cream, animationDelay: '0.3s' }}>
        {page.chapter_label || 'Chapter'}
      </h2>
      {carries && (
        <p
          className="mt-4 max-w-[26ch] font-serif text-[12.5px] italic leading-relaxed ppc-rise"
          style={{ color: 'rgba(250,248,245,0.68)', animationDelay: '0.45s' }}
        >
          {carries}
        </p>
      )}
      <div className="mt-8 h-px w-8" style={{ background: `${P.gold}45` }} />
      <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: 'rgba(250,248,245,0.45)' }}>
        {issue.title}
      </p>
    </div>
  );
}