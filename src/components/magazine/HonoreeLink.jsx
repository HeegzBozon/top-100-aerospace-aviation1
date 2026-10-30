import { Link } from 'react-router-dom';

// A name or a face in the book, and the way through to the person behind it.
//
// The magazine is a reading surface, not a directory — but a portrait that is only a
// portrait is a dead end in a book that measures people. Every plate, opening spread and
// profile page therefore carries the route to the Fellow's profile, where her
// verification, her Eight and her AeroSync reach live. Where an edition carries no
// nominee id (a stored page composed by hand), the link simply is not drawn: a name is
// never pointed at a profile that may not be hers.

export const profilePath = (nomineeId) => (nomineeId ? `/profiles/${nomineeId}` : null);

// The edition's own roll of names, keyed by the title each article prints. Pages hold
// names, not ids; this is what turns one into the other without a second read.
export function nomineeIndex(articles = []) {
  const byTitle = new Map();
  articles.forEach((article) => {
    const title = String(article?.title || '').trim();
    if (title && article?.nominee_id) byTitle.set(title, article.nominee_id);
  });
  return byTitle;
}

export const resolveNomineeId = (candidate, name, byTitle) =>
  candidate || byTitle.get(String(name || '').trim()) || null;

export default function HonoreeLink({ nomineeId, name, className = '', children, ...rest }) {
  const to = profilePath(nomineeId);
  if (!to) return <div className={className} {...rest}>{children}</div>;
  return (
    <Link
      to={to}
      className={className}
      aria-label={name ? `Open ${name}'s profile` : 'Open profile'}
      {...rest}
    >
      {children}
    </Link>
  );
}