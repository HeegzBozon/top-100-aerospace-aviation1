import { motion } from 'framer-motion';
import { Megaphone, Clock, BarChart3, CheckCircle2 } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const STEPS = [
  { num: '01', icon: Megaphone, title: 'The Spotlight Pitch', desc: 'Reach out and offer to promote local businesses to the community for free on your dedicated spotlight website.' },
  { num: '02', icon: Clock, title: 'The 20-Min Discovery Call', desc: 'Invite owners to a short Zoom call to gather info for their feature — building rapport and uncovering needs.' },
  { num: '03', icon: BarChart3, title: 'Immediate Value', desc: 'Unlike audits where value is locked behind a sale, the spotlight delivers standalone visibility and credibility for free.' },
  { num: '04', icon: CheckCircle2, title: 'Natural Conversion', desc: 'Approximately 1 in 3 calls converts into a paying client — no hard sell required.' },
];

export default function LLSpotlight() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>II. Lead Generation</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            The Spotlight System
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            A high-efficiency lead magnet that provides immediate, standalone value — not locked behind a sale.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl bg-white border border-slate-100 p-6 hover:shadow-md transition-shadow overflow-hidden"
              >
                <span className="absolute top-4 right-5 text-5xl font-bold opacity-[0.04] pointer-events-none" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{s.num}</span>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.gold}12` }}>
                    <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: brand.navy }}>{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}