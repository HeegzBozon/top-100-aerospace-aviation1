import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EPISODE_TRACK, trackIndex, stageLabel } from '@/components/episode/episodeStages';

const NAVY = '#1E3A5A';
const CREAM = '#FAF8F5';
const COPPER = '#B87333';
const GOLD = '#C9A87C';
const LABEL = '#8F5C2C';

const Rule = () => <div style={{ height: 2, background: COPPER, width: '100%' }} />;

const Kicker = ({ children }) => (
  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: LABEL, margin: 0 }}>
    {children}
  </p>
);

const Prose = ({ children }) => (
  <p className="font-body text-[15px] leading-[1.85]" style={{ color: 'rgba(30,58,90,0.86)', margin: 0 }}>
    {children}
  </p>
);

function Facts({ facts }) {
  return (
    <dl style={{ margin: 0 }}>
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
          style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}
        >
          <dt className="w-28 flex-none">
            <Kicker>{fact.label}</Kicker>
          </dt>
          <dd className="min-w-0 flex-1" style={{ margin: 0 }}>
            <span className="font-heading text-[16px] leading-snug" style={{ color: NAVY }}>
              {fact.value}
            </span>
            {fact.body && (
              <span className="mt-1 block font-body text-[13px]" style={{ color: 'rgba(30,58,90,0.55)' }}>
                {fact.body}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// One page, read plainly.
//
// This is the same page the book prints — the same composed record — set as a
// single column of real, selectable text at a readable measure. No transforms, no
// page-turn, no fixed height: whatever the reading environment does to text, it can
// do here. That is what makes it work in Safari's reader, in a screen reader, and
// in print.
function ReaderPage({ page, isOwner, onEnquire, onOpenEpisode }) {
  return (
    <article aria-labelledby={`pb-h-${page.key}`}>
      <div className="flex items-baseline justify-between gap-4">
        <Kicker>{page.label}</Kicker>
        <span className="font-heading text-[11px] tabular-nums" style={{ color: 'rgba(184,115,51,0.7)' }}>
          {page.number}
        </span>
      </div>
      <div className="mt-3">
        <Rule />
      </div>

      <h2
        id={`pb-h-${page.key}`}
        className="mt-6 font-heading text-[30px] leading-[1.12] sm:text-[38px]"
        style={{ color: NAVY, letterSpacing: '-0.01em' }}
      >
        {page.title}
      </h2>

      {page.standfirst && (
        <p
          className="mt-3 font-body text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: 'rgba(30,58,90,0.5)' }}
        >
          {page.standfirst}
        </p>
      )}

      {page.kind === 'cover' && (
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {page.portrait && (
            <img
              src={page.portrait}
              alt={page.title}
              className="h-32 w-32 flex-none rounded-full object-cover"
              style={{ border: `1px solid ${COPPER}`, objectPosition: 'center 22%' }}
            />
          )}
          <div className="min-w-0 flex-1 space-y-4">
            {page.lines.map((line, i) => (
              <Prose key={i}>{line}</Prose>
            ))}
            <Facts facts={page.facts} />
          </div>
        </div>
      )}

      {page.kind === 'credential' && (
        <div className="mt-8 space-y-6">
          <Facts facts={page.facts} />
          <div className="flex items-baseline justify-between gap-4 py-3" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
            <Kicker>Influence band</Kicker>
            <span className="font-heading text-[18px]" style={{ color: NAVY }}>
              {page.tier}
            </span>
          </div>
          {page.lines.map((line, i) => (
            <Prose key={i}>{line}</Prose>
          ))}
          <p className="font-body text-[13px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
            {page.note}
          </p>
        </div>
      )}

      {page.kind === 'availability' && (
        <div className="mt-8 space-y-6">
          <Prose>{page.standfirst}</Prose>
          <Facts facts={page.facts} />
          {onEnquire && (
            <button
              type="button"
              onClick={onEnquire}
              className="inline-flex items-center px-5 py-3 font-body text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ background: COPPER, border: `1px solid ${COPPER}`, color: CREAM }}
            >
              {page.action?.label}
            </button>
          )}
        </div>
      )}

      {page.kind === 'words' && (
        <div className="mt-8 space-y-7">
          {page.lines.map((line, i) => (
            <div key={i} className="pl-5" style={{ borderLeft: '2px solid rgba(184,115,51,0.5)' }}>
              <Prose>{line}</Prose>
            </div>
          ))}
          {page.quotes?.map((quote) => (
            <blockquote key={quote.label} className="pt-5" style={{ borderTop: `1px solid rgba(201,168,124,0.6)` }}>
              <Kicker>{quote.label}</Kicker>
              <p className="mt-2 font-heading text-[20px] leading-[1.5]" style={{ color: NAVY }}>
                “{quote.text}”
              </p>
            </blockquote>
          ))}
          {page.note && (
            <p className="font-body text-[13px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
              {page.note}
            </p>
          )}
        </div>
      )}

      {page.kind === 'materials' && (
        <ul className="mt-8" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
          {page.files.map((file) => (
            <li key={file.label} style={{ borderBottom: '1px solid rgba(184,115,51,0.24)' }}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 py-4 font-heading text-[17px] transition-colors hover:opacity-70"
                style={{ color: NAVY }}
              >
                {file.label}
                <span className="font-body text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
                  Open
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {page.kind === 'eight' && (
        <div className="mt-8">
          <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {page.slots.map((entry, i) => (
              <li key={i}>
                <p className="font-heading text-[11px] tracking-[0.18em]" style={{ color: COPPER }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                {entry ? (
                  <div className="mt-2 flex items-center gap-3">
                    {entry.nominee_avatar ? (
                      <img
                        src={entry.nominee_avatar}
                        alt=""
                        className="h-10 w-10 flex-none rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-heading text-[15px]"
                        style={{ background: '#EFE7DC', color: 'rgba(30,58,90,0.7)' }}
                      >
                        {(entry.nominee_name || '?').charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0 font-heading text-[14px] leading-tight" style={{ color: NAVY }}>
                      {entry.nominee_name}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 font-body text-[12px] uppercase tracking-[0.14em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
                    Open
                  </p>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-6 pt-4 font-body text-[13px] leading-relaxed" style={{ borderTop: '1px solid rgba(184,115,51,0.24)', color: 'rgba(30,58,90,0.6)' }}>
            {page.note}
          </p>
        </div>
      )}

      {page.kind === 'flightography' && (
        <div className="mt-8 space-y-7">
          {page.lines.map((line, i) => (
            <Prose key={i}>{line}</Prose>
          ))}
          {page.entries.length > 0 && (
            <div className="pt-5" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
              <Kicker>Career</Kicker>
              <ul className="mt-3 space-y-2">
                {page.entries.map((entry, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-heading text-[16px]" style={{ color: NAVY }}>
                      {entry.head}
                    </span>
                    <span className="font-body text-[12px]" style={{ color: 'rgba(30,58,90,0.5)' }}>
                      {entry.meta}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {page.education.length > 0 && (
            <div className="pt-5" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
              <Kicker>Education</Kicker>
              <ul className="mt-3 space-y-1.5">
                {page.education.map((entry, i) => (
                  <li key={i}>
                    <span className="font-heading text-[16px]" style={{ color: NAVY }}>
                      {entry.head}
                    </span>
                    {entry.meta && (
                      <span className="font-body text-[13px]" style={{ color: 'rgba(30,58,90,0.55)' }}>
                        {' '}· {entry.meta}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {page.stats.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-5" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
              {page.stats.map((stat) => (
                <span key={stat.label}>
                  <span className="font-body text-[10px] uppercase tracking-[0.16em]" style={{ color: LABEL }}>
                    {stat.label}{' '}
                  </span>
                  <span className="font-heading text-[15px]" style={{ color: NAVY }}>
                    {stat.value}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {page.kind === 'viral' && (
        <div className="mt-8 space-y-5 p-6" style={{ background: NAVY }}>
          {page.standfirst && (
            <p className="font-heading text-[40px] leading-none" style={{ color: CREAM }}>
              {page.standfirst}
              <span className="ml-2 font-body text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(250,248,245,0.55)' }}>
                impressions
              </span>
            </p>
          )}
          {page.lines.map((line, i) => (
            <p key={i} className="font-body text-[14px] leading-[1.8]" style={{ color: 'rgba(250,248,245,0.8)' }}>
              {line}
            </p>
          ))}
          {page.quote && (
            <p className="font-heading text-[18px] italic leading-snug" style={{ color: GOLD, borderLeft: `2px solid ${COPPER}`, paddingLeft: 14 }}>
              “{page.quote}”
            </p>
          )}
          {page.link && (
            <a
              href={page.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 font-body text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ border: '1px solid rgba(201,168,124,0.5)', color: GOLD }}
            >
              Read the post
            </a>
          )}
        </div>
      )}

      {page.kind === 'conferences' && (
        <ul className="mt-8" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
          {page.entries.map((entry, i) => (
            <li
              key={i}
              className="flex flex-wrap items-baseline justify-between gap-2 py-4"
              style={{ borderBottom: '1px solid rgba(184,115,51,0.24)' }}
            >
              <span className="font-heading text-[17px]" style={{ color: NAVY }}>
                {entry.head}
              </span>
              {entry.meta && (
                <span className="font-body text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
                  {entry.meta}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {page.kind === 'episode' && (
        <div className="mt-8 space-y-6">
          {page.lines.map((line, i) => (
            <Prose key={i}>{line}</Prose>
          ))}
          {page.episode && (
            <div className="pt-5" style={{ borderTop: '1px solid rgba(184,115,51,0.24)' }}>
              <Kicker>Production</Kicker>
              <ol className="mt-3 space-y-1.5">
                {EPISODE_TRACK.map((stage, i) => {
                  const done = trackIndex(page.status) >= i;
                  return (
                    <li key={stage.key} className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 flex-none rounded-full"
                        style={{ background: done ? COPPER : 'rgba(30,58,90,0.18)' }}
                      />
                      <span
                        className="font-body text-[13px]"
                        style={{ color: done ? NAVY : 'rgba(30,58,90,0.4)' }}
                      >
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 font-body text-[10px] uppercase tracking-[0.18em]" style={{ color: LABEL }}>
                {stageLabel(page.status)}
              </p>
            </div>
          )}
          {isOwner && onOpenEpisode && (
            <button
              type="button"
              onClick={onOpenEpisode}
              className="inline-block px-5 py-3 font-body text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ background: COPPER, border: `1px solid ${COPPER}`, color: CREAM }}
            >
              {page.action?.label}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// The accessible page reader.
//
// One page at a time, or every page of the record laid out one after another, so a
// reader can have the whole thing in a single scroll — the shape a reading list, a
// screen reader, or Safari's own reader extension expects.
export default function ProfileReader({ pages, isOwner, onEnquire, onOpenEpisode }) {
  const [index, setIndex] = useState(0);
  const [readAll, setReadAll] = useState(false);
  const topRef = useRef(null);

  const clamp = useCallback(
    (n) => Math.min(Math.max(n, 0), Math.max(pages.length - 1, 0)),
    [pages.length]
  );

  const go = useCallback(
    (dir) => {
      setIndex((i) => clamp(dir === 'next' ? i + 1 : i - 1));
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    },
    [clamp]
  );

  useEffect(() => {
    if (readAll) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go('prev');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, readAll]);

  const page = pages[index];

  return (
    <div style={{ background: CREAM }}>
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-10"
        style={{ borderBottom: '1px solid rgba(184,115,51,0.28)' }}
      >
        <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.26em]" style={{ color: LABEL }}>
          Reader · {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </p>
        <div className="flex items-center gap-0.5 rounded-full p-0.5" style={{ border: '1px solid rgba(30,58,90,0.16)' }}>
          <button
            type="button"
            onClick={() => setReadAll(false)}
            aria-pressed={!readAll}
            className="rounded-full px-3 py-1.5 font-body text-[9px] font-bold uppercase tracking-[0.18em] transition-colors"
            style={
              readAll
                ? { color: 'rgba(30,58,90,0.6)' }
                : { background: NAVY, color: CREAM }
            }
          >
            Page by page
          </button>
          <button
            type="button"
            onClick={() => setReadAll(true)}
            aria-pressed={readAll}
            className="rounded-full px-3 py-1.5 font-body text-[9px] font-bold uppercase tracking-[0.18em] transition-colors"
            style={
              readAll
                ? { background: NAVY, color: CREAM }
                : { color: 'rgba(30,58,90,0.6)' }
            }
          >
            Whole record
          </button>
        </div>
      </div>

      <div ref={topRef} className="mx-auto w-full max-w-[70ch] px-5 py-12 sm:px-8 sm:py-16">
        {readAll ? (
          <div className="space-y-16">
            {pages.map((p) => (
              <ReaderPage
                key={p.key}
                page={p}
                isOwner={isOwner}
                onEnquire={onEnquire}
                onOpenEpisode={onOpenEpisode}
              />
            ))}
          </div>
        ) : (
          <>
            <div aria-live="polite">
              <ReaderPage
                key={page.key}
                page={page}
                isOwner={isOwner}
                onEnquire={onEnquire}
                onOpenEpisode={onOpenEpisode}
              />
            </div>

            <nav
              aria-label="Pages of this record"
              className="mt-14 flex items-center justify-between gap-4 pt-6"
              style={{ borderTop: '1px solid rgba(184,115,51,0.28)' }}
            >
              <button
                type="button"
                onClick={() => go('prev')}
                disabled={index <= 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity disabled:opacity-30"
                style={{ border: `1px solid rgba(30,58,90,0.3)`, color: NAVY }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="font-heading text-[13px] tabular-nums" style={{ color: 'rgba(30,58,90,0.6)' }}>
                {String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={() => go('next')}
                disabled={index >= pages.length - 1}
                className="inline-flex items-center gap-2 px-4 py-2.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity disabled:opacity-30"
                style={{ background: NAVY, border: `1px solid ${NAVY}`, color: CREAM }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}