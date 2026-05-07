import { motion } from 'framer-motion';
import { Newspaper, Radar, TrendingUp } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

const comingSoonItems = [
  {
    title: 'Radar Dashboard',
    description: 'Live aerospace signals, launch movement, and sector-level monitoring.',
    icon: Radar,
  },
  {
    title: 'Intelligence',
    description: 'Research dashboards, trend reviews, and deeper industry signal analysis.',
    icon: TrendingUp,
  },
  {
    title: 'Alumni in News',
    description: 'A news stream tracking updates and momentum from TOP 100 alumni.',
    icon: Newspaper,
  },
];

export default function ComingSoonIntelligenceTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="rounded-2xl border bg-white/70 p-4 md:p-6" style={{ borderColor: `${brandColors.ink}10` }}>
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: brandColors.goldPrestige }}>
            In Progress
          </p>
          <h3 className="mt-2 text-xl font-light md:text-2xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.navyDeep }}>
            Coming Soon
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: `${brandColors.ink}60` }}>
            These intelligence modules are being consolidated here while they move from prototype to publication-ready.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {comingSoonItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border p-4" style={{ background: brandColors.cream, borderColor: `${brandColors.goldPrestige}25` }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>{item.title}</h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: `${brandColors.ink}60` }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}