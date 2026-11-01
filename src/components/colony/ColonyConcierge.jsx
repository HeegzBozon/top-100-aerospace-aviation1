import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';
import { loadMemory, saveMemory, greetingFor } from '@/components/colony/conciergeMemory';

const SCENE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/eaf201fbe_PixelConciergeatAerospaceExpo.png';
const TOPICS = [
  'What is TOP 100 Aerospace & Aviation?',
  'How do nominations and the selection work?',
  'How do I claim my profile?',
  'Which rooms are on this campus?',
  'How do introductions work?',
  'What events are coming up?',
  'How is the community measured?',
];

// The concierge desk: a private 1:1 channel between the visitor and the platform. It remembers
// the visitor's journey, so it greets them by where they left off and never repeats itself.
export default function ColonyConcierge({ onClose }) {
  const mem = useRef(null);
  const [line, setLine] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const user = useRef(null);

  useEffect(() => {
    document.body.classList.add('hh-badge');
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
    return () => document.body.classList.remove('hh-badge');
  }, []);

  const ask = async (question) => {
    const m = mem.current;
    if (!question.trim() || busy || !m) return;
    setBusy(true);
    setLine('Hmm, let me check the records...');
    const transcript = m.history.map(h => `${h.role}: ${h.text}`).join('\n') || '(none yet)';
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are Matthew Higa, founder of TOP 100 Aerospace & Aviation, speaking in first person as the concierge at the TOP 100 virtual campus (the Colony). This is a private 1:1 channel with one visitor.
Answer from information published on top100aero.space (search site:top100aero.space). If the site does not cover it, say so and point to where on the platform to look.
Visitor: ${user.current?.full_name || 'a guest (not signed in)'}${user.current ? '' : ' — gently mention signing in when it would help them'}. Visit number ${m.visits}. Topics they've already asked about: ${m.asked.join('; ') || 'none'}.
Conversation so far:\n${transcript}
Rules: never repeat a point you already made in this conversation; build on what they already know and move them one step further in their journey (discover, nominate, claim a profile, attend events, request introductions). Keep it fresh, specific and useful. Campus rooms: Main Entrance, Main Hall, Innovation Expo (App Store), Space Pavilion (Events), Leadership Summit (Chamber of Commerce), Networking Lounge (AeroSync), Media Hub (Newsstand), Career Center (Classifieds). House style: a verified reputation graph and measurement platform, never an "awards list" or "ranking app"; "endorsers"/"community" not "followers", "endorsements" not "likes", "introductions" not "services"; the institution measures, it does not rank.
Also suggest 3 short follow-up questions the visitor might ask next that they have NOT asked yet.

Visitor now asks: ${question}`,
      response_json_schema: {
        type: 'object',
        properties: { reply: { type: 'string', description: 'Plain text, warm, at most 3 short sentences, like a video game character' }, follow_ups: { type: 'array', items: { type: 'string' } } },
      },
    }).catch(() => null);
    const reply = res?.reply?.trim() || "Sorry, my terminal is down for a moment. Try asking again.";
    setLine(reply);
    if (res) {
      m.asked = [...m.asked.filter(a => a !== question), question];
      m.history = [...m.history, { role: 'Visitor', text: question }, { role: 'Matthew', text: reply }];
      saveMemory(m);
      setSuggestions((res.follow_ups || []).filter(f => !m.asked.includes(f)).slice(0, 3));
    }
    setQ('');
    setBusy(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-editorial-navy p-2">
      <div className="relative min-h-0 flex-[0_1_34%] overflow-hidden rounded-md border-2 border-editorial-gold/70">
        <img src={SCENE} alt="Matthew Higa at the concierge desk" className="h-full w-full object-cover object-[45%_40%] [image-rendering:pixelated]" />
        <button type="button" onClick={onClose} aria-label="Leave the desk" className="absolute right-1.5 top-1.5 rounded bg-editorial-navy/80 p-1.5 text-editorial-cream"><X className="h-4 w-4" /></button>
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-editorial-navy/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-editorial-gold">Private channel</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DialogueBox speaker="Matthew Higa · Founder" text={line || '...'}>
          {!busy && suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestions.map(t => (
                <button key={t} type="button" onClick={(e) => { e.stopPropagation(); ask(t); }}
                  className="block w-full text-left font-mono text-[11px] leading-snug text-editorial-gold hover:text-editorial-cream">
                  ▶ {t}
                </button>
              ))}
            </div>
          )}
        </DialogueBox>
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-2 flex flex-none gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} maxLength={300} placeholder="Ask Matthew..." enterKeyHint="send" disabled={busy}
            className="min-w-0 flex-1 rounded-sm border-2 border-editorial-gold/60 bg-[#14283f] px-2 py-1.5 font-mono text-editorial-cream placeholder:text-editorial-cream/40 outline-none disabled:opacity-50" />
          <button type="submit" disabled={busy} className="rounded-sm border-2 border-editorial-cream bg-editorial-copper px-3 font-mono text-xs font-bold text-editorial-cream disabled:opacity-50">ASK</button>
        </form>
      </div>
    </div>
  );
}