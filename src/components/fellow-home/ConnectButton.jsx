import { UserPlus, UserCheck, Check, X, Loader2 } from 'lucide-react';
import { useConnection } from '@/components/fellow-home/useConnections';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Renders on a public profile: Connect / Pending / Accept+Decline / Connected.
export default function ConnectButton({ viewer, targetEmail, targetName, targetAvatar, accent }) {
  const { state, busy, connect, accept, decline, disconnect } = useConnection(
    viewer,
    { email: targetEmail, name: targetName, avatar: targetAvatar }
  );

  if (!viewer?.email || !targetEmail || viewer.email === targetEmail || state === 'loading' || state === 'self') return null;

  const solid = (onClick, label, Icon) => (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ background: B.navy }}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />} {label}
    </button>
  );

  const ghost = (onClick, label, Icon) => (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70 disabled:opacity-60"
      style={{ color: B.navy, background: `${B.navy}0a` }}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />} {label}
    </button>
  );

  if (state === 'connected') {
    return (
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
          <UserCheck className="w-4 h-4" /> Connected
        </span>
        <button onClick={disconnect} disabled={busy} className="text-[10px] uppercase tracking-wider hover:opacity-70" style={{ color: B.muted }}>
          Disconnect
        </button>
      </div>
    );
  }

  if (state === 'pending_in') {
    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        {solid(accept, 'Accept', Check)}
        {ghost(decline, 'Decline', X)}
      </div>
    );
  }

  if (state === 'pending_out') {
    return (
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: B.muted }}>
          <UserPlus className="w-3.5 h-3.5" /> Request sent
        </span>
        <button onClick={disconnect} disabled={busy} className="text-[10px] uppercase tracking-wider hover:opacity-70" style={{ color: B.muted }}>
          Cancel
        </button>
      </div>
    );
  }

  return <div className="flex items-center justify-center mt-4">{solid(connect, 'Connect', UserPlus)}</div>;
}