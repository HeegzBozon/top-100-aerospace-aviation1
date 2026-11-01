import { X } from 'lucide-react';
import AtlasStarCard from '@/components/star-atlas/AtlasStarCard';

// Meeting an honoree on campus: their Star Atlas card, read where they stand.
// The character is an editorial exhibit of the public record — it never speaks for the person.
export default function HonoreeExhibit({ exhibit, passport, onSave, onClose }) {
  const n = exhibit.honoree;
  const light = (reflection) => onSave({ stars: { ...(passport?.stars || {}), [n.id]: { c: exhibit.trail.id, r: reflection, at: new Date().toISOString() } } });
  return (
    <div className="absolute inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-md border-2 border-editorial-gold/70 bg-gradient-to-b from-[#0b1826] to-editorial-navy shadow-2xl">
      <div className="flex items-center gap-2 border-b border-editorial-gold/40 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base text-editorial-cream">{exhibit.trail.title}</p>
          <p className="text-[9px] uppercase tracking-widest text-editorial-gold/80">Honoree exhibit · from the public record</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close"><X className="h-4 w-4 text-editorial-cream/70" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <AtlasStarCard key={n.id} nominee={n} lit={!!passport?.stars?.[n.id]} onLight={light} onBack={onClose} />
      </div>
    </div>
  );
}