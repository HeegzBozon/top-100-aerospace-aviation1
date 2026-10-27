import { ChevronLeft } from 'lucide-react';
import { publicationBrand as brandColors } from './publicationConfig';

// The strip across the head of an open section: the section the console is standing in,
// and the way back to the index — printed for the hand that would rather tap than press B.
export default function PublicationSectionHead({ index, name, onBack }) {
  return (
    <div
      className="flex items-center justify-between gap-3 pb-2"
      style={{ borderBottom: `1px solid ${brandColors.ink}12` }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.26em]" style={{ color: '#b87333' }}>
        {index} · {name}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: brandColors.navyDeep }}
      >
        <ChevronLeft className="h-3 w-3" /> Index
      </button>
    </div>
  );
}