import { motion } from 'framer-motion';
import { TrendingUp, Shield, Users, Layers, Target, Briefcase, MessageSquare, Globe } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const PROTECTIONS = [
  { icon: Users, title: 'Local Fame & Relationships', desc: 'Personal connections in the community that AI cannot replicate.' },
  { icon: Target, title: 'Strategic Insight', desc: 'Consult on business outcomes, not just technical deliverables.' },
  { icon: Layers, title: 'The Double Stack', desc: 'A marketing stack (strategy) + a tech stack (execution).' },
];

const REQUIREMENTS = [
  { icon: Briefcase, text: 'Identify a high-ticket niche where one new customer justifies the $5K+ investment' },
  { icon: MessageSquare, text: 'Commit to consistent daily outreach — 50–100 touchpoints via SMS, call, or email' },
  { icon: Shield, text: 'Use industry-specific templates and AI for rapid delivery' },
  { icon: Globe, text: 'Focus on local markets to leverage the "Local Legends" community brand' },
];

export default function LLScaling() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: `linear-gradient(180deg, white, ${brand.cream})` }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>V. Scaling & Future-Proofing</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            From Rat Race to Recurring Revenue
          </h2>
        </motion.div>

        {/* Growth projection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}
        >
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: brand.gold }} />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <TrendingUp className="w-16 h-16 shrink-0 opacity-30" style={{ color: brand.gold }} />
            <div className="text-center md:text-left">
              <h3 className="text-white text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Conservative Growth Projection</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Close <strong className="text-white/90">1 entry-level client every 2 weeks</strong> → adds $10K in new ARR each month → reach <strong className="text-white/90">$100K ARR in 10 months</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Protection */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Future-Proofing Against AI
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {PROTECTIONS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${brand.gold}12` }}>
                    <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                  </div>
                  <h4 className="text-sm font-bold mb-1.5" style={{ color: brand.navy }}>{p.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Implementation Requirements */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Implementation Checklist
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {REQUIREMENTS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brand.navy}08` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: brand.navy }} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}