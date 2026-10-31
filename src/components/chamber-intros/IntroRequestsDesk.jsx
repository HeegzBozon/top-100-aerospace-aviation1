import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Inbox, Loader2, Mail, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const rows = (page) => (Array.isArray(page) ? page : page?.items || []);

const STATUS_LABEL = {
  pending: 'Awaiting reply',
  viewed: 'Read',
  responded: 'Answered',
  declined: 'Declined',
  expired: 'Lapsed',
};

const fmt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// The Fellow's own introductions desk. Two readings of one record: the requests that came
// to them, which they answer or decline, and the requests they made, which they can watch.
//
// This is the half of the introduction that used to be missing: the request was written
// down and then had nowhere to be answered. The chamber introduces — it never brokers —
// so answering is a reply in the Fellow's own hand, and the only record kept is that the
// introduction was answered.
export default function IntroRequestsDesk({ user, accent = B.navy }) {
  const [tab, setTab] = useState('received');
  const [state, setState] = useState({ loading: true, error: false, received: [], sent: [] });
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.email) {
      setState({ loading: false, error: false, received: [], sent: [] });
      return undefined;
    }
    let alive = true;
    setState((current) => ({ ...current, loading: true, error: false }));
    (async () => {
      try {
        const [received, sent] = await Promise.all([
          base44.entities.IntroRequest.filter(
            { recipient_email: user.email },
            { sort: '-created_date', limit: 50 },
          ),
          base44.entities.IntroRequest.filter(
            { requester_email: user.email },
            { sort: '-created_date', limit: 50 },
          ),
        ]);
        if (!alive) return;
        setState({ loading: false, error: false, received: rows(received), sent: rows(sent) });
      } catch {
        if (alive) setState({ loading: false, error: true, received: [], sent: [] });
      }
    })();
    return () => { alive = false; };
  }, [user?.email, reloadKey]);

  const respond = useCallback(async (request, status) => {
    setBusyId(request.id);
    try {
      await base44.entities.IntroRequest.update(request.id, {
        status,
        responded_date: new Date().toISOString(),
      });
      setReloadKey((key) => key + 1);
    } finally {
      setBusyId(null);
    }
  }, []);

  if (!user?.email) return null;

  const list = tab === 'received' ? state.received : state.sent;
  const pending = state.received.filter((request) => request.status === 'pending').length;

  return (
    <section className="mt-8 rounded-xl border bg-white" style={{ borderColor: B.border }}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: B.border }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your introductions desk
          </h3>
          <p className="mt-0.5 text-[11px]" style={{ color: B.muted }}>
            {pending > 0
              ? `${pending} request${pending === 1 ? '' : 's'} waiting on your reply.`
              : 'Introductions asked of you, and introductions you have asked for.'}
          </p>
        </div>
        <div className="flex gap-1 rounded-full p-0.5" style={{ background: `${accent}10` }}>
          {[
            { key: 'received', label: `Received${state.received.length ? ` · ${state.received.length}` : ''}` },
            { key: 'sent', label: `Sent${state.sent.length ? ` · ${state.sent.length}` : ''}` },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setTab(option.key)}
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors"
              style={tab === option.key ? { background: accent, color: '#fff' } : { color: accent }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {state.loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Reading your desk…</p>
        </div>
      ) : state.error ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <AlertCircle className="h-5 w-5" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Your desk could not be read just now.</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="text-xs font-semibold" style={{ color: accent }}>
            Try again
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <Inbox className="h-7 w-7" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>
            {tab === 'received' ? 'No one has asked to be introduced yet.' : 'You have not asked for an introduction yet.'}
          </p>
          <p className="max-w-sm text-xs leading-relaxed" style={{ color: B.muted }}>
            {tab === 'received'
              ? 'When a Fellow asks to be introduced to you through your availability, it arrives here with their note.'
              : 'Request an introduction from an availability above. It is answered by the member themselves.'}
          </p>
        </div>
      ) : (
        <ul>
          {list.map((request) => {
            const open = tab === 'received' && (request.status === 'pending' || request.status === 'viewed');
            return (
              <li key={request.id} className="border-t px-4 py-3 first:border-t-0" style={{ borderColor: B.border }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-snug" style={{ color: B.navy }}>
                      {request.target_title || 'Introduction'}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: B.muted }}>
                      {tab === 'received'
                        ? <>Asked by {request.requester_name || request.requester_email}</>
                        : <>Of {request.recipient_email}</>}
                      {fmt(request.created_date) ? ` · ${fmt(request.created_date)}` : ''}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                    style={{ background: `${accent}12`, color: accent }}
                  >
                    {STATUS_LABEL[request.status] || request.status}
                  </span>
                </div>

                {request.message ? (
                  <p className="mt-2 border-l-2 pl-2.5 text-[12px] leading-relaxed" style={{ borderColor: `${accent}44`, color: B.muted }}>
                    {request.message}
                  </p>
                ) : null}

                {tab === 'received' ? (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {request.requester_email ? (
                      <a
                        href={`mailto:${request.requester_email}?subject=${encodeURIComponent(`Introduction: ${request.target_title || ''}`)}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{ background: accent, color: '#fff' }}
                      >
                        <Mail className="h-3 w-3" /> Reply
                      </a>
                    ) : null}
                    {open ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === request.id}
                          onClick={() => respond(request, 'responded')}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
                          style={{ borderColor: `${accent}44`, color: accent }}
                        >
                          {busyId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Mark answered
                        </button>
                        <button
                          type="button"
                          disabled={busyId === request.id}
                          onClick={() => respond(request, 'declined')}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
                          style={{ color: B.muted }}
                        >
                          <X className="h-3 w-3" /> Decline
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}