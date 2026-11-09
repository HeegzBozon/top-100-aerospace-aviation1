import { Bell, BellRing, Check, Eye, Loader2, Plus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// The three keys a name carries in the standings table: read the record, follow the Fellow,
// put the name on the ballot. The follow is the platform's own one-way follow — no acceptance,
// distinct from a connection made in AeroSync — and it stands against the profile, so a record
// with no address on it can be followed like any other. The state is handed in from the table,
// which reads the viewer's follows once for the whole column.

const KEY =
  'flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';
const QUIET = { background: `${brand.navy}0A`, border: `1px solid ${brand.navy}14`, color: brand.navy };
const HELD = {
  background: 'rgb(var(--editorial-copper-rgb) / 0.12)',
  border: '1px solid rgb(var(--editorial-copper-rgb) / 0.45)',
  color: 'rgb(var(--editorial-copper-rgb))',
};
// A name already on the Fellow's manifest stands in copper outright: the key is struck, not
// merely tinted, so the column can be read at a glance for what is still to be added.
const STRUCK = {
  background: 'rgb(var(--editorial-copper-rgb))',
  border: '1px solid rgb(var(--editorial-copper-rgb))',
  color: 'rgb(var(--editorial-cream-rgb))',
};

export default function StandingsRowKeys({
  person,
  canFollow = true,
  followed = false,
  busy = false,
  isSelf = false,
  onBallot = false,
  onToggleFollow,
  onView,
  onAdd,
}) {
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
        onClick={() => onToggleFollow(person)}
        disabled={busy || !canFollow}
        aria-pressed={followed}
        aria-label={
          canFollow
            ? `${followed ? 'Unfollow' : 'Follow'} ${person.name}`
            : 'Your own record'
        }
        title={canFollow ? (followed ? 'Following' : 'Follow') : isSelf ? 'This is you' : 'Follow unavailable'}
        className={`${KEY} disabled:opacity-50`}
        style={followed ? HELD : QUIET}
      >
        {busy ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : followed ? (
          <BellRing className="h-2.5 w-2.5" />
        ) : (
          <Bell className="h-2.5 w-2.5" />
        )}
      </button>

      {/* The ballot key reports its own state: a name already on the Fellow's ballot stands
          in copper with a struck check, and the row stays in the standings either way. */}
      <button
        type="button"
        onClick={() => !onBallot && onAdd(person)}
        disabled={onBallot}
        aria-pressed={onBallot}
        aria-label={
          onBallot ? `${person.name} is on your manifest` : `Add ${person.name} to your manifest`
        }
        title={onBallot ? 'On your manifest' : 'Add to manifest'}
        className={`${KEY} disabled:opacity-100`}
        style={onBallot ? STRUCK : QUIET}
      >
        {onBallot ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
      </button>
    </div>
  );
}