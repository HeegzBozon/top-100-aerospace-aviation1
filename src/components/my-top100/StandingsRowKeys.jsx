import { Bell, BellRing, Eye, Loader2, Plus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { useFollow } from '@/components/fellow-home/useFollows';

// The three keys a name carries in the standings table: read the record, follow the Fellow,
// put the name on the ballot. The follow is the platform's own one-way follow — no acceptance,
// distinct from a connection made in AeroSync. It stands on every row so the table reads as one
// column, and is held quiet — not removed — where the record carries no address to follow or
// the address is the reader's own, because a follow is keyed to an address.

const KEY =
  'flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';
const QUIET = { background: `${brand.navy}0A`, border: `1px solid ${brand.navy}14`, color: brand.navy };
const HELD = {
  background: 'rgb(var(--editorial-copper-rgb) / 0.12)',
  border: '1px solid rgb(var(--editorial-copper-rgb) / 0.45)',
  color: 'rgb(var(--editorial-copper-rgb))',
};

export default function StandingsRowKeys({ person, viewer, onView, onAdd }) {
  const targetEmail = person.nominee_email;
  const { following, busy, toggle } = useFollow(
    viewer,
    { email: targetEmail, name: person.name, avatar: person.avatar_url }
  );
  const isSelf = !!viewer?.email && viewer.email === targetEmail;
  const canFollow = !!viewer?.email && !!targetEmail && !isSelf;

  return (
    <div className="flex items-center justify-end gap-[3px]">
      <button
        type="button"
        onClick={() => onView(person)}
        aria-label={`Read ${person.name}'s record`}
        title="View profile"
        className={KEY}
        style={QUIET}
      >
        <Eye className="h-2.5 w-2.5" />
      </button>

      <button
        type="button"
        onClick={toggle}
        disabled={busy || !canFollow}
        aria-pressed={following}
        aria-label={
          canFollow
            ? `${following ? 'Unfollow' : 'Follow'} ${person.name}`
            : isSelf
              ? 'Your own record'
              : `No address on record, so ${person.name} cannot be followed`
        }
        title={canFollow ? (following ? 'Following' : 'Follow') : isSelf ? 'This is you' : 'No address on record'}
        className={`${KEY} disabled:opacity-50`}
        style={following ? HELD : QUIET}
      >
        {busy ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : following ? (
          <BellRing className="h-2.5 w-2.5" />
        ) : (
          <Bell className="h-2.5 w-2.5" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onAdd(person)}
        aria-label={`Add ${person.name} to your ballot`}
        title="Add to ballot"
        className={KEY}
        style={QUIET}
      >
        <Plus className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}