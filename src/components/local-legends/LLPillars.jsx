import { motion } from 'framer-motion';
import { MapPin, UserCheck, Star, Zap, BarChart3, ShieldCheck } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const PROBLEMS = [
  { icon: UserCheck, label: 'Old Leads Sitting in Your Phone', desc: 'We re-engage past customers and leads who forgot about you — automatically.' },
  { icon: Star, label: 'Not Enough Reviews', desc: 'We help you get 5-star reviews flowing in without awkwardly asking customers.' },
  { icon: Zap, label: 'Slow Response Times', desc: 'We make sure every new lead gets a response within 5 minutes — even at 2 AM.' },
  { icon: BarChart3, label: 'Wasted Ad Spend', desc: 'We make sure every dollar you spend on ads actually turns into a real customer.' },
  { icon: ShieldCheck, label: 'Too Much on Your Plate', desc: 'We automate the admin stuff so you can get back to what you\'re actually good at.' },
  { icon: MapPin, label: 'Invisible on Google', desc: 'We make sure people in your area can actually find you when they search online.' },
];

export default function LLPillars() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>What We Fix</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Are Customers Slipping Through the Cracks?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Most businesses lose customers not because of bad products — but because of small gaps in their marketing. We fix all six.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((item, i) => {
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

        {/* Google visibility card */}
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
              <h3 className="text-base font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>Want to Own Your Entire City on Google?</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                Most Google listings only reach people within 15 miles. If you serve a bigger area, we can help you show up in <strong className="text-slate-700">every neighborhood</strong> — legally and effectively. It's like having a storefront on every corner of town.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Show Up Everywhere', 'More Phone Calls', 'More Walk-Ins', 'Beat Your Competition'].map(tag => (
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