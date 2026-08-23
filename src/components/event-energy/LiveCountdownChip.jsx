import { Radio, Clock, CheckCircle2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { useNow, countdownFromDates } from './eventEnergy';

const ICON = { live: Radio, upcoming: Clock, ended: CheckCircle2 };
const KIND_COLOR = { live: B.gold, ended: B.muted };

// Hype countdown pill. Live-ticks every 30s. Works for both events (ISO
// datetime) and conference rooms (date-only). Pulses while the event is live.
export default function LiveCountdownChip({ start, end, accent = B.navy, now }) {
  const tick = useNow(30000);
  const cd = countdownFromDates(start, end, now ?? tick);
  if (!cd) return null;
  const Icon = ICON[cd.kind] || Clock;
  const color = cd.kind === 'upcoming' ? accent : (KIND_COLOR[cd.kind] || accent);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${cd.kind === 'live' ? 'animate-pulse' : ''}`}
      style={{ background: `${color}1A`, color, border: `1px solid ${color}44` }}
    >
      <Icon className="w-3 h-3" /> {cd.label}
    </span>
  );
}