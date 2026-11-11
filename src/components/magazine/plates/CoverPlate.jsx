import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The cover.
//
// Three covers in one. Art the composer laid on the page is drawn with the copy set over
// it; the issue's own cover plate — the finished artwork the edition was announced with —
// is printed exactly as it was designed, because it already carries the masthead, the issue
// and the invitation; and a cover with neither is set in type, the way an institutional
// publication covers an edition rather than leaving a navy blank.
export default function CoverPlate({ page, issue, bg }) {
  const credits = issue.cover_credits || {};
  const art = bg || issue.cover_image_url || null;
  const blocks = page.content_blocks || [];
  const composed = blocks.some((block) => block.type !== 'kicker');
  const drawCopy = composed || (!art && blocks.length > 0);
  // A finished plate is never cropped: the artwork was composed to its own frame, and taking
  // a strip off it to fill the page would cut its rules and its own masthead. Art the
  // composer laid under copy bleeds to the page, which is what the scrim is for.
  const finished = Boolean(art) && !bg && !drawCopy;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: P.navy }}>
      {art && (
        <img
          src={art}
          alt=""
          className={`absolute inset-0 w-full h-full ${finished ? 'object-contain' : 'object-cover'}`}
        />
      )}
      {art && drawCopy && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,15,31,0.3) 0%, rgba(7,15,31,0.7) 100%)' }} />
      )}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center">
        {!drawCopy ? null : <>
        {!art && (
          <>
            <span className="absolute" style={{ inset: '14px', border: `1px solid ${P.gold}45` }} />
            <span
              className="absolute font-serif select-none pointer-events-none leading-none"
              style={{ color: `${P.gold}12`, fontSize: 'clamp(2.6rem, 21vw, 6.5rem)', letterSpacing: '-0.02em' }}
            >
              TOP 100
            </span>
          </>
        )}
        <span className="relative text-[10px] font-bold uppercase tracking-[0.4em] mb-4 ppc-rise" style={{ color: P.gold, animationDelay: '0.2s' }}>
          {issue.cover_kicker || 'The 2025 Edition'}
        </span>
        <h1 className="relative font-serif text-2xl sm:text-3xl leading-tight max-w-[15ch] ppc-rise" style={{ color: P.cream, animationDelay: '0.4s' }}>
          {issue.title}
        </h1>
        {issue.subtitle && (
          <p className="relative text-sm mt-3 ppc-rise" style={{ color: 'rgba(250,248,245,0.7)', animationDelay: '0.6s' }}>{issue.subtitle}</p>
        )}
        <div className="relative w-12 h-px mt-6 ppc-rise" style={{ background: P.gold, animationDelay: '0.8s' }} />
        {(credits.subject || credits.photographer || credits.writer) && (
          <div className="relative mt-8 ppc-rise" style={{ animationDelay: '1s' }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(201,168,124,0.6)' }}>On the Cover</p>
            {credits.subject && <p className="text-xs" style={{ color: 'rgba(250,248,245,0.8)' }}>{credits.subject}</p>}
            {credits.photographer && <p className="text-[10px] mt-1" style={{ color: 'rgba(250,248,245,0.5)' }}>Photography by {credits.photographer}</p>}
            {credits.writer && <p className="text-[10px]" style={{ color: 'rgba(250,248,245,0.5)' }}>Written by {credits.writer}</p>}
          </div>
        )}
        </>}
      </div>
    </div>
  );
}