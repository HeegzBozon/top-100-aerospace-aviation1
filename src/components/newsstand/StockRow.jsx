import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';

// One paper off the stand: an article, a Fellow's dispatch, or a note pinned by the door.
// An article is read in the issue it ran in, so it leaves; a dispatch or a note is printed
// where it stands, so it opens under its own headline and the stand stays put.
export default function StockRow({ item, index, focused = false, open = false, onFocus, onOpen }) {
  const prints = !!item.body;

  return (
    <article style={{ borderTop: `1px solid ${C.border}` }}>
      <button
        type="button"
        onClick={() => {
          onFocus?.();
          onOpen?.();
        }}
        onMouseEnter={() => onFocus?.()}
        aria-expanded={prints ? open : undefined}
        className="flex w-full items-start gap-3 py-3.5 text-left"
        style={{
          background: focused ? 'rgba(184,115,51,0.07)' : 'transparent',
          transition: 'background 160ms ease',
        }}
      >
        <span
          className="mt-[2px] w-5 shrink-0 text-[9px] font-bold tabular-nums"
          style={{ color: focused ? C.copper : 'rgba(30,58,90,0.32)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[7.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
            {item.kicker}
          </span>
          <span className="mt-1 block font-heading text-[15px] leading-snug md:text-[16.5px]" style={{ color: C.navy }}>
            {item.title}
          </span>
          {item.meta ? (
            <span className="mt-0.5 block text-[9.5px]" style={{ color: C.muted }}>
              {item.meta}
            </span>
          ) : null}
          {!open && item.teaser ? (
            <span className="mt-1.5 block text-[11.5px] leading-relaxed line-clamp-2" style={{ color: C.muted }}>
              {item.teaser}
            </span>
          ) : null}
        </span>

        {prints ? (
          <ChevronDown
            className="mt-1 h-3.5 w-3.5 shrink-0"
            style={{ color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}
          />
        ) : (
          <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" style={{ color: C.muted }} />
        )}
      </button>

      {open && prints ? (
        <div className="pb-5 pl-8 pr-1">
          {item.html ? (
            <div
              className="text-[12.5px] leading-relaxed [&_a]:underline [&_a]:decoration-current [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h3]:mt-3 [&_img]:my-2 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2"
              style={{ color: C.navy }}
              dangerouslySetInnerHTML={{ __html: item.body }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed" style={{ color: C.navy }}>
              {item.body}
            </p>
          )}

          {item.link ? (
            <div className="mt-3">
              {item.link.startsWith('/') ? (
                <Link to={item.link} className={BTN_BASE} style={BTN.primary}>
                  Open <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className={BTN_BASE} style={BTN.primary}>
                  Open <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}