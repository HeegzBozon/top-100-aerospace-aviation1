import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The breakaway quote — the one page in the book that changes key. It is printed on the navy
// plate rather than the paper, so it reads as a full stop between two movements: the house
// line at its head, the quote at the size of the page, and its attribution ruled off beneath.
export default function PullQuotePlate({ quote, kicker, issue }) {
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-8" style={{ background: P.navy }}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.32em]" style={{ color: P.gold }}>TOP 100</p>
        {kicker && (
          <p className="text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(201,168,124,0.72)' }}>
            {kicker}
          </p>
        )}
      </div>

      <div>
        <div className="mb-3 font-serif text-5xl leading-none" style={{ color: P.gold, opacity: 0.42 }}>&ldquo;</div>
        <p className="font-serif text-[21px] leading-[1.3] ppc-rise" style={{ color: P.cream }}>
          {quote.text || 'A pull quote will appear here.'}
        </p>
        {quote.attribution && (
          <>
            <div className="mt-6 h-px w-10" style={{ background: P.copper }} />
            <p
              className="mt-3 text-[8.5px] font-bold uppercase tracking-[0.26em] ppc-rise"
              style={{ color: P.gold, animationDelay: '0.2s' }}
            >
              {quote.attribution}
            </p>
          </>
        )}
      </div>

      <p className="text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(250,248,245,0.42)' }}>
        {issue.cover_kicker || issue.title}
      </p>
    </div>
  );
}