import { Link } from 'react-router-dom';
import { ArrowUp, ListOrdered, ArrowRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The Eight lives in the masthead — this tab points up to it rather than
// duplicating the module. Vacancy is still the call to action.
export default function EightPointer({ accent, onJump }) {
  return (
    <div className="rounded-xl p-6 text-center" style={{ border: `1px dashed ${B.border}`, background: B.cream }}>
      <ListOrdered className="w-6 h-6 mx-auto mb-2" style={{ color: accent }} />
      <p className="text-sm font-semibold mb-1" style={{ color: B.navy }}>Your Eight lives in the masthead</p>
      <p className="text-xs leading-snug mb-4 max-w-sm mx-auto" style={{ color: B.muted }}>
        Eight public, ordered positions sit in your identity header. Vacancy is the call to action.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button onClick={onJump} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: B.navy }}>
          <ArrowUp className="w-3.5 h-3.5" /> Jump to The Eight
        </button>
        <Link to="/nominate" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: B.navy }}>
          Refine on the nomination floor <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
        </Link>
      </div>
    </div>
  );
}