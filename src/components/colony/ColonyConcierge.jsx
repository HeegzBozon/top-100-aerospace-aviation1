import { useEffect, useRef, useState } from 'react';
import { X, SendHorizontal, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';
import ConciergeSuggestions from '@/components/colony/ConciergeSuggestions';
import { loadMemory, saveMemory, greetingFor, guestSession } from '@/components/colony/conciergeMemory';

const SCENE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/eaf201fbe_PixelConciergeatAerospaceExpo.png';
const TOPICS = [
  'What is TOP 100 Aerospace & Aviation?',
  'How do nominations and the selection work?',
  'How do I claim my profile?',
  'Which rooms are on this campus?',
  'How do introductions work?',
  'What events are coming up?',
  'How is the community measured?',
  'Who can read this chat?',
];

// The concierge desk: an AI assistant of the platform, named as one. The prompt lives on
// the server (see the colonyConcierge function), so this panel can only ask questions —
// it cannot be pointed at another task or another person's name.
export default function ColonyConcierge({ onClose }) {
  const mem = useRef(null);
  const [line, setLine] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const user = useRef(null);

  useEffect(() => {
    const m = loadMemory();
    m.visits += 1;
    base44.auth.me().catch(() => null).then(u => {
      user.current = u;
      setLine(greetingFor(m, u?.full_name?.split(' ')[0]));
      m.lastVisit = new Date().toISOString();
      mem.current = m;
      saveMemory(m);
      setSuggestions(TOPICS.filter(t => !m.asked.includes(t)).slice(0, 3));
    });
  }, []);

  const ask = async (question) => {
    const m = mem.current;
    if (!question.trim() || busy || !m) return;
    setBusy(true);
    setLine('One moment — checking the platform record…');
    const res = await base44.functions.invoke('colonyConcierge', {
      message: question,
      history: m.history,
      guest_id: guestSession(),
    }).then(r => r.data).catch(() => null);
    const reply = res?.reply?.trim() || "I can't reach the record just now. Try again in a moment, or ask one of the team at the desk.";
    setLine(reply);
    if (res?.reply) {
      m.asked = [...m.asked.filter(a => a !== question), question];
      m.history = [...m.history, { role: 'Visitor', text: question }, { role: 'Concierge', text: reply }];
      saveMemory(m);
      setSuggestions((res.follow_ups || []).filter(f => !m.asked.includes(f)).slice(0, 3));
    }
    setQ('');
    setBusy(false);
  };

  return (
    // The desk is held to a reading measure rather than stretched across the whole picture:
    // on a desk it stands as one card in the tube, on the glass it fills it. Its scene, its
    // line and its field each take a fixed share, so the line rolls inside the box and the
    // way to answer never leaves the frame.
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-editorial-navy p-2 md:inset-y-3 md:mx-auto md:w-[480px] md:rounded-lg md:border md:border-editorial-copper/60 md:p-3 md:shadow-2xl">
      <div className="cc-scene relative h-[26%] max-h-[190px] min-h-[92px] shrink-0 overflow-hidden rounded-md border-2 border-editorial-gold/70">
        <img src={SCENE} alt="" className="h-full w-full object-cover object-[45%_40%] [image-rendering:pixelated]" />
        <button type="button" onClick={onClose} aria-label="Leave the desk" className="absolute right-1.5 top-1.5 rounded bg-editorial-navy/80 p-1.5 text-editorial-cream"><X className="h-4 w-4" /></button>
        <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-editorial-navy/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-editorial-gold">
          <Bot className="h-2.5 w-2.5" /> AI concierge
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mt-1 flex-none px-1 font-mono text-[10px] leading-snug text-editorial-cream/60">
          An AI assistant of TOP 100 Aerospace &amp; Aviation — not a person, and not a private line. Answers are
          generated automatically; don&apos;t type anything sensitive.
        </p>
        <DialogueBox speaker="AI Concierge" text={line || '...'}>
          {busy && <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-editorial-gold/70">Thinking…</span>}
        </DialogueBox>
        {!busy && <ConciergeSuggestions items={suggestions} onPick={ask} />}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-2 flex flex-none gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} maxLength={300} placeholder="Ask the concierge…" enterKeyHint="send" disabled={busy}
            aria-label="Ask the AI concierge"
            className="min-w-0 flex-1 rounded-sm border-2 border-editorial-gold/60 bg-[#14283f] px-2 py-1.5 font-mono text-editorial-cream placeholder:text-editorial-cream/40 outline-none disabled:opacity-50" />
          <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="flex w-10 items-center justify-center rounded-sm border-2 border-editorial-cream bg-editorial-copper text-editorial-cream disabled:opacity-50"><SendHorizontal className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}