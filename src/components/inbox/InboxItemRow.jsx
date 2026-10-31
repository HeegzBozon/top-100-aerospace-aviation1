import { Link } from 'react-router-dom';
import { Check, Clock, Pin, RotateCcw } from 'lucide-react';

const later = (days) => new Date(Date.now() + days * 86400000).toISOString();

// One item: the key fact on the card, and Done / Snooze / Pin as tap paths.
export default function InboxItemRow({ item, state, onSet, active, onOpen }) {
  const done = state?.done;
  const pinned = state?.pinned;
  const key = 'flex h-8 w-8 items-center justify-center rounded border border-editorial-navy/15 text-editorial-navy/70 hover:border-editorial-copper hover:text-editorial-copper';
  return (
    <li id={`inbox-row-${item.key}`} className={`-mx-3 flex items-center gap-1.5 border-b border-l-2 border-b-editorial-navy/10 px-3 py-2.5 md:-mx-4 md:gap-3 md:px-4 md:py-3 last:border-b-0 ${active ? 'border-l-editorial-copper bg-editorial-sand/60' : 'border-l-transparent'}`}>
      <Link to={item.to || '#'} onClick={item.enquiry ? (e) => { e.preventDefault(); onOpen(item.key); } : undefined} className="min-w-0 flex-1 pr-1">
        <p className="truncate font-body text-sm font-semibold text-editorial-navy">
          {pinned && <Pin className="mr-1 inline h-3 w-3 text-editorial-copper" />}{item.title}
        </p>
        <p className="truncate font-body text-xs text-editorial-label">{item.fact}</p>
      </Link>
      {done ? (
        <button aria-label="Move back to inbox" className={key} onClick={() => onSet(item.key, { done: false })}><RotateCcw className="h-4 w-4" /></button>
      ) : (
        <>
          <button aria-label={pinned ? 'Unpin' : 'Pin'} className={key} onClick={() => onSet(item.key, { pinned: !pinned })}><Pin className="h-4 w-4" /></button>
          <button aria-label="Snooze until tomorrow" className={key} onClick={() => onSet(item.key, { snoozed_until: later(1) })}><Clock className="h-4 w-4" /></button>
          <button aria-label="Mark as done" className={key} onClick={() => onSet(item.key, { done: true, snoozed_until: null })}><Check className="h-4 w-4" /></button>
        </>
      )}
    </li>
  );
}