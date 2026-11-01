import { X, ArrowRight } from 'lucide-react';
import useColonyListPicker from './useColonyListPicker';

// A Colony list panel: tap, click wheel or Xbox pad. items: { key, label, note, disabled }.
export default function ColonyListPanel({ title, items, empty, onPick, onClose }) {
  const cursorKey = useColonyListPicker({ items, onPick, onClose });
  return (
    <div className="absolute inset-3 z-30 mx-auto flex max-w-sm flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/50 px-4 py-3">
        <p className="font-heading text-lg text-editorial-cream">{title}</p>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="text-editorial-cream/70"><X className="h-4 w-4" /></button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {items.length === 0 && <li className="px-3 py-8 text-center text-sm text-editorial-cream/70">{empty}</li>}
        {items.map((it) => (
          <li key={it.key} id={`colony-list-${it.key}`}>
            <button type="button" disabled={it.disabled} onClick={() => onPick(it)}
              className={`flex w-full items-center justify-between gap-2 rounded px-3 py-2.5 text-left text-sm text-editorial-cream hover:bg-white/5 disabled:opacity-60 ${cursorKey === it.key ? 'bg-white/10 ring-1 ring-editorial-gold/70' : ''}`}>
              <span className="min-w-0 truncate">{it.label}{it.note && <span className="ml-2 text-[10px] uppercase tracking-widest text-editorial-gold">{it.note}</span>}</span>
              {!it.disabled && <ArrowRight className="h-4 w-4 shrink-0 text-editorial-gold" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}