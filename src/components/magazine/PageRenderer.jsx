import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MAGAZINE_PALETTE as P, PORTRAIT_FOCUS } from '@/components/magazine/magazineConfig';
import PinnedPageHead from '@/components/magazine/PinnedPageHead';
import PortraitPlate from '@/components/magazine/PortraitPlate';
import FaceSpread from '@/components/magazine/FaceSpread';
import PageImageBand from '@/components/magazine/PageImageBand';
import Centerfold from '@/components/magazine/Centerfold';
import HouseAdPage from '@/components/magazine/HouseAdPage';
import { CENTERFOLD_LABEL, HOUSE_AD_LABEL, PATRON_LABEL } from '@/components/magazine/editionBands';
import HonoreeLink, { nomineeIndex, resolveNomineeId } from '@/components/magazine/HonoreeLink';
import { usePageTeleprompter, PAGE_SCROLL_ATTR } from '@/components/magazine/pageTeleprompter';

// The blocks that make up a page's head: what pins to the top of the frame while the body
// runs beneath it.
const HEAD_TYPES = ['kicker', 'heading', 'byline'];

// Renders a single magazine page's content based on its layout type and blocks.
// Used by both the flipbook and single-page reader.
export default function PageRenderer({ page, issue, articles = [], pageNumber, totalPages, playing = false, autoscroll = false, speed = 1, paused = false, onOverflow }) {
  // A page that runs past its frame rolls under the reader as a teleprompter at reading
  // pace — while the issue plays as a film and while it is read by hand. A page can be put
  // on hold on its own: the roll of the left-hand page has nothing to do with the right's.
  const { ref: scrollRef, overflow } = usePageTeleprompter({
    playing,
    pageKey: page?.id || pageNumber,
    autoscroll,
    speed,
    paused,
  });
  // The reader only offers a hold to a page that actually runs past its frame, so the
  // page tells the book whether it has anything to roll.
  const rollKey = page?.id || pageNumber;
  useEffect(() => {
    onOverflow?.(rollKey, overflow > 0);
  }, [onOverflow, rollKey, overflow]);

  const blocks = page.content_blocks || [];
  const bg = page.background_image_url;
  const credits = issue.cover_credits || {};
  // The people this page is about, resolved once: a page stores names, the profile is
  // keyed by id. An edition page points at its article, a plate tile at its own name.
  const nomineeByTitle = nomineeIndex(articles);
  const pageNomineeId =
    page.nominee_id || articles.find((article) => article.id === page.article_id)?.nominee_id || null;

  // The pages the edition places rather than measures, marked in their own first line: a
  // centerfold, and the two labelled placements — the house's own advertisement, and the
  // patron's slot. They are drawn in their own frames so neither reads as editorial.
  const pageMark = blocks[0]?.type === 'kicker' ? String(blocks[0].text || '') : '';
  if (pageMark.startsWith(CENTERFOLD_LABEL)) {
    return <Centerfold blocks={blocks} imageUrl={bg} pageNumber={pageNumber} totalPages={totalPages} />;
  }
  if (pageMark === HOUSE_AD_LABEL || pageMark === PATRON_LABEL) {
    return <HouseAdPage blocks={blocks} label={pageMark} pageNumber={pageNumber} totalPages={totalPages} />;
  }

  // Cover page. A cover with a photograph is led by it; a cover without one is set in
  // type — the masthead mark, the issue, the rule, and the credit stack — which is how
  // an institutional publication covers an edition rather than leaving a navy blank.
  if (page.layout_type === 'cover') {
    return (
      <div className="relative w-full h-full overflow-hidden" style={{ background: P.navy }}>
        {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        {bg && (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,15,31,0.3) 0%, rgba(7,15,31,0.7) 100%)' }} />
        )}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center">
          {!bg && (
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
        </div>
      </div>
    );
  }

  // Table of Contents
  if (page.layout_type === 'toc') {
    const sections = issue.sections || [];
    // A contents page indexes the book, not the database. A section carrying a
    // directory states it once, with its page range, instead of printing a row for
    // every name the issue holds — so an edition of a hundred reads as a book, and
    // the directory is entered from its region openings.
    const contents = sections
      .map((section) => {
        const items = articles.filter((a) => a.section_id === section.id);
        const editorial = items.filter((a) => a.article_type !== 'profile');
        const directory = items.filter((a) => a.article_type === 'profile');
        const placed = [...editorial, ...directory].map((a) => a.page_number).filter(Boolean);
        return {
          ...section,
          editorial,
          directory,
          from: placed.length ? Math.min(...placed) : null,
          to: placed.length ? Math.max(...placed) : null,
        };
      })
      .filter((section) => section.editorial.length || section.directory.length);

    const folios = (from, to) => {
      if (!from) return '';
      const first = String(from).padStart(2, '0');
      if (!to || to === from) return first;
      return `${first}–${String(to).padStart(2, '0')}`;
    };

    return (
      <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
        <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
          <PinnedPageHead className="px-6 sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2" style={{ color: P.gold }}>Contents</p>
            <h2 className="font-serif text-xl sm:text-2xl" style={{ color: P.navy }}>{issue.title}</h2>
            {issue.subtitle && <p className="text-[11px] mt-1" style={{ color: 'rgba(30,58,90,0.5)' }}>{issue.subtitle}</p>}
          </PinnedPageHead>
          <div className="space-y-5 px-6 pb-6 pt-5 sm:px-8">
            {contents.map((section) => (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: P.copper }}>{section.name}</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(30,58,90,0.1)' }} />
                  <span className="text-[9px] font-mono" style={{ color: 'rgba(30,58,90,0.4)' }}>{folios(section.from, section.to)}</span>
                </div>
                {section.editorial.map((art, i) => (
                  <div key={art.id || i} className="flex items-baseline gap-2 py-1.5">
                    <span className="text-[10px] font-mono flex-shrink-0 w-6 text-right" style={{ color: P.gold }}>
                      {art.page_number ? String(art.page_number).padStart(2, '0') : '—'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight" style={{ color: P.navy }}>{art.title}</p>
                      {art.teaser && <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(30,58,90,0.5)' }}>{art.teaser}</p>}
                      {(art.writer_credit || art.photographer_credit) && (
                        <p className="text-[9px] mt-0.5" style={{ color: 'rgba(184,115,51,0.7)' }}>
                          {art.writer_credit && <span>{art.writer_credit}</span>}
                          {art.writer_credit && art.photographer_credit && <span> · </span>}
                          {art.photographer_credit && <span>{art.photographer_credit}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {section.directory.length > 0 && (
                  <div className="flex items-baseline gap-2 py-1.5">
                    <span className="text-[10px] font-mono flex-shrink-0 w-6 text-right" style={{ color: P.gold }}>
                      {String(section.directory[0].page_number || section.from).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight" style={{ color: P.navy }}>
                        {section.directory.length} honorees, in full
                      </p>
                      <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(30,58,90,0.5)' }}>
                        {section.section_type === 'profile' ? 'Grouped by field, in measured order' : 'In measured order'} · pages {folios(section.from, section.to)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {contents.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'rgba(30,58,90,0.4)' }}>
                Assign articles with page numbers to populate the contents.
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
            {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    );
  }

  // Chapter divider: a part of the book, or one region of the index opened by its own
  // line — what the opening carries, stated before a reader turns into it.
  if (page.layout_type === 'chapter_divider') {
    const carries = blocks[0]?.type === 'body' ? blocks[0].text : '';
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.navy }}>
        {page.chapter_number != null && (
          <span className="font-serif text-4xl sm:text-5xl mb-2 ppc-rise" style={{ color: P.gold, opacity: 0.45 }}>{String(page.chapter_number).padStart(2, '0')}</span>
        )}
        <div className="w-10 h-px my-3 ppc-rise" style={{ background: P.gold, animationDelay: '0.2s' }} />
        <h2 className="font-serif text-2xl sm:text-3xl ppc-rise" style={{ color: P.cream, animationDelay: '0.3s' }}>
          {page.chapter_label || 'Chapter'}
        </h2>
        {carries && (
          <p className="text-[11px] mt-3 ppc-rise" style={{ color: 'rgba(250,248,245,0.6)', animationDelay: '0.45s' }}>
            {carries}
          </p>
        )}
      </div>
    );
  }

  // Pull quote: her voice at the size of the paper. When the page carries the read as
  // well, the quote is the plate at its head and the body runs beneath it — and the page
  // rolls, so it is read rather than flashed.
  if (page.layout_type === 'pull_quote') {
    const quoteBlock = blocks.find((b) => b.type === 'pull_quote') || {};
    const kicker = blocks.find((b) => b.type === 'kicker');
    const read = blocks.filter((b) => b.type === 'body');

    if (!read.length) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-10 text-center" style={{ background: P.cream }}>
          <div className="text-6xl font-serif leading-none mb-4" style={{ color: P.gold, opacity: 0.3 }}>“</div>
          <p className="font-serif text-lg sm:text-xl leading-relaxed ppc-rise" style={{ color: P.navy }}>
            {quoteBlock.text || 'A pull quote will appear here.'}
          </p>
          {quoteBlock.attribution && (
            <p className="text-xs mt-6 ppc-rise" style={{ color: P.copper, animationDelay: '0.2s' }}>— {quoteBlock.attribution}</p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
        <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
          <div className="px-6 pb-6 pt-7 sm:px-8">
            {kicker?.text && (
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.4em]" style={{ color: P.copper }}>{kicker.text}</p>
            )}
            <div className="font-serif text-5xl leading-none mb-3" style={{ color: P.gold, opacity: 0.32 }}>“</div>
            <p className="font-serif text-xl leading-snug sm:text-2xl" style={{ color: P.navy }}>
              {quoteBlock.text || 'A pull quote will appear here.'}
            </p>
            {quoteBlock.attribution && (
              <p className="mt-5 text-[10px] uppercase tracking-[0.24em]" style={{ color: P.copper }}>
                — {quoteBlock.attribution}
              </p>
            )}
            <div className="my-5 h-px w-12" style={{ background: `${P.copper}66` }} />
            {read.map((block, i) => <BlockRenderer key={i} block={block} lead={i === 0} />)}
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
            {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    );
  }

  // The face page of a spread: the portrait to the trim, her standing and name over it.
  if (page.layout_type === 'feature_spread') {
    return (
      <FaceSpread
        blocks={blocks}
        imageUrl={bg}
        pageNumber={pageNumber}
        totalPages={totalPages}
        nomineeId={pageNomineeId}
      />
    );
  }

  // Colophon
  if (page.layout_type === 'colophon') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.cream }}>
        <div className="w-10 h-px mb-6" style={{ background: P.copper }} />
        <p className="font-serif text-base mb-4" style={{ color: P.navy }}>Colophon</p>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(30,58,90,0.6)' }}>
          {issue.colophon || 'TOP 100 Aerospace & Aviation. An institutional publication.'}
        </p>
        <div className="w-10 h-px mt-6" style={{ background: P.copper }} />
      </div>
    );
  }

  // Masthead
  if (page.layout_type === 'masthead') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.cream }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4" style={{ color: P.gold }}>TOP 100</span>
        <h2 className="font-serif text-xl mb-2" style={{ color: P.navy }}>{issue.title}</h2>
        {issue.subtitle && <p className="text-xs" style={{ color: 'rgba(30,58,90,0.5)' }}>{issue.subtitle}</p>}
        <div className="w-10 h-px my-6" style={{ background: P.copper }} />
        {issue.preface && <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(30,58,90,0.7)' }}>{issue.preface}</p>}
      </div>
    );
  }

  // Profile. A portrait page leads with the face, full width and cropped at the top
  // rather than to a thumbnail: the region she is indexed under, her name, her stand,
  // the country she works from, her own words, then the institutional read.
  if (page.layout_type === 'profile') {
    const image = blocks.find((b) => b.type === 'image');
    const heading = blocks.find((b) => b.type === 'heading');
    const byline = blocks.find((b) => b.type === 'byline');
    const kicker = blocks.find((b) => b.type === 'kicker');
    // The head — the region she is indexed under, her name, her stand — is the page's own
    // plate, so the body picks up with what follows it. The portrait is the banner above
    // the plate, not a block of the body.
    // The lead portrait is the banner above her plate. Any further photograph the editor
    // sets on the page runs with the body, so a second plate is composed into the read
    // instead of being dropped.
    const leadImageIndex = blocks.findIndex((b) => b.type === 'image');
    const rest = blocks.filter((b, i) => i !== leadImageIndex && !['kicker', 'heading', 'byline'].includes(b.type));
    const firstBody = rest.findIndex((b) => b.type === 'body');

    return (
      <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
        <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
          {image?.url ? (
            <figure className="relative">
              {/* The crop steps from side to side down the run, so a wall of portraits
                  never reads as the same photograph a hundred times over. */}
              <img
                src={image.url}
                alt={heading?.text || ''}
                className="w-full h-60 sm:h-80 object-cover"
                style={{ ...PORTRAIT_FOCUS, objectPosition: pageNumber % 2 ? '46% 24%' : '54% 18%' }}
              />
              {image.caption && (
                <figcaption
                  className="absolute bottom-0 left-0 right-0 px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: P.cream, background: 'linear-gradient(180deg, rgba(7,15,31,0) 0%, rgba(7,15,31,0.78) 100%)' }}
                >
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="h-16" />
          )}
          {/* The plate is the page's banner, and it pins: once the portrait has gone by,
              the region, the name and the stand stay at the head of the frame, with the
              portrait itself collapsed into a seal beside them. */}
          <PinnedPageHead className="px-5 pt-3 sm:px-7" portraitUrl={image?.url}>
            {kicker?.text && (
              <p className="text-[9px] font-bold uppercase tracking-[0.32em] mb-2" style={{ color: P.gold }}>{kicker.text}</p>
            )}
            {heading?.text && (
              <HonoreeLink
                nomineeId={pageNomineeId}
                name={heading.text}
                className="group block w-fit"
              >
                <h2
                  className="font-serif text-2xl sm:text-3xl leading-tight group-hover:underline decoration-1 underline-offset-4"
                  style={{ color: P.navy, textDecorationColor: `${P.copper}88` }}
                >
                  {heading.text}
                </h2>
              </HonoreeLink>
            )}
            {byline?.text && <p className="text-[11px] mt-2 leading-relaxed" style={{ color: P.copper }}>{byline.text}</p>}
            {pageNomineeId && (
              <HonoreeLink
                nomineeId={pageNomineeId}
                name={heading?.text}
                className="mt-2 flex w-fit items-center gap-1 text-[8px] font-bold uppercase tracking-[0.26em]"
                style={{ color: P.copper }}
              >
                Open profile <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
              </HonoreeLink>
            )}
          </PinnedPageHead>
          <div className="px-5 pb-6 pt-4 sm:px-7">
            <div className="w-10 h-px mb-4" style={{ background: `${P.copper}66` }} />
            {rest.map((block, i) => (
              block.type === 'image'
                ? <PageImageBand key={i} block={block} />
                : <BlockRenderer key={i} block={block} lead={i === firstBody} />
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
            {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    );
  }

  // A plate: two faces or more held on one page, each with the standing it holds. The page
  // carries photographs and nothing to read, so it never rolls — it is looked at.
  // A tile is a photograph the composer gave a name and a standing to — which is how a
  // plate is told apart from an article that happens to carry pictures.
  const plateTiles = blocks.filter((b) => b.type === 'image' && b.text && b.attribution);
  if (plateTiles.length >= 2) {
    return (
      <PortraitPlate
        label={blocks.find((b) => b.type === 'kicker')?.text}
        tiles={plateTiles.map((tile) => ({
          url: tile.url,
          name: tile.text,
          line: tile.caption,
          standing: tile.attribution,
          nomineeId: resolveNomineeId(tile.nominee_id, tile.text, nomineeByTitle),
        }))}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    );
  }

  // Default: article page with content blocks. The opening kicker, title and byline are
  // the page's head, and they pin; the body picks up beneath them, so nothing is set twice.
  const leadBody = blocks.findIndex((b) => b.type === 'body');
  let headEnd = 0;
  while (headEnd < blocks.length && HEAD_TYPES.includes(blocks[headEnd].type)) headEnd += 1;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
      <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
        {headEnd > 0 && (
          <PinnedPageHead className="px-6 sm:px-8">
            {blocks.slice(0, headEnd).map((block, i) => <BlockRenderer key={i} block={block} />)}
          </PinnedPageHead>
        )}
        <div className="px-6 pb-6 pt-4 sm:px-8">
          {blocks.slice(headEnd).map((block, i) => <BlockRenderer key={headEnd + i} block={block} lead={headEnd + i === leadBody} />)}
        </div>
      </div>
      {/* Page number footer */}
      <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
          {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}

function BlockRenderer({ block, lead = false }) {
  switch (block.type) {
    case 'kicker':
      return <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: P.gold }}>{block.text}</p>;
    case 'heading':
      return <h2 className="font-serif text-lg sm:text-xl leading-tight mb-3" style={{ color: P.navy }}>{block.text}</h2>;
    case 'byline':
      return <p className="text-xs italic mb-4" style={{ color: P.copper }}>{block.text}</p>;
    case 'body': {
      // The page's opening paragraph is set with a drop cap, the way a magazine opens
      // a story — dropped only when it opens on a letter, never on a figure.
      const opened = lead && /^[A-Za-z]/.test(block.text || '');
      return (
        <p
          className={`leading-relaxed mb-3 ${lead ? 'text-[13px] sm:text-[15px]' : 'text-xs sm:text-sm'} ${opened ? 'first-letter:float-left first-letter:font-serif first-letter:text-[2.6rem] first-letter:leading-[0.78] first-letter:pr-1.5 first-letter:text-[#B87333]' : ''}`}
          style={{ color: 'rgba(30,58,90,0.8)' }}
        >
          {block.text}
        </p>
      );
    }
    case 'image':
      return (
        <figure className="mb-4">
          {block.url && <img src={block.url} alt={block.caption || ''} className="w-full rounded-lg mb-1" />}
          {block.caption && <figcaption className="text-[10px] text-center" style={{ color: 'rgba(30,58,90,0.4)' }}>{block.caption}</figcaption>}
        </figure>
      );
    case 'pull_quote':
      return (
        <blockquote className="my-4 pl-4" style={{ borderLeft: `3px solid ${P.gold}` }}>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: P.navy }}>{block.text}</p>
          {block.attribution && <p className="text-xs mt-2" style={{ color: P.copper }}>— {block.attribution}</p>}
        </blockquote>
      );
    case 'divider':
      return <div className="w-12 h-px mx-auto my-4" style={{ background: P.gold, opacity: 0.4 }} />;
    case 'spacer':
      return <div className="h-4" />;
    default:
      return null;
  }
}