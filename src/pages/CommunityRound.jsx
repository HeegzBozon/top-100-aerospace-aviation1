import React from 'react';
import { ArrowLeft, Rocket, CheckCircle2, TrendingUp, Users, Target, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CommunityRound() {
  return (
    <div className="min-h-screen bg-[#0a1526] text-white selection:bg-[#c9a87c] selection:text-slate-950 font-sans">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden border-b border-[#4a90b8]/10">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1e3a5a] blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#c9a87c] blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <Link to="/" className="mb-8">
            <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live on Wefunder
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
            Aerospace recognition infrastructure that turns influence into <span className="text-[#c9a87c]">institutional power.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            A human-verified talent graph that connects recognition to sponsorship, mentorship to capital, and siloed programs to coordinated action.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 font-bold px-8 rounded-full h-14 text-base shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:shadow-[0_0_30px_rgba(201,168,124,0.5)] transition-all">
                <Rocket className="w-5 h-5 mr-2" />
                Reserve your spot now
              </Button>
            </a>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-amber-900/20 border border-amber-500/30 inline-flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Early Bird Bonus</div>
              <div className="text-slate-200 text-sm">The first $25K of investments will be in a SAFE with a $3M valuation cap.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-12 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Investor Memo */}
          <section className="space-y-12">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#c9a87c]">Investor Memo</h2>
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-xs text-slate-500 font-mono">Wefunder Community Round · 2026</span>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">The Missing Layer</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <p>Aerospace has dozens of programs fighting for gender parity. None of them are connected. We're building the missing layer: a human-verified talent graph.</p>
                <p>Women are 47% of the U.S. workforce and 13% of aerospace. The organizations working to close that gap are real, well-funded, and committed. But they operate in silos. No shared infrastructure. No connective tissue.</p>
                <p>TOP 100 OS is the fusion layer. A human-verified talent graph that connects recognition to sponsorship, mentorship to capital, and siloed programs to coordinated action.</p>
                <p className="text-[#c9a87c] font-bold text-xl">300+ alumni and Fellows. 1,000+ nominators. 40+ countries. 70+ disciplines. 8 domains. 13,000+ followers. 6,000+ subscribers. 5 years of organic building. Zero paid acquisition.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">Three Frames. One System.</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 my-8 space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#c9a87c]" />
                      Human-Verified Talent Graph
                    </h4>
                    <p>Most platforms verify with algorithms. We verify with humans. 1,000+ nominators who have personally observed and vouched for candidates. Tier 2+ Fellows endorse. Tier 3+ Fellows vote with weighted authority. The Governing Council stewards the institutional standard. The algorithm doesn't replace human judgment. It amplifies it. This is human-centered design: technology serves human intelligence, not the other way around. And it's an unreplicable moat. A competitor can copy code. They cannot copy a trust graph built over 5 years.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#c9a87c]" />
                      Mycelium
                    </h4>
                    <p>In a forest, mycorrhizal fungi connect root systems, facilitating nutrient exchange and enabling coordination. WAI, IAWA, WIA, and corporate programs are essential trees. TOP 100 OS is the fungal network: the connective tissue. But unlike algorithmic networks, ours is built from human trust. The hyphae are relationships. The nutrient exchange is peer verification.</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#c9a87c]" />
                      Antifragile
                    </h4>
                    <p>Most diversity infrastructure is episodic: annual conferences, annual reports, annual awards. TOP 100 OS is always on, and gets denser with every activation. Every launch, policy shift, and industry moment strengthens the network. Fragile systems break under stress. This one benefits from it.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a87c]/5 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-3xl font-serif font-bold text-white relative z-10">Why Now, Why Community</h3>
              <div className="space-y-6 text-slate-300 leading-relaxed text-lg relative z-10">
                <p>The industry is entering its most consequential decade. $995 billion in U.S. A&D revenue. A projected million-person talent gap by 2030. IAWA's 2026 report says the industry must move from passive support to active sponsorship. The talent exists. The programs exist. What doesn't exist is the infrastructure to connect all of it.</p>
                <p>We're raising on Wefunder because our community is our diligence. The 1,000+ nominators and 300+ Fellows who built this platform's credibility aren't spectators. They're the investors. $100 minimum. Community-owned. Governance-first.</p>
                
                <div className="flex items-center gap-4 py-4">
                  <div className="text-2xl font-light text-white">Minimum investment:</div>
                  <div className="text-3xl font-bold text-[#c9a87c]">$100</div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-widest">Use of Funds</h4>
                  <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: '40%' }} title="Platform build (40%)" />
                    <div className="h-full bg-indigo-500" style={{ width: '20%' }} title="Community growth (20%)" />
                    <div className="h-full bg-purple-500" style={{ width: '18%' }} title="Brand & media (18%)" />
                    <div className="h-full bg-rose-500" style={{ width: '12%' }} title="Revenue infrastructure (12%)" />
                    <div className="h-full bg-amber-500" style={{ width: '10%' }} title="Operations & legal (10%)" />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Platform build (40%)</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Community growth (20%)</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Brand & media (18%)</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Revenue (12%)</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Ops & legal (10%)</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xl font-medium text-white mb-6">5 years of organic building. Season 4 is when it surfaces. Ad Astra.</p>
                  <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer" className="block sm:inline-block">
                    <Button size="lg" className="w-full sm:w-auto bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 font-bold px-8 rounded-full h-14 text-base">
                      Invest in the record that aerospace never built
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 font-serif flex items-center gap-2">
              <Target className="w-5 h-5 text-[#c9a87c]" />
              Highlights
            </h3>
            
            <div className="space-y-5">
              {[
                { icon: Users, text: "300+ alumni and Fellows across 5 years." },
                { icon: ShieldCheck, text: "1,000+ nominators acting as our human verification network." },
                { icon: Globe, text: "40+ countries represented across the aerospace value chain." },
                { icon: Target, text: "70+ disciplines spanning Space, Aviation, Academia, Policy & more." },
                { icon: TrendingUp, text: "13,000+ LinkedIn followers & 6,000+ newsletter subscribers." },
                { icon: Cpu, text: "5 years of organic building. Zero paid acquisition." },
                { icon: CheckCircle2, text: "Recognition that converts to authority — not a list, an operating system." }
              ].map((highlight, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#1e3a5a]/50 border border-[#4a90b8]/30 flex items-center justify-center shrink-0">
                    <highlight.icon className="w-3 h-3 text-[#4a90b8]" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {highlight.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-xs text-slate-500 leading-relaxed text-justify">
                We are 'testing the waters' to gauge investor interest in an offering under Regulation Crowdfunding. No money or other consideration is being solicited. If sent, it will not be accepted. No offer to buy securities will be accepted. No part of the purchase price will be received until a Form C is filed and only through Wefunder's platform. Any indication of interest involves no obligation or commitment of any kind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}