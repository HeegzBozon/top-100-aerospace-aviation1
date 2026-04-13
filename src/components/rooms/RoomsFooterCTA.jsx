import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, ExternalLink } from 'lucide-react';

export default function RoomsFooterCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#050d1a' }}>
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-[#c9a87c]/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The next room opens soon.
          </h2>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            We're not waiting until it's perfect. We're building it live.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <a href="https://www.linkedin.com/company/top-100-in-aerospace-aviation/" target="_blank" rel="noopener noreferrer">
              <Button
                className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Join the LinkedIn event
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

          <p className="text-slate-600 text-xs italic">
            One more thing: this page was drafted in a Mission Room. Of course it was.
          </p>
        </motion.div>
      </div>
    </section>
  );
}