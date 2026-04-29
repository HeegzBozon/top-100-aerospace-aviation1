import { motion } from 'framer-motion';
import { Megaphone, Globe, HeartHandshake } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const BENEFITS = [
  { icon: Megaphone, title: 'We Promote You', desc: 'We write about your business and share your story with the entire community — you just show up and be you.' },
  { icon: Globe, title: 'We Handle the Tech', desc: 'From your online presence to making sure customers can find you on Google — we take care of the digital side.' },
  { icon: HeartHandshake, title: 'We\'re Your Partner', desc: 'We don\'t just build a website and disappear. We stick around to make sure your business keeps growing.' },
];

export default function LLShift() {
  return (
    <section id="ll-why-it-matters" className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Why It Matters</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            You Run Your Business. We Bring You Customers.
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Most business owners are too busy doing great work to worry about marketing. That's where we come in — think of us as your <strong className="text-slate-700">local marketing team</strong>, not a vendor trying to sell you something.
          </p>
        </motion.div>

        {/* The problem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-6 md:p-8 my-12 text-center max-w-2xl mx-auto border border-slate-100"
          style={{ background: brand.cream }}
        >
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="block text-base mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>Sound familiar?</strong>
            "I know I need a better online presence, but I don't have time to figure it all out. I just need someone who <em>gets</em> my business and can help me get more customers."
          </p>
        </motion.div>

        {/* Three benefits */}
        <div className="grid md:grid-cols-3 gap-5">
          {BENEFITS.map((r, i) => {
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