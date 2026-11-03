import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import MagazineLink, { resolveDestination } from '@/components/magazine/MagazineLink';
import { PAGE_SCROLL_ATTR } from '@/components/magazine/pageTeleprompter';

// Ad Astra — the back of the book.
//
// Not a closing plate but the issue's index of doors: every call to action the issue printed
// on its pages, gathered in one place with the part it came from and the page it stands on,
// and beneath them the issue's own parts so a reader can turn to any of them. A signpost, not
// a summary: each line says what can be done, where to do it, and how to get there.
//
// The calls to action are read off the pages themselves — a page carries one as a `cta`
// block (its label, its address, and one line of instruction) — so the back of the book is
// always exactly what the issue asked of its reader, and nothing an editor did not write.

const CTA_TYPE = 'cta';

// The chapter a page stands in: the last divider the reader has passed, so a signpost can
// say which part of the book it belongs to.
function chapterLabelAt(pages, index) {
  for (let i = index; i >= 0; i -= 1) {
    const entry = pages[i];
    if (entry?.layout_type === 'chapter_divider') return entry.chapter_label || 'Chapter';
    if (entry?.layout_type === 'cover') return 'Cover';
  }
  return '';
}

// Every call to action in the issue, in reading order and once each — two pages raising the
// same door raise it once, on the page where it is first asked.
function signpostsIn(pages) {
  const seen = new Set();
  const found = [];
  pages.forEach((entry, index) => {
    (entry.content_blocks || []).forEach((block) => {
      if (block.type !== CTA_TYPE || !block.url) return;
      const address = String(block.url).trim();
      if (!address || seen.has(address)) return;
      seen.add(address);
      const destination = resolveDestination(address);
      let host = '';
      if (destination?.href) {
        try {
          host = new URL(destination.href).hostname.replace(/^www\./, '');
        } catch {
          host = '';
        }
      }
      found.push({
        key: address,
        label: block.text || 'Read more',
        note: block.caption || '',
        href: address,
        host,
        chapter: chapterLabelAt(pages, index),
        page: index + 1,
      });
    });
  });
  return found;
}

// The issue by its parts: the cover and each chapter mark, in the order the book runs.
function partsOf(pages) {
  return pages
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.layout_type === 'chapter_divider' || entry.layout_type === 'cover')
    .map(({ entry, index }) => ({
      key: entry.id || index,
      index,
      label: entry.layout_type === 'cover' ? 'Cover' : entry.chapter_label || 'Chapter',
      number: entry.chapter_number,
      page: index + 1,
    }));
}

function SectionLabel({ children }) {
  return (
    <p
      className="text-[9px] font-bold uppercase tracking-[0.26em]"
      style={{ color: 'rgb(var(--editorial-label-rgb))' }}
    >
      {children}
    </p>
  );
}

