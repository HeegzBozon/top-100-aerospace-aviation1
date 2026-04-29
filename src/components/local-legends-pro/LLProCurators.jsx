import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

function AvatarPlaceholder() {
  return (
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${brand.gold}15`, border: `1px solid ${brand.gold}25` }}>
      <User className="w-8 h-8" style={{ color: brand.gold }} />
    </div>
  );
}

export default function LLProCurators() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Fellow Curators</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Curated by people who actually live here.
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Every Local Legends hub is anchored by Fellows from the TOP 100 Aerospace & Aviation community. These are the women who've spent years building careers in this city. They know where to go. They've agreed to share it.
          </p>

          {/* Fellow avatar row */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <AvatarPlaceholder />
            <AvatarPlaceholder />
            <AvatarPlaceholder />
          </div>
          <p className="text-[11px] text-slate-400 mb-14">Mountain View chapter curators — TOP 100 Fellows</p>

          {/* Insider CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 md:p-8 max-w-xl mx-auto"
            style={{ background: brand.cream, border: `1px solid ${brand.gold}20` }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
              Are you a Fellow? Become a Local Insider.
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              If you're based in one of our hub cities and want to help curate the guide for incoming professionals, we want to hear from you.
            </p>
            <Button
              className="rounded-full px-6 text-white font-semibold text-sm gap-2"
              style={{ background: brand.navy }}
            >
              Apply to be a Local Insider <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}