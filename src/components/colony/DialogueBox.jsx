import { useEffect, useRef, useState } from 'react';

// A video-game dialogue box: a name plate, a double-ruled frame, and text typed out letter by letter.
// Tap the box to finish the line at once. It fills the space it is given and scrolls inside itself.
// Whatever the line leads to — a key, a name field, a choice — is held in the frame's foot,
// outside the roll: a long line can never push the way on out of the picture.
export default function DialogueBox({ speaker, text, children }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    const t = setInterval(() => setShown(n => (n >= text.length ? (clearInterval(t), n) : n + 1)), 22);
    return () => clearInterval(t);
  }, [text]);
  const done = shown >= text.length;
  const scroller = useRef(null);
  // Follow the line as it types, then bring whatever the box holds below it into view.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = done ? el.scrollTop : el.scrollHeight;
  }, [shown, done]);
  return (
    <div className="relative mt-3 flex min-h-0 flex-1 flex-col">
      <span className="absolute -top-2.5 left-3 z-10 rounded-sm border-2 border-editorial-cream bg-editorial-copper px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-editorial-cream">{speaker}</span>
      <div className="flex min-h-0 flex-1 flex-col rounded-md border-4 border-editorial-cream bg-editorial-navy p-1 shadow-[0_3px_0_rgba(0,0,0,0.5)]">
        <div onClick={() => setShown(text.length)} className="min-h-0 flex-1 overflow-y-auto break-words rounded-sm border-2 border-editorial-gold/70 px-3 pb-2 pt-3">
          <p className="whitespace-pre-line font-mono text-[12px] leading-relaxed text-editorial-cream">
            {text.slice(0, shown)}
            {done && <span className="hh-blink ml-1 text-editorial-gold">▼</span>}
          </p>
        </div>
        {/* The way on stands at the foot of the frame, never under the roll. */}
        {done && children && <div className="shrink-0 px-2 pb-1 pt-1">{children}</div>}
      </div>
    </div>
  );
}