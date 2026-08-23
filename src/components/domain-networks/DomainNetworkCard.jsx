import { Users, Pause } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { accentForDomain } from './domainNetworkConfig';

// One Domain Network card — a standing Community of Practice. Paused networks
// render muted rather than hidden; thin beats many-and-quiet.
export default function DomainNetworkCard({ network, onSelectRooms }) {
  const accent = accentForDomain(network.domain_focus);
  const paused = network.status === 'paused';

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: B.border, opacity: paused ? 0.62 : 1 }}>
      <div className="h-1" style={{ background: accent }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{network.name}</h4>
          {paused && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: `${B.muted}18`, color: B.muted }}>
              <Pause className="w-3 h-3" /> Paused
            </span>
          )}
        </div>
        {network.charter && <p className="text-[12px] leading-relaxed" style={{ color: B.muted }}>{network.charter}</p>}
        {network.facilitator_name && (
          <div className="flex items-center gap-1.5 mt-1">
            <Users className="w-3 h-3" style={{ color: accent }} />
            <span className="text-[11px]" style={{ color: B.muted }}>Facilitator: <span style={{ color: B.navy }} className="font-semibold">{network.facilitator_name}</span></span>
          </div>
        )}
        {onSelectRooms && !paused && (
          <button type="button" onClick={onSelectRooms} className="mt-1 self-start text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
            View Mission Rooms →
          </button>
        )}
      </div>
    </div>
  );
}