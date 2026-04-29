import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const PILLARS = ['Fitness', 'Wellness', 'Food', 'Family', 'Community'];

export default function LLProRelocation() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${brand.gold}15` }}>
            <MapPin className="w-6 h-6" style={{ color: brand.gold }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            New to [City]? Here's where to start.
          </h2>

          <div className="space-y-4 text-sm md:text-base text-slate-600 leading-relaxed mb-8 text-left md:text-center max-w-xl mx-auto">
            <p>
              Moving to a new aerospace hub is exciting. It's also a lot. Finding your people. Finding your gym. Finding a pediatrician who doesn't have a six-month waitlist.
            </p>
            <p className="text-slate-500">
              We've done the research so you don't have to.
            </p>
            <p>
              <strong style={{ color: brand.navy }}>Local Legends: Mountain View</strong> covers everything the aerospace professional needs to land well.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {PILLARS.map(p => (
              <span key={p} className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${brand.navy}08`, color: brand.navy }}>
                {p}
              </span>
            ))}
          </div>

          <Button
            size="lg"
            className="rounded-full px-8 text-white font-semibold text-sm shadow-xl gap-2"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
          >
            Download the Mountain View Relocation Guide <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}