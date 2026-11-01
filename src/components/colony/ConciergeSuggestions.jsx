// Suggested next questions, held in their own row outside the dialogue so a long line never hides them.
export default function ConciergeSuggestions({ items, onPick }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-none gap-1.5 overflow-x-auto pb-0.5">
      {items.map(t => (
        <button key={t} type="button" onClick={() => onPick(t)}
          className="max-w-[78%] flex-none rounded-sm border border-editorial-gold/60 bg-[#14283f] px-2 py-1 text-left font-mono text-[11px] leading-snug text-editorial-gold">
          ▶ {t}
        </button>
      ))}
    </div>
  );
}