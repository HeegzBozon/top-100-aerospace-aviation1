import { B } from '@/components/fellow-home/fellowHomeConfig';

// Numbered phase header — gives the cluster its instrument-panel rhythm.
export default function ConferencePhaseHeader({ num, icon: Icon, label, subtitle, count, accent }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${accent}12`, border: `1px solid ${accent}33` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold tracking-[0.18em]" style={{ color: B.muted }}>{num}</span>
          <h3 className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: B.navy }}>{label}</h3>
          {count != null && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: B.cream, color: B.muted }}>{count}</span>
          )}
        </div>
        <p className="text-[10px] leading-tight" style={{ color: B.muted }}>{subtitle}</p>
      </div>
    </div>
  );
}