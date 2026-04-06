import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Calendar, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveStreamComments from '@/components/home/LiveStreamComments';
import FloatingReactions from '@/components/home/FloatingReactions';

export default function MissionBriefSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-6 md:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Mission Theater</p>
          <h2
            className="text-2xl md:text-4xl font-bold text-[#1e3a5a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Live from the Frontier
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-4">
          {/* Video Player */}
          <Card className="lg:col-span-3 bg-black relative overflow-hidden border-[#4a90b8]/20 shadow-xl aspect-video">
            {playing ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/8n1GGe0fUBs?autoplay=1&mute=0&volume=100&enablejsapi=1"
                title="Artemis Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full group cursor-pointer"
              >
                <img
                  src="https://img.youtube.com/vi/8n1GGe0fUBs/maxresdefault.jpg"
                  alt="Artemis Live Stream"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-110 transition-all drop-shadow-lg" />
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
              </button>
            )}
            <FloatingReactions />
          </Card>

          {/* Campfire Chat */}
          <div className="lg:col-span-2 h-[360px] lg:h-auto">
            <LiveStreamComments />
          </div>
        </div>

        {/* Artemis + Wefunder CTAs */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card className="bg-[#0a1526] border-[#4a90b8]/20 p-6 text-white relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#c9a87c] blur-[100px] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[#c9a87c] text-[10px] font-bold uppercase tracking-widest mb-2">Artemis II • Day 4</p>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                First humans to fly by the Moon in 50 years.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Every honoree in our community contributed to the ecosystem that made this possible.
              </p>
              <a href="/artemis-2">
                <Button className="bg-[#c9a87c] hover:bg-[#b09268] text-[#0a1526] font-bold px-5 py-4 rounded-full text-xs cursor-pointer">
                  <Rocket className="w-3.5 h-3.5 mr-1.5" /> Discover Artemis
                </Button>
              </a>
            </div>
          </Card>

          <Card className="bg-[#0a1526] border-[#4a90b8]/20 p-6 text-white relative overflow-hidden">
            <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#4a90b8] blur-[100px] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-3 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live on Wefunder
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Invest in the infrastructure.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Aerospace recognition infrastructure that turns influence into institutional power.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#c9a87c] hover:bg-[#b09268] text-[#0a1526] font-bold px-5 py-4 rounded-full text-xs cursor-pointer">
                    Reserve Your Spot
                  </Button>
                </a>
                <a href="https://calendar.app.google/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold px-5 py-4 rounded-full text-xs cursor-pointer">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Let's Talk
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}