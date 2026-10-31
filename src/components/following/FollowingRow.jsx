import { Check, Heart, ListPlus, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

// One person kept, and where she stands with the Fellow who keeps her.
//
// The left is who she is, the middle is what the platform knows of her, and the right is
// the crossover: the card the Fellow already holds, or one press to keep her. A contact is
// shown here only because it is theirs — the ledger never reads another Fellow's rolodex.
export default function FollowingRow({ person, contact, inList, listPosition, busy, keeping, onKeep, onList }) {
  const initials = (person.name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const day = person.created_date ? new Date(person.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <article className="flex items-start gap-2.5 rounded-lg px-2.5 py-2.5" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      {person.avatar ? (
        <img
          src={person.avatar}
          alt=""
          className="h-10 w-10 flex-none rounded-lg object-cover"
          style={{ objectPosition: '50% 22%' }}
        />
      ) : (
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-lg text-[12px] font-semibold"
          style={{ background: 'rgba(184,115,51,0.14)', color: '#B87333' }}
        >
          {initials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold leading-tight" style={{ color: '#1E3A5A' }}>
          {person.name}
        </p>
        <p className="mt-0.5 truncate text-[10px]" style={{ color: 'rgba(30,58,90,0.55)' }}>
          {person.email || 'No address on her record'}
          {day ? ` · followed ${day}` : ''}
        </p>

        {contact ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9.5px]" style={{ color: 'rgba(30,58,90,0.7)' }}>
            <span
              className="rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: 'rgba(30,58,90,0.07)', color: '#1E3A5A' }}
            >
              In your rolodex
            </span>
            <span className="truncate">
              {[contact.role_title, contact.company].filter(Boolean).join(' · ') || contact.email}
            </span>
            <Link to="/aerosync/people" className="font-bold uppercase tracking-[0.12em]" style={{ color: '#B87333' }}>
              Open
            </Link>
          </p>
        ) : (
          <p className="mt-1.5 text-[9.5px]" style={{ color: 'rgba(30,58,90,0.5)' }}>
            No card held for her yet.
          </p>
        )}
      </div>

      <div className="flex flex-none flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={onList}
          disabled={inList}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-60"
          style={{
            color: inList ? '#1E3A5A' : '#FAF8F5',
            background: inList ? 'rgba(30,58,90,0.07)' : '#1E3A5A',
          }}
        >
          {inList ? <Check className="h-3 w-3" /> : <ListPlus className="h-3 w-3" />}
          {inList ? `No. ${listPosition || '—'}` : 'My TOP 100'}
        </button>

        {contact ? null : (
          <button
            type="button"
            onClick={onKeep}
            disabled={keeping || !person.email}
            title={person.email ? 'Keep her card in your rolodex' : 'No address on her record'}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] disabled:opacity-50"
            style={{ color: '#B87333', border: '1px solid rgba(184,115,51,0.5)' }}
          >
            {keeping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Rolodex
          </button>
        )}

        {busy ? <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#B87333' }} /> : null}
      </div>
    </article>
  );
}