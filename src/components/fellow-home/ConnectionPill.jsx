import { Check, Loader2, UserCheck, UserPlus, X } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Presentational connection affordance for one person in a list. State comes
// from a batch map (useConnectionMap) rather than a read per row, so it renders
// as a compact inline pill instead of a centered stack.
export default function ConnectionPill({ record, otherEmail, viewerEmail, viewerName, viewerAvatar, personName, personAvatar, accent, busy, onConnect, onAccept, onDecline, onDisconnect }) {
  if (!viewerEmail || !otherEmail || viewerEmail === otherEmail) return null;

  const pill = (onClick, label, Icon, filled) => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-90 disabled:opacity-60"
      style={filled ? { background: B.navy, color: '#fff' } : { background: `${B.navy}0a`, color: B.navy }}
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />} {label}
    </button>
  );

  if (!record || record.status === 'declined') {
    return pill(
      () => onConnect({ email: otherEmail, name: personName, avatar: personAvatar, viewerName, viewerAvatar }),
      'Connect',
      UserPlus,
      true
    );
  }

  if (record.status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: accent }}>
          <UserCheck className="w-3 h-3" /> Connected
        </span>
        <button
          type="button"
          onClick={() => onDisconnect(record, otherEmail)}
          disabled={busy}
          className="text-[9px] uppercase tracking-[0.1em] hover:opacity-70 disabled:opacity-50"
          style={{ color: B.muted }}
        >
          Remove
        </button>
      </span>
    );
  }

  // Pending, incoming — the viewer carries the decision.
  if (record.requester_email && record.requester_email !== viewerEmail) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {pill(() => onAccept(record, otherEmail), 'Accept', Check, true)}
        {pill(() => onDecline(record, otherEmail), 'Decline', X, false)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: B.muted }}>
      <UserPlus className="w-3 h-3" /> Requested
    </span>
  );
}