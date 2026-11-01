import { useEffect, useState } from 'react';

// A video-game dialogue box: a name plate, a double-ruled frame, and text typed out letter by letter.
// Tap the box to finish the line at once.
export default function DialogueBox({ speaker, text, children }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const t = setInterval(() => setShown(n => (n >= text.length ? (clearInterval(t), n) : n + 1)), 22);
    return () => clearInterval(t);
  }, [text]);
  const done = shown >= text.length;
  return (
    <div className="relative mt-4">
      <span className="absolute -top-3 left-3 z-10 rounded-sm border-2 border-editorial-cream bg-editorial-copper px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-editorial-cream">{speaker}</span>
      <div onClick={() => setShown(text.length)}
        className="rounded-md border-4 border-editorial-cream bg-editorial-navy p-1 shadow-[0_4px_0_rgba(0,0,0,0.5)]">
        <div className="rounded-sm border-2 border-editorial-gold/70 px-3 pb-3 pt-4">
          <p className="min-h-[4.5rem] whitespace-pre-line font-mono text-[13px] leading-relaxed text-editorial-cream">
            {text.slice(0, shown)}
            {done && <span className="hh-blink ml-1 text-editorial-gold">▼</span>}
          </p>
          {done && children}
        </div>
      </div>
    </div>
  );
}