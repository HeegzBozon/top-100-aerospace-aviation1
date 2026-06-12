import React from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldCheck, Layers, GitMerge, TrendingUp, Anchor, Activity, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
  slate: '#0f1f33'
};

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf8f5]">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#0a1526] text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-screen filter grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1526]/80 via-[#0a1526]/90 to-[#0a1526]" />
          {/* Subtle orbital rings */}
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full border border-[#c9a87c]/10 animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full border border-[#4a90b8]/10 animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 text-[#c9a87c] text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] animate-pulse" />
              TOP 100 Aerospace & Aviation
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Perception Engine
            </h1>
            <p className="text-xl md:text-3xl text-slate-300 font-light mb-8 max-w-3xl leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              A Human-Verified Talent Graph. Bridging recognition to sponsorship in aerospace.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c9a87c] to-transparent rounded-full opacity-70" />
          </FadeIn>
        </div>
      </section>

      {/* The Infrastructure Gap */}
      <section className="py-20 md:py-32 px-6 md:px-12 relative bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <FadeIn>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: brandColors.skyBlue }}>The Infrastructure Gap</h2>
              <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#1e3a5a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Good Programs.<br/>No Plumbing.
              </h3>
              <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                <p>
                  Women make up 47% of the U.S. workforce. In aerospace, it's 13%. Only 6% of commercial pilots. Only 15% of senior leadership. The industry's own data says closing this gap could add up to 9.6% to GDP.
                </p>
                <p>
                  The organizations trying to fix this are doing extraordinary work. Dozens of programs, thousands of committed people, years of investment. And the numbers barely move.
                </p>
                <p className="text-xl font-bold text-[#1e3a5a] border-l-4 border-[#c9a87c] pl-6 py-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  The problem isn't awareness. It's infrastructure. Every program operates in its own silo.
                </p>
                <p>
                  Recognition on one platform. Mentorship in another. Sponsorship dollars through a third. Career data in spreadsheets. No shared talent graph connecting them into a coordinated system.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-[#faf8f5] p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1e3a5a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>47%</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">U.S. Workforce</div>
                </div>
                <div className="bg-[#1e3a5a] p-6 md:p-8 rounded-2xl border border-[#1e3a5a] shadow-lg flex flex-col items-center text-center text-white transform md:translate-y-8">
                  <div className="text-4xl md:text-5xl font-bold text-[#c9a87c] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>13%</div>
                  <div className="text-xs uppercase tracking-wider text-slate-300 font-bold">Aerospace</div>
                </div>
                <div className="bg-[#faf8f5] p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#1e3a5a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>6%</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Comml. Pilots</div>
                </div>
                <div className="bg-[#faf8f5] p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center transform md:translate-y-8">
                  <div className="text-4xl md:text-5xl font-bold text-[#1e3a5a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>15%</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Leadership</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Architecture */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-[#1e3a5a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16 md:mb-24">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#c9a87c] mb-4">The Architecture</h2>
            <h3 className="text-3xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Humans Verify.<br/>Algorithms Amplify.
            </h3>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FadeIn delay={0.1} className="bg-[#0f1f33]/50 p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-10 h-10 text-[#c9a87c] mb-6" />
              <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Human-in-the-Loop</h4>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                Most platforms verify with algorithms. LinkedIn checks an email domain. X sells checkmarks. We verify with humans. 1,000+ nominators who have personally observed and vouched for candidates.
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="bg-[#0f1f33]/50 p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-md">
              <Layers className="w-10 h-10 text-[#4a90b8] mb-6" />
              <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Tiered Endorsement</h4>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                300+ alumni and Fellows across 5 seasons endorse, vote, and validate through a tiered system where senior Fellows' endorsements carry up to 5x the weight. The Governing Council stewards the standard.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="bg-[#0f1f33]/50 p-8 md:p-10 rounded-3xl border border-[#c9a87c]/30 backdrop-blur-md shadow-[0_0_30px_rgba(201,168,124,0.1)] transform md:-translate-y-4">
              <Anchor className="w-10 h-10 text-[#c9a87c] mb-6" />
              <h4 className="text-xl font-bold mb-4 text-[#c9a87c]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>The Trust Moat</h4>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                Technology serves human intelligence, not the other way around. A competitor can copy the code. They cannot copy the trust graph. Built over 5 years, one relationship at a time.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Sensor Fusion / Mycelium */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <FadeIn className="order-2 md:order-1">
              <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1000&auto=format&fit=crop" alt="Network nodes" className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5a] via-[#1e3a5a]/40 to-transparent mix-blend-multiply" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <p className="text-white text-sm font-medium italic drop-shadow-md">
                      "In autonomous driving, sensor fusion combines incomplete slices of reality into a unified model. The gender parity ecosystem has the exact same architecture problem."
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
            
            <FadeIn className="order-1 md:order-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#4a90b8] mb-4">The Talent Graph</h2>
              <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#1e3a5a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Sensor Fusion & Mycelium
              </h3>
              <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base font-medium mb-8">
                <p>
                  Each organization is a sensor: WAI sees scholarship recipients, IAWA sees senior executives, WIA sees policy professionals. Each captures a real but incomplete signal. None sees the full graph.
                </p>
                <p>
                  <strong>TOP 100 OS is the fusion layer.</strong> Think of it like mycorrhizal fungi in a forest. Above ground, trees look independent. Below the surface, fungal networks connect root systems, facilitating nutrient exchange and enabling the ecosystem to coordinate.
                </p>
                <p>
                  Corporate programs and alliances are essential trees. TOP 100 OS is the fungal network. But unlike algorithmic networks, ours is built from human trust. The hyphae are relationships. The nutrient exchange is peer verification.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#c9a87c] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>300+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Alumni & Fellows</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#c9a87c] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1,000+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Nominators</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#c9a87c] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>70+</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Disciplines</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#c9a87c] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5 Years</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Organic Growth</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* From Recognition to Sponsorship */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <GitMerge className="w-12 h-12 mx-auto text-[#1e3a5a] mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#1e3a5a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              From Recognition to Sponsorship
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-12 font-medium">
              Recognition says: we see you. Mentorship says: we'll advise you. Sponsorship says: I'm putting my reputation behind you in rooms you're not in yet.
            </p>
          </FadeIn>
          
          <div className="grid md:grid-cols-2 gap-8 text-left mb-16">
            <FadeIn delay={0.1} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-[#c9a87c] mb-3 uppercase tracking-wider text-sm">For the Talent</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                When a Fellow is recognized, it's the beginning of a persistent record. Her Flightography accumulates human-verified endorsements. Her domain network connects her across 40+ countries. Her influence tier rises as she mentors and endorses others.
              </p>
            </FadeIn>
            <FadeIn delay={0.2} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-[#1e3a5a] mb-3 uppercase tracking-wider text-sm">For Sponsors</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Sponsors see the talent graph: who is verified, who is endorsed by whom, who is rising through which domains. Resource allocation becomes strategic, not charitable. Human verification makes sponsorship possible at scale.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} className="bg-[#1e3a5a] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a87c] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#4a90b8] rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Antifragile by Design
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 font-medium">
                The aerospace industry is entering its most consequential decade. A projected million-person talent gap by 2030. The talent exists. The programs exist. What doesn't exist is the infrastructure to connect all of it.
              </p>
              <p className="text-[#c9a87c] text-xl md:text-2xl font-bold italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                The perception engine is calibrated. The talent graph is live. The missing layer is ready.
              </p>
              <div className="mt-10">
                <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#c9a87c] hover:bg-[#b09268] text-[#0a1526] font-bold px-8 py-6 rounded-full text-base shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:shadow-[0_0_30px_rgba(201,168,124,0.5)] transition-all hover:scale-105 active:scale-95 uppercase tracking-wider">
                    Join The Graph on Wefunder
                  </Button>
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer Signature */}
      <footer className="py-12 bg-[#0a1526] text-center border-t border-white/5">
        <p className="text-[#c9a87c] font-bold tracking-widest uppercase text-sm mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>Ad Astra.</p>
        <p className="text-slate-500 text-xs font-medium">TOP 100 Aerospace & Aviation • The Perception Engine</p>
      </footer>
    </div>
  );
}