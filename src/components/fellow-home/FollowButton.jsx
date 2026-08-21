import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useFollow } from '@/components/fellow-home/useFollows';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// One-way follow toggle — no acceptance, distinct from a mutual Connection.
export default function FollowButton({ viewer, targetEmail, targetName, targetAvatar, accent }) {
  const { following, busy, toggle } = useFollow(
    viewer,
    { email: targetEmail, name: targetName, avatar: targetAvatar }
  );

  if (!viewer?.email || !targetEmail || viewer.email === targetEmail) return null;

  return (
    <div className="flex items-center justify-center mt-2">
      <button
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70 disabled:opacity-60"
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