export default function AdAstraPage({
  page,
  issue,
  pages = [],
  pageNumber,
  totalPages,
  scrollRef,
  onGoToPage,
}) {
  const signposts = useMemo(() => signpostsIn(pages), [pages]);
  const parts = useMemo(() => partsOf(pages), [pages]);

  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
      <div className="page-scroll flex-1 overflow-y-auto" {...{ [PAGE_SCROLL_ATTR]: '' }} ref={scrollRef}>
        <div className="px-6 pb-7 pt-7 sm:px-8">
          {/* The plate */}
          <p className="text-[9px] font-bold uppercase tracking-[0.34em]" style={{ color: P.copper }}>
            Back of book
          </p>
          <h1 className="mt-2 font-serif text-2xl leading-none" style={{ color: P.navy }}>
            Ad Astra
          </h1>
          <p
            className="mt-2 text-[9.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(30,58,90,0.45)' }}
          >
            Higher, Further, Faster.
          </p>
          <div className="mt-4 h-[2px] w-12" style={{ background: P.copper }} />

          {/* The issue's doors, gathered */}
          <section className="mt-6">
            <SectionLabel>Where this issue sends you</SectionLabel>
            {signposts.length ? (
              <ul className="mt-2">
                {signposts.map((post, i) => (
                  <li
                    key={post.key}
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(30,58,90,0.12)' }}
                  >
                    <MagazineLink
                      href={post.href}
                      className="group flex items-start justify-between gap-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ outlineColor: P.copper }}
                    >
                      <span className="min-w-0">
                        <span className="block font-serif text-[15px] leading-snug" style={{ color: P.navy }}>
                          {post.label}
                        </span>
                        {post.note && (
                          <span
                            className="mt-1 block text-[10.5px] leading-snug"
                            style={{ color: 'rgba(30,58,90,0.62)' }}
                          >
                            {post.note}
                          </span>
                        )}
                        <span
                          className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: 'rgba(30,58,90,0.4)' }}
                        >
                          {post.chapter ? `${post.chapter} · ` : ''}p. {String(post.page).padStart(2, '0')}
                          {post.host ? ` · ${post.host}` : ''}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 flex-none transition-transform group-hover:-translate-y-0.5"
                        style={{ color: P.copper }}
                        aria-hidden="true"
                      />
                    </MagazineLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="mt-2 text-[11px] leading-relaxed"
                style={{ color: 'rgba(30,58,90,0.62)' }}
              >
                This issue asks nothing of its reader in writing — it asks it on the pages that
                make the case. Where a page carries a call, it is printed on that page as a key you
                can press. The parts below carry the page each one stands on.
              </p>
            )}
          </section>

          {/* The issue, its parts and their pages */}
          {parts.length > 0 && (
            <section className="mt-7">
              <SectionLabel>The issue, by its parts</SectionLabel>
              <ol className="mt-2">
                {parts.map((part) => {
                  const row = (
                    <>
                      <span
                        className="w-6 flex-none text-[10px] tabular-nums"
                        style={{ color: P.copper }}
                      >
                        {String(part.index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-[11.5px] leading-snug" style={{ color: P.navy }}>
                        {part.label}
                        {part.number ? (
                          <span style={{ color: 'rgba(30,58,90,0.35)' }}> · {part.number}</span>
                        ) : null}
                      </span>
                      <span
                        className="h-px flex-1 self-center"
                        style={{
                          background:
                            'repeating-linear-gradient(90deg, rgba(30,58,90,0.32) 0 1px, transparent 1px 4px)',
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="w-7 flex-none text-right text-[10px] tabular-nums"
                        style={{ color: 'rgba(30,58,90,0.55)' }}
                      >
                        {String(part.page).padStart(2, '0')}
                      </span>
                    </>
                  );
                  return (
                    <li key={part.key}>
                      {onGoToPage ? (
                        <button
                          onClick={() => onGoToPage(part.index)}
                          className="flex w-full items-baseline gap-2 py-[3px] text-left transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ outlineColor: P.copper }}
                          aria-label={`Turn to ${part.label}, page ${part.page}`}
                        >
                          {row}
                        </button>
                      ) : (
                        <div className="flex w-full items-baseline gap-2 py-[3px]">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* The colophon: what this record is, and what it does not measure */}
          <section className="mt-7" style={{ borderTop: `2px solid ${P.copper}`, paddingTop: 12 }}>
            <SectionLabel>Colophon</SectionLabel>
            <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.7)' }}>
              {(page?.content_blocks || []).find((block) => block.type === 'body')?.text
                || issue.colophon
                || 'TOP 100 Aerospace & Aviation. An institutional publication.'}
            </p>
            <p
              className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: 'rgba(30,58,90,0.4)' }}
            >
              TOP 100 Aerospace &amp; Aviation · {issue.title}
            </p>
          </section>
        </div>
      </div>

      {/* The folio, printed the way the rest of the book prints it */}
      <div className="flex-shrink-0 px-6 py-1 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
          {String(pageNumber).padStart(2, '0')}{' '}
          <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}