import { ArrowRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { stageMeta, boardMeta } from './lensConfig';
import CareerXpChip from '@/components/career-logbook/CareerXpChip';

// The curated landing for the active lens + stage. Surfaces the boards most
// relevant to that stage/role as entry cards — navigating by who you are,
// not by feature. Drilling into a card hands off to the board view.
export default function LensLanding({ lens, stage, accent, onSelectBoard }) {
  const meta = stageMeta(lens, stage);
  const Icon = meta.icon;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${accent}14` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{meta.label}</h3>
            <p className="text-[12px]" style={{ color: B.muted }}>{meta.blurb}</p>
          </div>
        </div>
        <CareerXpChip accent={accent} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {meta.boards.map((bKey) => {
          const b = boardMeta(bKey);
          const BIcon = b.icon;
          return (
            <button
              key={bKey}
              type="button"
              onClick={() => onSelectBoard(bKey)}
              className="text-left rounded-xl border bg-white p-4 flex flex-col gap-2 transition-shadow hover:shadow-md"
              style={{ borderColor: B.border }}
            >
              <div className="flex items-center justify-between">
                <BIcon className="w-4 h-4" style={{ color: accent }} />
                <ArrowRight className="w-3.5 h-3.5" style={{ color: B.muted }} />
              </div>
              <h4 className="text-sm font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{b.label}</h4>
              <p className="text-[11px] leading-relaxed" style={{ color: B.muted }}>{b.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}