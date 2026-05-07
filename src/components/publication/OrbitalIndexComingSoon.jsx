import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import OrbitalIndexPreview from '@/components/publication/OrbitalIndexPreview';
import WaitlistSignup from '@/components/publication/WaitlistSignup';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function OrbitalIndexComingSoon() {
  return (
    <section className="relative overflow-hidden px-4 py-12 md:px-12 md:py-40 lg:px-24" style={{ background: brandColors.cream }}>
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8 md:mb-16">
          <p className="mb-2 text-[9px] uppercase tracking-[0.3em] md:mb-4 md:text-[10px] md:tracking-[0.5em]" style={{ color: brandColors.skyBlue }}>
            Connections
          </p>
          <h2 className="text-2xl font-light tracking-tight md:text-5xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}>
            The Orbital Index
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed md:mt-4 md:text-sm" style={{ color: `${brandColors.ink}60` }}>
            How these leaders connect across regions, disciplines, and domains.
          </p>
        </motion.div>

        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 'min(400px, 70vh)' }}>
          <div className="pointer-events-none opacity-40 blur-[1px]">
            <OrbitalIndexPreview />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${brandColors.cream}ee 0%, ${brandColors.goldLight}dd 50%, ${brandColors.cream}ee 100%)`,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ background: brandColors.goldPrestige, left: `${10 + (i % 4) * 25}%`, top: `${15 + Math.floor(i / 4) * 30}%` }}
                  animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
              <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.15 }}>
                <motion.line x1="15%" y1="20%" x2="35%" y2="45%" stroke={brandColors.navyDeep} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.line x1="35%" y1="45%" x2="60%" y2="25%" stroke={brandColors.navyDeep} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
                <motion.line x1="60%" y1="25%" x2="85%" y2="50%" stroke={brandColors.navyDeep} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity }} />
              </svg>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="relative z-10 px-6 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ background: `${brandColors.navyDeep}10`, border: `1px solid ${brandColors.navyDeep}20` }}>
                <Star className="h-4 w-4" style={{ color: brandColors.goldPrestige }} />
                <span className="text-[10px] font-medium uppercase tracking-[0.3em]" style={{ color: brandColors.navyDeep }}>Sneak Peek</span>
              </div>

              <h3 className="mb-4 text-3xl font-light md:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.navyDeep }}>
                Under the Hood
              </h3>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed" style={{ color: `${brandColors.ink}70` }}>
                An interactive knowledge graph revealing the hidden connections between aerospace leaders — by company, country, discipline, and shared tags.
              </p>

              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {['Companies', 'Countries', 'Industries', 'Tags'].map((feature, i) => (
                  <motion.span
                    key={feature}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="rounded-full px-3 py-1.5 text-xs"
                    style={{ background: `${brandColors.skyBlue}15`, color: brandColors.skyBlue, border: `1px solid ${brandColors.skyBlue}30` }}
                  >
                    {feature}
                  </motion.span>
                ))}
              </div>

              <p className="mb-8 text-xs uppercase tracking-wider" style={{ color: brandColors.goldPrestige }}>Coming Soon</p>
              <WaitlistSignup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}