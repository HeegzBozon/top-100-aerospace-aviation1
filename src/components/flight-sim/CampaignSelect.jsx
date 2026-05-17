import { motion } from 'framer-motion';
import { CAMPAIGNS } from './campaigns';
import { Lock, ChevronRight, Star } from 'lucide-react';

const STAT_LABELS = { altitude: 'ALT', velocity: 'VEL', payload: 'PAY', range: 'RNG', resilience: 'RES', maneuver: 'MAN' };

export default function CampaignSelect({ onSelect }) {
  const campaigns = Object.values(CAMPAIGNS);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center mb-14 max-w-2xl">
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="uppercase tracking-[0.35em] text-[#c9a87c] text-xs font-semibold">TOP 100 Aerospace & Aviation</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Flight<br /><span className="text-[#c9a87c]">Simulator</span>
        </h1>
        <p className="text-white/50 text-base leading-relaxed">
          A narrative career simulation. Choose your campaign. Navigate branching decisions. Roll at the critical moment. Discover your Flight Profile.
        </p>
        <p className="text-white/30 text-sm mt-3 italic">8–12 minutes per campaign.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {campaigns.map((campaign, i) => (
          <motion.div key={campaign.id}
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5 }}>
            <button
              onClick={() => campaign.available && onSelect(campaign.id)}
              disabled={!campaign.available}
              className={`w-full text-left rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden group ${
                campaign.available
                  ? 'border-white/10 hover:border-[#c9a87c]/50 cursor-pointer'
                  : 'border-white/5 opacity-50 cursor-not-allowed'
              }`}
              style={{ background: campaign.available ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)' }}
            >
              {campaign.available && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,124,0.07) 0%, transparent 70%)' }} />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">{campaign.id}</span>
                      {!campaign.available && <Lock className="w-3 h-3 text-white/30" />}
                      {!campaign.available && <span className="text-white/30 text-xs">Coming Season 2</span>}
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      className="text-2xl font-bold text-white">{campaign.title}</h3>
                  </div>
                  <span className="text-4xl">{campaign.badge}</span>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c]"
                    style={{ background: 'rgba(201,168,124,0.08)' }}>
                    {campaign.archetype}
                  </span>
                </div>

                <p className="text-white/55 text-sm leading-relaxed mb-6">{campaign.tagline}</p>

                <div className="mb-6">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Primary Stats</p>
                  <div className="flex gap-2">
                    {campaign.primaryStats.map(stat => (
                      <span key={stat} className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#c9a87c] border border-[#c9a87c]/20"
                        style={{ background: 'rgba(201,168,124,0.06)' }}>{stat}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {Object.entries(campaign.baseStats).map(([stat, val]) => (
                    <div key={stat} className="text-center">
                      <div className="text-[#c9a87c] font-bold text-xs">{STAT_LABELS[stat]}</div>
                      <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                        <div className="bg-[#c9a87c] h-1 rounded-full" style={{ width: `${(val / 20) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {campaign.available && (
                  <div className="flex items-center gap-2 text-[#c9a87c] font-bold text-sm">
                    Begin Campaign <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-12 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c9a87c]/25 text-[#c9a87c]/60 text-xs font-semibold uppercase tracking-widest"
        style={{ background: 'rgba(201,168,124,0.05)' }}>
        <Star className="w-3 h-3" /> 8–12 minutes per campaign
      </motion.div>
    </div>
  );
}