import { useEffect, useRef, useState } from 'react';
import { X, SendHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';
import ConciergeAction from '@/components/colony/ConciergeAction';
import ConciergeSuggestions from '@/components/colony/ConciergeSuggestions';
import ConciergeProfileDraft from '@/components/colony/ConciergeProfileDraft';
import { loadMissingFields, discoveryGuide, PROFILE_UPDATE_SCHEMA } from '@/components/colony/conciergeDiscovery';
import { ACTION_SCHEMA, ACTION_GUIDE, findPeople } from '@/components/colony/conciergeActions';
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
export default function ColonyConcierge({ onClose, brief = '' }) {
  const mem = useRef(null);
  const [line, setLine] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const user = useRef(null);
  const [action, setAction] = useState(null);
  const [draft, setDraft] = useState(null);
  const missing = useRef([]);

  useEffect(() => {
    const m = loadMemory();
    m.visits += 1;
    base44.auth.me().catch(() => null).then(u => {
      user.current = u;
      loadMissingFields(u?.email).then(f => { missing.current = f; });
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
    setAction(null);
    setDraft(null);
    setLine('Hmm, let me check the records...');
    const transcript = m.history.map(h => `${h.role}: ${h.text}`).join('\n') || '(none yet)';
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are Matthew Higa, founder of TOP 100 Aerospace & Aviation, speaking in first person as the concierge at the TOP 100 virtual campus (the Colony). This is a private 1:1 channel with one visitor.
Answer from information published on top100aero.space (search site:top100aero.space). If the site does not cover it, say so and point to where on the platform to look.
Visitor: ${user.current?.full_name || 'a guest (not signed in)'}${user.current ? '' : ' — gently mention signing in when it would help them'}. Visit number ${m.visits}. Topics they've already asked about: ${m.asked.join('; ') || 'none'}.
What the campus cast knows from the player's passport (shared knowledge; use it to personalise, never to judge, and never present inferences as verified facts): ${brief || 'nothing yet'}
Conversation so far:\n${transcript}
Rules: never repeat a point you already made in this conversation; build on what they already know and move them one step further in their journey (discover, nominate, claim a profile, attend events, request introductions). Keep it fresh, specific and useful. Campus rooms: Main Entrance, Main Hall, Innovation Expo (App Store), Space Pavilion (Events), Leadership Summit (Chamber of Commerce), Networking Lounge (AeroSync), Media Hub (Newsstand), Career Center (Classifieds). House style: a verified reputation graph and measurement platform, never an "awards list" or "ranking app"; "endorsers"/"community" not "followers", "endorsements" not "likes", "introductions" not "services"; the institution measures, it does not rank.
You and the visitor's Superagent act as one guide: don't just explain, do it. ${ACTION_GUIDE}
${user.current ? discoveryGuide(missing.current) : 'They are a guest: one gentle discovery question about their role in aerospace is welcome.'}
Also suggest 3 short, specific follow-ups tailored to who this visitor is and what they just said (things they could say or do next, e.g. an answer to your question or a concrete next action), never generic and never already asked. Keep each under 40 characters.

Visitor now asks: ${question}`,
      response_json_schema: {
        type: 'object',
        properties: { reply: { type: 'string', description: 'Plain text, warm, at most 3 short sentences, like a video game character' }, follow_ups: { type: 'array', items: { type: 'string' } }, action: ACTION_SCHEMA, profile_update: PROFILE_UPDATE_SCHEMA },
      },
    }).catch(() => null);
    const reply = res?.reply?.trim() || "Sorry, my terminal is down for a moment. Try asking again.";
    setLine(reply);
    if (user.current && res?.profile_update?.field && res.profile_update.value) setDraft(res.profile_update);
    const act = res?.action;
    if (act?.kind === 'find_person' && act.person_name) {
      setAction({ ...act, people: await findPeople(act.person_name).catch(() => []) });
    } else if (act?.kind === 'navigate') setAction(act);
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
      <div className="cc-scene relative min-h-0 flex-[0_1_26%] overflow-hidden rounded-md border-2 border-editorial-gold/70">
        <img src={SCENE} alt="Matthew Higa at the concierge desk" className="h-full w-full object-cover object-[45%_40%] [image-rendering:pixelated]" />
        <button type="button" onClick={onClose} aria-label="Leave the desk" className="absolute right-1.5 top-1.5 rounded bg-editorial-navy/80 p-1.5 text-editorial-cream"><X className="h-4 w-4" /></button>
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-editorial-navy/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-editorial-gold">Private channel</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DialogueBox speaker="Matthew Higa · Founder" text={line || '...'}>
          {!busy && <ConciergeProfileDraft draft={draft} onSaved={(f) => { missing.current = missing.current.filter(k => k !== f); }} />}
          {!busy && <ConciergeAction action={action} />}
        </DialogueBox>
        {!busy && <ConciergeSuggestions items={suggestions} onPick={ask} />}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-2 flex flex-none gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} maxLength={300} placeholder="Ask Matthew..." enterKeyHint="send" disabled={busy}
            className="min-w-0 flex-1 rounded-sm border-2 border-editorial-gold/60 bg-[#14283f] px-2 py-1.5 font-mono text-editorial-cream placeholder:text-editorial-cream/40 outline-none disabled:opacity-50" />
          <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="flex w-10 items-center justify-center rounded-sm border-2 border-editorial-cream bg-editorial-copper text-editorial-cream disabled:opacity-50"><SendHorizontal className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}