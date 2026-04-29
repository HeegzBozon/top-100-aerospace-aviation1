import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Wrench, Users } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const ROLES = [
  { icon: Lightbulb, title: 'Marketing Strategist', desc: 'Understand high-level levers like copywriting, button placement, and funnel optimization.' },
  { icon: Wrench, title: 'Technical Implementation', desc: 'Possess the technical chops (WordPress, GoHighLevel, Duda) to execute the strategy.' },
  { icon: Users, title: 'Community Authority', desc: 'Act as a local news channel and community hub that celebrates local excellence.' },
];

export default function LLShift() {
  return (
    <section id="ll-framework" className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>I. The Fundamental Shift</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            From Web Designer to Marketing Partner
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Business owners don't seek "professional web designers" — they fail to recognize their website as a primary roadblock. You must reposition as a <strong className="text-slate-700">Marketing Partner</strong>.
          </p>
        </motion.div>

        {/* Before → After */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-4 justify-center my-12"
        >
          <div className="px-6 py-4 rounded-xl border border-red-200 bg-red-50 text-center w-full md:w-56">
            <p className="text-xs font-bold uppercase text-red-400 tracking-wider mb-1">Old Identity</p>
            <p className="text-lg font-bold text-red-600" style={{ fontFamily: "'Playfair Display', serif" }}>"Web Designer"</p>
            <p className="text-[11px] text-red-400 mt-1">1% response rate</p>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 shrink-0 rotate-90 md:rotate-0" />
          <div className="px-6 py-4 rounded-xl border text-center w-full md:w-56" style={{ borderColor: `${brand.gold}40`, background: `${brand.gold}08` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: brand.gold }}>New Identity</p>
            <p className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>"Marketing Partner"</p>
            <p className="text-[11px] mt-1" style={{ color: brand.gold }}>20% response rate</p>
          </div>
        </motion.div>

        {/* Three roles */}
        <div className="grid md:grid-cols-3 gap-5">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${brand.navy}08` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.navy }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: brand.navy }}>{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}