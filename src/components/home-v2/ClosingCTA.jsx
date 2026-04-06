import { Button } from '@/components/ui/button';
import { Rocket, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ClosingCTA() {
  return (
    <section className="py-10 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-[#1e3a5a] rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a87c] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4a90b8] rounded-full mix-blend-screen filter blur-[120px] opacity-15 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-4">Season 4 — 2026</p>
          <h2
            className="text-2xl md:text-4xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The missing layer is ready.
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Recognition says: we see you. Mentorship says: we'll advise you. 
            Sponsorship says: I'm putting my reputation behind you in rooms you're not in yet. 
            This is the infrastructure for all three.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/Nominations">
              <Button
                className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:shadow-[0_0_30px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Nominate Now
              </Button>
            </Link>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="border-slate-500 bg-transparent hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full text-sm cursor-pointer"
              >
                Invest on Wefunder
              </Button>
            </a>
          </div>

          <p className="text-[#c9a87c] text-lg md:text-xl font-bold italic mt-10" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ad Astra.
          </p>
        </div>
      </motion.div>
    </section>
  );
}