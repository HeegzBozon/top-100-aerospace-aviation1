import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { brand } from './NominateConfig';

export default function HubMeter({ count = 0, label = 'nominations' }) {
  const strength = Math.min(count, 5);

  return (
    <div className="rounded-3xl border bg-white/75 backdrop-blur-xl p-4 shadow-[0_18px_60px_rgba(30,58,90,0.08)]" style={{ borderColor: `${brand.navy}12` }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: `${brand.navy}55` }}>
            Hub Energy
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: brand.navy }}>
            {count === 0 ? 'Ready to collect your first nomination' : `${count} ${label} collected`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0.35 }}
              animate={{ scale: i < strength ? 1 : 0.82, opacity: i < strength ? 1 : 0.28 }}
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: i < strength ? `linear-gradient(135deg, ${brand.gold}, #d8b99a)` : `${brand.navy}08` }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: i < strength ? 'white' : `${brand.navy}35` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}