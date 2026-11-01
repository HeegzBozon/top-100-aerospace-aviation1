import { useState } from 'react';

// An interview answer, typed in. Always optional: skipping still moves the story on.
export default function QuestAnswerInput({ onAnswer }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-2 p-3">
      <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 600))} rows={4}
        placeholder="In your own words…"
        className="w-full rounded border border-editorial-gold/40 bg-white/5 p-2 text-sm text-editorial-cream placeholder:text-editorial-cream/40" />
      <p className="text-[10px] text-editorial-cream/50">Saved to your passport for review. Nothing is published until you approve it.</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onAnswer('')} className="flex-1 rounded border border-editorial-cream/30 py-2 text-xs uppercase tracking-widest text-editorial-cream/70">Skip</button>
        <button type="button" disabled={!text.trim()} onClick={() => onAnswer(text.trim())}
          className="flex-1 rounded bg-editorial-copper py-2 text-xs uppercase tracking-widest text-editorial-cream disabled:opacity-40">Save answer</button>
      </div>
    </div>
  );
}