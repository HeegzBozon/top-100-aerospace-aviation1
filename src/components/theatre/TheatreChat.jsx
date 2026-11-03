import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { THEATRE } from './theatreConfig';

// The room chat: the seats talking to each other while the mission is on the pad. It is one
// room per party, and an open room per mission for a launch nobody has hosted yet, so the
// theatre always has a place to talk. Lines are kept, not lost with the tab.
export default function TheatreChat({ launchId, partyId = '', title = 'Room chat', hint = '' }) {
  const [me, setMe] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState('loading');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    const rows = await base44.entities.LaunchPartyMessage.filter(
      partyId ? { party_id: partyId } : { launch_id: launchId, party_id: { $exists: false } },
      '-sent_at',
      80,
    );
    setMessages([...rows].reverse());
    setState('ready');
  }, [partyId, launchId]);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((user) => alive && setMe(user))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (me === undefined) return undefined;
    if (!me) {
      setState('locked');
      return undefined;
    }
    let alive = true;
    load().catch(() => alive && setState('failed'));
    const unsubscribe = base44.entities.LaunchPartyMessage.subscribe((event) => {
      const row = event.data || {};
      const here = partyId ? row.party_id === partyId : row.launch_id === launchId && !row.party_id;
      if (!here) return;
      if (event.type === 'delete') {
        setMessages((prev) => prev.filter((m) => m.id !== row.id));
        return;
      }
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    });
    return () => {
      alive = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [me, load, partyId, launchId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending || !me) return;
    setSending(true);
    try {
      const draft = {
        launch_id: launchId,
        author_email: me.email,
        author_name: me.full_name || me.email,
        text: body.slice(0, 600),
        sent_at: new Date().toISOString(),
      };
      if (partyId) draft.party_id = partyId;
      const created = await base44.entities.LaunchPartyMessage.create(draft);
      setMessages((prev) => (prev.some((m) => m.id === created.id) ? prev : [...prev, created]));
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg"
      style={{ background: THEATRE.plate, border: `1px solid ${THEATRE.line}` }}
    >
      <div className="flex flex-none items-baseline justify-between gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${THEATRE.line}` }}>
        <p className="truncate font-heading text-sm" style={{ color: THEATRE.ink }}>{title}</p>
        {hint && <p className="flex-none text-[9px] uppercase tracking-[0.16em]" style={{ color: THEATRE.soft }}>{hint}</p>}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-2.5">
        {state === 'loading' && (
          <p className="flex items-center gap-1.5 text-[11px]" style={{ color: THEATRE.soft }}>
            <Loader2 className="h-3 w-3 animate-spin" /> Opening the room
          </p>
        )}
        {state === 'locked' && (
          <p className="py-6 text-center text-[11px] leading-relaxed" style={{ color: THEATRE.soft }}>
            The room is for signed-in Fellows. Sign in from the title screen and your seat is waiting.
          </p>
        )}
        {state === 'failed' && (
          <p className="py-6 text-center text-[11px]" style={{ color: THEATRE.soft }}>The room could not be opened. Try again in a moment.</p>
        )}
        {state === 'ready' && messages.length === 0 && (
          <p className="py-6 text-center text-[11px] leading-relaxed" style={{ color: THEATRE.soft }}>
            The room is quiet. Say what you are watching for.
          </p>
        )}
        {messages.map((m) => {
          const mine = me && m.author_email === me.email;
          return (
            <div key={m.id} className={mine ? 'text-right' : ''}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: THEATRE.gold }}>
                {mine ? 'You' : m.author_name || 'Fellow'}
              </p>
              <p
                className="mt-0.5 inline-block max-w-[86%] break-words rounded px-2 py-1 text-left text-[12px] leading-snug"
                style={{
                  background: mine ? THEATRE.copper : 'rgba(255,255,255,0.07)',
                  color: mine ? '#fdf8f0' : THEATRE.body,
                }}
              >
                {m.text}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="flex flex-none gap-1.5 px-2 py-2" style={{ borderTop: `1px solid ${THEATRE.line}` }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!me}
          placeholder={me ? 'Say something to the room' : 'Sign in to join the room'}
          aria-label="Message the room"
          className="min-w-0 flex-1 rounded px-2.5 py-1.5 text-[12px] outline-none disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.08)', color: THEATRE.ink }}
        />
        <button
          type="submit"
          disabled={!me || sending || !text.trim()}
          aria-label="Send"
          className="rounded px-2.5 disabled:opacity-40"
          style={{ background: THEATRE.copper, color: '#fdf8f0' }}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}