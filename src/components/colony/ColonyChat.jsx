import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

// The Members Lounge chat: live messages between everyone in the Colony right now. Not stored.
export default function ColonyChat({ messages, onSend, onClose }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  // Scroll the list itself, never its ancestors, so the glass never shifts under the hardware.
  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages.length]);
  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t.slice(0, 500));
    setText('');
  };
  return (
    <div className="absolute inset-2 z-30 mx-auto flex max-w-sm flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="flex flex-none items-center justify-between border-b border-editorial-copper/50 px-3 py-2">
        <div className="min-w-0">
          <p className="font-heading text-base text-editorial-cream">Members Lounge</p>
          <p className="text-[10px] uppercase tracking-widest text-editorial-gold">Live with everyone in the Colony</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="text-editorial-cream/70"><X className="h-4 w-4" /></button>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-xs text-editorial-cream/60">The lounge is quiet. Say hello to the room.</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.mine ? 'text-right' : ''}>
            <p className="text-[10px] font-semibold text-editorial-gold">{m.mine ? 'You' : m.name}</p>
            <p className={`inline-block max-w-[85%] break-words text-left rounded px-2.5 py-1.5 text-sm ${m.mine ? 'bg-editorial-copper text-editorial-cream' : 'bg-white/10 text-editorial-cream'}`}>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-none gap-2 border-t border-editorial-copper/50 p-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Message the lounge"
          className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-editorial-cream placeholder:text-editorial-cream/40 outline-none" />
        <button type="submit" aria-label="Send" className="rounded bg-editorial-copper px-3 text-editorial-cream"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}