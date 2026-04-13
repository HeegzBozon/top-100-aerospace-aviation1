import { motion } from 'framer-motion';
import { Users, Network, TrendingUp, Shield } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Shield,
    title: 'Crew Resource Management',
    desc: "Aerospace runs on CRM. Shared mental models, structured decisions, clear communication under pressure. Moon Base Alpha inherits the doctrine from mission control itself.",
    color: '#e88d67',
  },
  {
    icon: Users,
    title: "Dunbar's Colony Number",
    desc: "The human brain holds roughly 150 stable relationships. We sized the colony for it. The core crew fits working memory, not a follower count. 50 operators. 150 extended. Unlimited observers.",
    color: '#c9a87c',
  },
  {
    icon: Network,
    title: 'Team Topologies',
    desc: "Stream-aligned crews build habitat modules. Enabling teams train new arrivals. Platform teams run life support infrastructure. Complicated-subsystem teams handle propulsion and power.",
    color: '#4a90b8',
  },
  {
    icon: TrendingUp,
    title: 'Tuckman: Form → Storm → Norm → Perform',
    desc: "Every sprint runs the full arc. Sprint one, the crew forms. Sprint two, it storms and norms under lunar conditions. Sprint three, it performs and ships a Time Capsule back to Earth.",
    color: '#7ecda0',
  },
];

export default function PrinciplesSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#0a1220' }}>
      {/* Diagonal accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#c9a87c]/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Engineered for survival. <span className="text-[#c9a87c]">Not vibes.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Most colonies fail because they scale past their cognitive budget. Moon Base Alpha is engineered around the math of how humans actually form trust, teams, and operational units under extreme conditions.
          </p>
        </motion.div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500 group"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}
              >
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
              </div>

              <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {p.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>

              {/* Corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at top right, ${p.color}08, transparent 70%)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}