import { B } from '@/components/fellow-home/fellowHomeConfig';
import { OKR_STATUS } from './platformBoardConfig';

// An OKR (Objective) card with progress and status.
export default function OkrCard({ okr, accent }) {
  const progress = Math.max(0, Math.min(100, okr.progress || 0));
  const status = OKR_STATUS[okr.status] || okr.status || '';
  return (
    <div className="rounded-xl p-3" style={{ background: `${accent}0d`, border: `1px solid ${B.border}` }}>
      <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {status}{okr.horizon ? ` · ${okr.horizon.toUpperCase()}` : ''}
      </span>
      <p className="text-sm font-bold leading-snug my-1.5" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {okr.name}
      </p>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: B.cream }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: accent }} />
        </div>
        <span className="text-[10px] font-semibold" style={{ color: B.muted }}>{progress}%</span>
      </div>
    </div>
  );
}