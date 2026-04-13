import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, ExternalLink, Moon } from 'lucide-react';
import LunarSurface from '@/components/rooms/LunarSurface';

export default function ArtemisContestFooter() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden" style={{ background: '#020810' }}>
      {/* Full Earth photo background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/52ed5a0d3_Screenshot2026-04-12at95313PM.png"
          alt="Full Earth from space"
          className="w-full h-full object-cover opacity-[0.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020810]/90 via-[#020810]/80 to-[#020810]" />
      </div>

      <LunarSurface />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Moon className="w-8 h-8 text-[#c9a87c]/40 mx-auto mb-6" />

          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We measure the builders of missions like this.
          </h2>

          <p
            className="text-white/70 text-xl md:text-2xl italic mb-3 leading-relaxed"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            100 verified Fellows. 49 countries. 8 domains.
          </p>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            The trust graph behind aerospace's next chapter. Every honoree in our community contributed to the ecosystem that made Artemis II possible.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a href="https://www.linkedin.com/company/top-100-in-aerospace-aviation/" target="_blank" rel="noopener noreferrer">
              <Button
                className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Season 4 — Nominate now
              </Button>
            </a>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full text-sm backdrop-blur-sm cursor-pointer"
              >
                Back us on Wefunder
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Closing line */}
          <h3
            className="text-[#c9a87c] tracking-[0.3em] text-3xl md:text-4xl font-bold mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ad Astra.
          </h3>

          <div className="pt-8 border-t border-white/5">
            <p className="text-[#c9a87c]/40 text-xs tracking-widest">
              top100aero.space &nbsp;·&nbsp; Season 4 Nominations Open &nbsp;·&nbsp; wefunder.com/top.100.aerospace.aviation
            </p>
            <p className="text-slate-700 text-[10px] mt-3 italic">
              Built on Base44. Tracked from Moon Base Alpha. Drafted live in a Mission Room.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}