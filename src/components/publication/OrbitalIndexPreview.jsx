import { motion } from 'framer-motion';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

const nodes = [
  { left: '12%', top: '22%' },
  { left: '32%', top: '48%' },
  { left: '58%', top: '28%' },
  { left: '82%', top: '52%' },
  { left: '48%', top: '72%' },
  { left: '22%', top: '78%' },
];

const lines = [
  ['12%', '22%', '32%', '48%'],
  ['32%', '48%', '58%', '28%'],
  ['58%', '28%', '82%', '52%'],
  ['32%', '48%', '48%', '72%'],
  ['22%', '78%', '48%', '72%'],
];

export default function OrbitalIndexPreview() {
  return (
    <div className="relative hidden min-h-[420px] overflow-hidden rounded-2xl border border-[#c9a87c]/20 bg-white/40 md:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(201,168,124,0.25),transparent_30%),radial-gradient(circle_at_75%_60%,rgba(74,144,184,0.18),transparent_28%)]" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {lines.map(([x1, y1, x2, y2], index) => (
          <motion.line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={brandColors.navyDeep}
            strokeWidth="1"
            opacity="0.18"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: index * 0.15 }}
          />
        ))}
      </svg>
      {nodes.map((node, index) => (
        <motion.div
          key={`${node.left}-${node.top}`}
          className="absolute h-4 w-4 rounded-full shadow-[0_0_24px_rgba(201,168,124,0.55)]"
          style={{ left: node.left, top: node.top, background: brandColors.goldPrestige }}
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.92, 1.15, 0.92] }}
          transition={{ duration: 3, delay: index * 0.25, repeat: Infinity }}
        />
      ))}
    </div>
  );
}