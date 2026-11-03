import React from 'react';
import { useNavigate } from 'react-router-dom';

// A destination inside the issue.
//
// A page carries addresses the reader is meant to act on — the ballot, a patron inquiry, the
// campus — and they are written the way an address is written in print. When the address is
// the publication's own, the reader is walked to that surface inside the app; when it belongs
// to somebody else, the browser opens it in a new tab so the issue is never lost by a click.
const OWN_HOSTS = ['top100aero.space', 'top100aerospaceandaviation.base44.app'];

const isOwnHost = (host) => {
  if (!host) return false;
  const here = typeof window !== 'undefined' ? window.location.hostname : '';
  return host === here || OWN_HOSTS.some((own) => host === own || host.endsWith(`.${own}`));
};

export function resolveDestination(href) {
  const raw = String(href || '').trim();
  if (!raw) return null;
  if (raw.startsWith('/')) return { to: raw };
  try {
    const url = new URL(raw);
    if (!isOwnHost(url.hostname)) return { href: raw };
    return { to: `${url.pathname}${url.search}${url.hash}` || '/' };
  } catch {
    return null;
  }
}

export default function MagazineLink({ href, className, style, children, onClick, ...rest }) {
  const navigate = useNavigate();
  const destination = resolveDestination(href);
  if (!destination) return <span className={className} style={style}>{children}</span>;

  // The book turns on a press and a drag; a press on a link is the reader reaching for the
  // destination, so the gesture stops at the link and never becomes a page turn.
  const holdStill = (event) => event.stopPropagation();

  if (destination.to) {
    return (
      <a
        href={destination.to}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick?.(event);
          navigate(destination.to);
        }}
        onMouseDown={holdStill}
        onTouchStart={holdStill}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={destination.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => { event.stopPropagation(); onClick?.(event); }}
      onMouseDown={holdStill}
      onTouchStart={holdStill}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </a>
  );
}

// An address set inside a paragraph is still an address: it reads as a link and behaves as
// one, so a reader never has to copy a URL out of a magazine page by hand.
const ADDRESS = /(https?:\/\/[^\s<>"]+)/g;
const TAIL = /[.,;:!?)\]]+$/;

export function TextWithLinks({ text, linkClassName, linkStyle }) {
  const source = String(text || '');
  if (!source) return null;
  const pieces = source.split(ADDRESS);
  return (
    <>
      {pieces.map((piece, i) => {
        if (!/^https?:\/\//.test(piece)) return piece;
        const tail = piece.match(TAIL)?.[0] || '';
        const clean = tail ? piece.slice(0, -tail.length) : piece;
        return (
          <React.Fragment key={i}>
            <MagazineLink
              href={clean}
              className={linkClassName}
              style={linkStyle}
            >
              {clean.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </MagazineLink>
            {tail}
          </React.Fragment>
        );
      })}
    </>
  );
}