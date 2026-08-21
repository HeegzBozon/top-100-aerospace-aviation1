import { Users, UserMinus, Check, X, Loader2 } from 'lucide-react';
import { useMyConnections } from '@/components/fellow-home/useConnections';
import { B } from '@/components/fellow-home/fellowHomeConfig';

function Avatar({ src, name }) {
  return src ? (
    <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${B.navy}14`, color: B.navy }}>
      {name?.charAt(0) || '?'}
    </div>
  );
}

export default function ConnectionsModule({ user, accent }) {
  const { incoming, accepted, loading, accept, decline, disconnect } = useMyConnections(user?.email);
  const ownerEmail = user?.email;

  const other = (c) => c.requester_email === ownerEmail
    ? { name: c.recipient_name, avatar: c.recipient_avatar_url, email: c.recipient_email }
    : { name: c.requester_name, avatar: c.requester_avatar_url, email: c.requester_email };

  const total = incoming.length + accepted.length;

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] flex items-center gap-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          <Users className="w-4 h-4" style={{ color: accent }} /> Connections
        </h2>
        <span className="text-[11px]" style={{ color: B.muted }}>{accepted.length} connected</span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" style={{ color: B.muted }} /></div>
        ) : total === 0 ? (
          <div className="py-6 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: B.navy }} />
            <p className="text-xs" style={{ color: B.muted }}>No connections yet.</p>
            <p className="text-[11px] mt-1" style={{ color: B.muted }}>Visit a Fellow's profile to connect.</p>
          </div>
        ) : (
          <>
            {incoming.length > 0 && (
              <div className="space-y-2 pb-3" style={{ borderBottom: `1px solid ${B.border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
                  {incoming.length} pending request{incoming.length > 1 ? 's' : ''}
                </p>
                {incoming.map((c) => {
                  const o = other(c);
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <Avatar src={o.avatar} name={o.name} />
                      <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: B.navy }}>{o.name || o.email}</span>
                      <button onClick={() => accept(c.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white" style={{ background: B.navy }}>
                        <Check className="w-3 h-3" /> Accept
                      </button>
                      <button onClick={() => decline(c.id)} className="text-[11px] font-semibold hover:opacity-70" style={{ color: B.muted }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {accepted.length > 0 && (
              <div className="space-y-2">
                {accepted.map((c) => {
                  const o = other(c);
                  return (
                    <div key={c.id} className="group flex items-center gap-3">
                      <Avatar src={o.avatar} name={o.name} />
                      <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: B.navy }}>{o.name || o.email}</span>
                      <button onClick={() => disconnect(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: B.muted }}>
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}