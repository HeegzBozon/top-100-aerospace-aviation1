import { motion } from 'framer-motion';
import { CG_CAMPAIGNS } from './cgCampaigns';

export default function CGCampaignSelect({ onSelect }) {
  const campaigns = Object.values(CG_CAMPAIGNS);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-8 blur-[180px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #4ade80 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full border border-[#4ade80]/30 text-[#4ade80]/70 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(74,222,128,0.06)' }}>
            CommonGround · Civic Simulator
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-5xl md:text-6xl font-bold text-white mb-4">
            Choose Your<br /><span className="text-[#4ade80]">Mission</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto">
            Three campaigns. Three ways to change the city. Each decision shapes your Civic Profile.
          </p>
        </motion.div>

        <div className="space-y-5 mb-10">
          {campaigns.map((c, i) => (
            <motion.button key={c.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
              onClick={() => onSelect(c.id)}
              className="w-full text-left rounded-3xl p-7 border border-white/8 hover:border-[#4ade80]/40 transition-all group"
              style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-1">{c.id} · {c.archetype}</p>
                  <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    className="text-2xl font-bold text-white group-hover:text-[#4ade80] transition-colors">
                    {c.badge} {c.title}
                  </h2>
                </div>
                <div className="text-white/20 group-hover:text-[#4ade80] transition-colors text-2xl">→</div>
              </div>
              <p className="text-white/45 text-sm leading-relaxed mb-4">{c.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {c.primaryStats.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#4ade80]/20 text-[#4ade80]/60"
                    style={{ background: 'rgba(74,222,128,0.05)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center space-y-1">
          <p className="text-white/20 text-xs">~12 minutes per campaign · AI-generated narrative · Based on CommonGround 5.0</p>
        </motion.div>
      </div>
    </div>
  );
}