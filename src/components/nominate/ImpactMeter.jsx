import { motion } from 'framer-motion';
import { brand } from './NominateConfig';

/**
 * Visual "impact quality" meter for nomination reasons.
 * Shows a progress ring + label based on word count.
 */
export default function ImpactMeter({ text }) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;

  let pct, label, color;
  if (words === 0) { pct = 0; label = 'Start typing…'; color = `${brand.navy}40`; }
  else if (words < 8) { pct = 20; label = 'Just getting started'; color = '#d4a574'; }
  else if (words < 20) { pct = 45; label = 'Good detail'; color = brand.gold; }
  else if (words < 35) { pct = 72; label = 'Rich context'; color = '#8fb069'; }
  else { pct = 100; label = 'Exceptional — helps our team'; color = brand.navy; }

  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex items-center gap-2.5">
      <svg width="40" height="40" className="shrink-0 -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke={`${brand.navy}12`} strokeWidth="3" />
        <motion.circle
          cx="20" cy="20" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4 }}
        />
      </svg>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold leading-tight" style={{ color }}>{label}</p>
        <p className="text-[10px] leading-tight" style={{ color: `${brand.navy}50` }}>{words} words</p>
      </div>
    </div>
  );
}