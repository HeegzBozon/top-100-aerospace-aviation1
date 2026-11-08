import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useFollow } from '@/components/fellow-home/useFollows';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// One-way follow toggle — no acceptance, distinct from a mutual Connection.
export default function FollowButton({ viewer, targetId, targetEmail, targetName, targetAvatar, accent, inline = false, iconOnly = false }) {
  const target = { id: targetId, email: targetEmail, name: targetName, avatar: targetAvatar };
  const { following, busy, toggle } = useFollow(viewer, target);

  const isSelf = !!viewer?.email && !!targetEmail && viewer.email.toLowerCase() === targetEmail.toLowerCase();
  if (!viewer?.email || isSelf || !(targetId || targetEmail)) return null;

  // One key, no label: the follow held in a row of other keys, where the word would crowd
  // the name beside it. The state is carried by the bell, and named for a screen reader.
  if (iconOnly) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={`${following ? 'Unfollow' : 'Follow'} ${targetName || 'this Fellow'}`}
        title={following ? 'Following' : 'Follow'}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          color: following ? B.muted : B.navy,
          background: following ? `${B.navy}12` : `${B.navy}06`,
          border: `1px solid ${following ? B.border : `${B.navy}22`}`,
        }}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : following ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      </button>
    );
  }

  return (
    <div className={inline ? 'inline-flex' : 'flex items-center justify-center mt-2'}>
      <button
        onClick={toggle}
        disabled={busy}
        className={
          inline
            ? 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-60'
            : 'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70 disabled:opacity-60'
        }
        style={{
          color: following ? B.muted : B.navy,
          background: following ? `${B.navy}08` : 'transparent',
          border: `1px solid ${following ? B.border : `${B.navy}55`}`,
        }}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : following ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}