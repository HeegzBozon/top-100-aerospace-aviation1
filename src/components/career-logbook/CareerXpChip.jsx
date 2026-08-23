import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Career XP — logged sweat equity. Firewalled from all measurement, selection,
// and discovery. A Fellow-facing mirror of practice volume, never read by the
// scoring engine. Renders 0 / "—" until entries are produced by backend awards.
export default function CareerXpChip({ accent }) {
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        const entries = await base44.entities.CareerLogEntry.filter({ fellow_email: me.email });
        if (cancelled) return;
        setXp(entries.reduce((sum, e) => sum + (e.xp_value || 0), 0));
        setStatus('ok');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === 'error') return null;

  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 shrink-0"
      style={{ background: B.navy, color: B.cream }}
      title="Career XP — logged practice. Firewalled from all measurement and selection."
    >
      <Activity className="w-3.5 h-3.5" style={{ color: accent || B.gold }} />
      <span className="text-xs font-bold tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {status === 'loading' ? '—' : xp}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-70">Career XP</span>
    </div>
  );
}