import { motion } from 'framer-motion';
import { Bot, MapPin, Database, Star, Zap, ShieldCheck, Target, BarChart3 } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const BUCKET_ITEMS = [
  { icon: Database, label: 'Dead Database Money', desc: 'Re-engage inactive leads via AI' },
  { icon: Star, label: 'Reputation Management', desc: 'Automate 5-star review generation' },
  { icon: Zap, label: 'Lead Nurturing', desc: 'Follow up within 5 minutes (+400% conversion)' },
  { icon: Target, label: 'Sales Processes', desc: 'AI-grade and coach the client\'s sales team' },
  { icon: BarChart3, label: 'Marketing Efficiency', desc: 'Ensure ad spend isn\'t wasted on cold leads' },
  { icon: ShieldCheck, label: 'Owner Overload', desc: 'Automate admin so owners focus on fulfillment' },
];

export default function LLPillars() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>IV. Supporting Pillars</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Fix the Leaky Bucket
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Isolated automations aren't enough. Address six core operational failures to retain clients long-term.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUCKET_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-100 hover:shadow-sm transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${brand.navy}08` }}>
                  <Icon className="w-4 h-4" style={{ color: brand.navy }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: brand.navy }}>{item.label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SEO Blueprint mini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl border border-slate-100 bg-white p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.gold}15` }}>
              <MapPin className="w-5 h-5" style={{ color: brand.gold }} />
            </div>
            <div>
              <h3 className="text-base font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>Multi-Location SEO Blueprint</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                A single Google Business Profile only ranks within a 15-mile radius. The "Coverage Map" strategy uses legal multi-location DBAs with unique phone numbers and hyper-local content pages to dominate an entire city.
              </p>
              <div className="flex flex-wrap gap-2">
                {['15-Mile Rule', 'Legal DBAs', 'Hyper-Local Content', 'Coverage Mapping'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: `${brand.gold}10`, color: brand.gold }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}