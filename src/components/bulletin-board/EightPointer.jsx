import { Link } from 'react-router-dom';
import { ArrowUp, ListOrdered, ArrowRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Bare tile content — the ModuleGrid card provides the frame.
// The Eight lives in the masthead; this tile points up to it.
export default function EightPointer({ accent, onJump }) {
  return (
    <div className="text-center py-1">
      <ListOrdered className="w-5 h-5 mx-auto mb-1.5" style={{ color: accent }} />
      <p className="text-xs leading-snug mb-3" style={{ color: B.muted }}>
        Your Eight lives in the masthead — eight public, ordered positions.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={onJump}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
          style={{ background: B.navy }}
        >
          <ArrowUp className="w-3.5 h-3.5" /> Jump to The Eight
        </button>
        <Link to="/nominate" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: B.navy }}>
          Refine <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
        </Link>
      </div>
    </div>
  );
}