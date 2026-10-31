import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';
import { TYPE_TAGS } from './classifiedsConfig';

const paragraphs = (body) =>
  String(body || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

// One notice, read whole. It takes the glass on its own so a hand can read it down the
// page; the ring scrolls the glass here rather than walking anything, and BACK returns
// to the board exactly where it was left.
export default function ClassifiedDetail({ listing, onClose }) {
  const body = paragraphs(listing.body);

  return (
    <div className="mt-3">
      <button type="button" onClick={onClose} className={BTN_BASE} style={BTN.outline}>
        <ArrowLeft className="h-3.5 w-3.5" /> The board
      </button>

      <article
        className="mt-2 rounded-xl px-3.5 py-3.5"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: C.copper }}>
            {TYPE_TAGS[listing.type]}
          </p>
          {listing.when ? (
            <p className="text-[8.5px] uppercase tracking-[0.12em]" style={{ color: C.muted }}>{listing.when}</p>
          ) : null}
        </div>

        <h2 className="mt-1 font-heading text-[20px] font-semibold leading-tight" style={{ color: C.navy }}>
          {listing.title}
        </h2>
        {listing.meta ? (
          <p className="mt-1 text-[11.5px]" style={{ color: C.muted }}>{listing.meta}</p>
        ) : null}

        {listing.sub ? (
          <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: C.navy }}>{listing.sub}</p>
        ) : null}

        {body.map((part, index) => (
          <p key={index} className="mt-2 text-[12px] leading-relaxed" style={{ color: `${C.navy}E6` }}>
            {part}
          </p>
        ))}

        {listing.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {listing.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="rounded-full px-2 py-0.5 text-[9.5px] uppercase tracking-[0.1em]"
                style={{ background: 'rgba(30,58,90,0.05)', color: C.muted }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {listing.profileId ? (
            <Link to={`/profiles/${listing.profileId}`} className={BTN_BASE} style={BTN.primary}>
              The record <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : null}
          {listing.href ? (
            <a
              href={listing.href}
              target={/^https?:/i.test(listing.href) ? '_blank' : undefined}
              rel={/^https?:/i.test(listing.href) ? 'noopener noreferrer' : undefined}
              className={BTN_BASE}
              style={BTN.primary}
            >
              Answer it <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : null}
          {listing.by ? (
            <p className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>
              Put up by {listing.by}
            </p>
          ) : null}
        </div>

        <p className="mt-3 border-t pt-2 text-[10px] leading-relaxed" style={{ borderColor: C.border, color: C.muted }}>
          Nothing on this board is priced, featured or ordered by payment. An introduction is made
          privately, through the person&rsquo;s own record.
        </p>
      </article>
    </div>
  );
}