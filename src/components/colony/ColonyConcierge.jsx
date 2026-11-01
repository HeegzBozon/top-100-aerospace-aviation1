import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';

const SCENE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/eaf201fbe_PixelConciergeatAerospaceExpo.png';
const GREETING = "Aloha, I'm Matthew Higa, founder of TOP 100 Aerospace & Aviation and your concierge. This desk is a private line, just you and me. Pick a topic, or type a question.";
const TOPICS = [
  'What is TOP 100 Aerospace & Aviation?',
  'How do nominations and the selection work?',
  'How do I claim my profile?',
  'Which rooms are on this campus?',
];

// The concierge desk: a private 1:1 channel between the visitor and the platform.
// While it is open the wheel is put away and the device keyboard does the talking.
export default function ColonyConcierge({ onClose }) {
  const [line, setLine] = useState(GREETING);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.classList.add('hh-badge');
    return () => document.body.classList.remove('hh-badge');
  }, []);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setLine('Hmm, let me check the records...');
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are Matthew Higa, founder of TOP 100 Aerospace & Aviation, speaking in first person as the friendly concierge at the TOP 100 Aerospace & Aviation virtual campus (the Colony). Answer ONLY from information published on top100aero.space (search site:top100aero.space). If the site does not cover it, say so and suggest where on the platform to look. Campus rooms: Main Entrance, Main Hall, Innovation Expo (App Store), Space Pavilion (Events/conferences), Leadership Summit (Chamber of Commerce), Networking Lounge (AeroSync), Media Hub (Newsstand), Career Center (Classifieds and career resources). House style: the platform is a verified reputation graph and measurement platform, never an "awards list" or "ranking app"; say "endorsers"/"community" not "followers", "endorsements" not "likes"; the institution measures, it does not rank. Reply in plain text, warm and concise, at most 3 short sentences, like a video game character.\n\nVisitor: ${question}`,
    }).catch(() => "Sorry, my terminal is down for a moment. Try asking again.");
    setLine(String(res).trim());
    setQ('');
    setBusy(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-editorial-navy p-2">
      <div className="relative min-h-0 flex-[0_1_38%] overflow-hidden rounded-md border-2 border-editorial-gold/70">
        <img src={SCENE} alt="The TOP 100 concierge at the desk" className="h-full w-full object-cover object-[45%_40%] [image-rendering:pixelated]" />
        <button type="button" onClick={onClose} aria-label="Leave the desk" className="absolute right-1.5 top-1.5 rounded bg-editorial-navy/80 p-1.5 text-editorial-cream"><X className="h-4 w-4" /></button>
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-editorial-navy/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-editorial-gold">Private channel</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DialogueBox speaker="Matthew Higa · Founder" text={line}>
          {!busy && (
            <div className="mt-2 space-y-1">
              {TOPICS.map(t => (
                <button key={t} type="button" onClick={(e) => { e.stopPropagation(); ask(t); }}
                  className="block w-full truncate text-left font-mono text-[11px] text-editorial-gold hover:text-editorial-cream">
                  ▶ {t}
                </button>
              ))}
            </div>
          )}
        </DialogueBox>
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-2 flex flex-none gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} maxLength={300} placeholder="Ask the concierge..." enterKeyHint="send" disabled={busy}
            className="min-w-0 flex-1 rounded-sm border-2 border-editorial-gold/60 bg-[#14283f] px-2 py-1.5 font-mono text-editorial-cream placeholder:text-editorial-cream/40 outline-none disabled:opacity-50" />
          <button type="submit" disabled={busy} className="rounded-sm border-2 border-editorial-cream bg-editorial-copper px-3 font-mono text-xs font-bold text-editorial-cream disabled:opacity-50">ASK</button>
        </form>
      </div>
    </div>
  );
}