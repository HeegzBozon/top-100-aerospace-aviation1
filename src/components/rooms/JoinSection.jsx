import { motion } from 'framer-motion';
import { Tv, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PATHS = [
  {
    icon: Tv,
    title: 'Observe from Earth',
    desc: 'Every session streams live on LinkedIn. No credentials required. No airlock. No paywall. Just tune in from ground control.',
    cta: 'Follow the TOP 100 LinkedIn page',
    href: 'https://www.linkedin.com/company/top-100-in-aerospace-aviation/',
    color: '#4a90b8',
  },
  {
    icon: Users,
    title: 'Join the crew rotation',
    desc: 'Subscribe to mission briefs. Get the sprint schedule, session agendas, and daily comms check videos. Become part of the extended rotation.',
    cta: 'Subscribe to mission briefs',
    href: '#',
    color: '#c9a87c',
  },
  {
    icon: Rocket,
    title: 'Fund the colony',
    desc: 'Community round live on Wefunder. Half the raise builds the Fellows program. Half builds the habitat. Every dollar is accounted for, on the record.',
    cta: 'Back us on Wefunder',
    href: 'https://wefunder.com/top.100.aerospace.aviation',
    color: '#7ecda0',
  },
];

export default function JoinSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#0a1220' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Observe. Rotate in. <span className="text-[#c9a87c]">Or help build the colony.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PATHS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center hover:border-white/[0.12] transition-all group"
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}
              >
                <p.icon className="w-6 h-6" style={{ color: p.color }} />
              </div>

              <h3
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {p.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.desc}</p>

              <a href={p.href} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-full text-xs px-6 cursor-pointer"
                >
                  {p.cta} →
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}