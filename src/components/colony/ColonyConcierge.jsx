import { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DialogueBox from '@/components/colony/DialogueBox';

const SCENE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/eaf201fbe_PixelConciergeatAerospaceExpo.png';
const GREETING = "Aloha, welcome to TOP 100 Aerospace & Aviation! I'm your concierge. Pick a topic, or ask me anything about the platform.";
const TOPICS = [
  'What is TOP 100 Aerospace & Aviation?',
  'How do nominations and the selection work?',
  'How do I claim my profile?',
  'Which rooms are on this campus?',
];

// The concierge desk: a pixel scene, and a dialogue-box guide that answers from top100aero.space.
export default function ColonyConcierge({ onClose }) {
  const [line, setLine] = useState(GREETING);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setLine('Hmm, let me check the records...');
    const res = await base44.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      prompt: `You are the friendly concierge at the TOP 100 Aerospace & Aviation virtual campus (the Colony). Answer ONLY from information published on top100aero.space (search site:top100aero.space). If the site does not cover it, say so and suggest where on the platform to look. Campus rooms: Main Entrance, Main Hall, Innovation Expo (App Store), Space Pavilion (Events/conferences), Leadership Summit (Chamber of Commerce), Networking Lounge (AeroSync), Media Hub (Newsstand), Career Center (Classifieds and career resources). House style: the platform is a verified reputation graph and measurement platform, never an "awards list" or "ranking app"; say "endorsers"/"community" not "followers", "endorsements" not "likes"; the institution measures, it does not rank. Reply in plain text, warm and concise, at most 3 short sentences, like a video game character.\n\nVisitor: ${question}`,
    }).catch(() => "Sorry, my terminal is down for a moment. Try asking again.");
    setLine(String(res).trim());
    setQ('');
    setBusy(false);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-editorial-navy/95 p-3">
      <div className="relative mx-auto w-full max-w-lg">
        <img src={SCENE} alt="The TOP 100 concierge at the desk" className="w-full rounded-md border-2 border-editorial-gold/70 [image-rendering:pixelated]" />
        <button type="button" onClick={onClose} aria-label="Leave the desk" className="absolute right-2 top-2 rounded bg-editorial-navy/80 p-1.5 text-editorial-cream"><X className="h-4 w-4" /></button>
        <DialogueBox speaker="Concierge" text={line}>
          {!busy && (
            <div className="mt-3 space-y-1">
              {TOPICS.map(t => (
                <button key={t} type="button" onClick={(e) => { e.stopPropagation(); ask(t); }}
                  className="group block w-full text-left font-mono text-[12px] text-editorial-gold hover:text-editorial-cream">
                  <span className="mr-1 opacity-0 group-hover:opacity-100">▶</span>{t}
                </button>
              ))}
              <form onSubmit={(e) => { e.preventDefault(); ask(q); }} onClick={e => e.stopPropagation()} className="flex gap-2 pt-2">
                <input value={q} onChange={e => setQ(e.target.value)} maxLength={300} placeholder="Ask the concierge..."
                  className="min-w-0 flex-1 rounded-sm border-2 border-editorial-gold/60 bg-[#14283f] px-2 py-1.5 font-mono text-editorial-cream placeholder:text-editorial-cream/40 outline-none" />
                <button type="submit" className="rounded-sm border-2 border-editorial-cream bg-editorial-copper px-3 font-mono text-xs font-bold text-editorial-cream">ASK</button>
              </form>
            </div>
          )}
        </DialogueBox>
      </div>
    </div>
  );
}