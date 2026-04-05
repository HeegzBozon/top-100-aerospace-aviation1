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
            13,000+ member community. Honorees from NASA, SpaceX, Boeing, Airbus & the USAF.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="https://wefunder.com/top.100.aerospace.aviation/join" target="_blank" rel="noopener noreferrer">
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
              <span className="text-xs text-slate-500 font-mono">Wefunder Community Round · 2025</span>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">The question nobody can answer</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <p>Ask anyone in aerospace: <em>Who actually built Artemis? Who designed the guidance system on Falcon 9? Who trained the engineers running the F-35 program?</em></p>
                <p>Nobody knows. Not officially. Not verifiably. Not in any structured, permanent way.</p>
                <p>The aerospace industry is a $440B global sector — one of the most credentialed, relationship-driven industries on earth. And it has no IMDb. No authoritative talent record. No structured platform for verified career credits, governance-weighted recognition, or institutional memory.</p>
                <p className="text-[#c9a87c] font-bold text-xl">That's the gap we're closing.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">What we're building</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <p><strong className="text-white">TOP 100 OS is the Aerospace Talent Graph</strong> — a recognition-powered platform that maps <em>who built what</em> across aviation, space, and defense.</p>
                <p>We started with the most credible entry point we could build: <strong>the TOP 100 Women in Aerospace 2025</strong> — 100 ranked honorees across 8 domains, spanning 20+ countries. Recognition is the front door. The deeper platform — verified career credits, peer-validated program contributions, reputation-weighted influence rankings — is the destination.</p>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 my-8 space-y-4">
                  <p className="font-bold text-white mb-4">Think of it as three institutions in one:</p>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                      <span><strong>IMDb</strong> for aerospace talent — structured credits for every program contribution</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                      <span><strong>Wikipedia</strong> for aerospace programs — canonical pages for Artemis, Falcon 9, the F-35</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                      <span><strong>LinkedIn</strong> for aerospace credibility — influence earned through verified authority, not ad spend</span>
                    </li>
                  </ul>
                </div>
                <p>Together, these form the <strong>Flightography</strong> system: a permanent, portable career record owned by the professional — not by a corporate HR database.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">Why now</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <p>Aerospace is entering its most consequential decade. Space is being commercialized. Defense is being modernized. Sustainability mandates are reshaping aviation. The workforce powering these shifts is global, diverse, and largely invisible to the institutional record.</p>
                <p>The engineers who built what's flying today deserve more than a résumé line. They deserve a permanent record. We're building it.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-white">What makes this defensible</h3>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                <p>Every credit claimed deepens the graph. Every honoree who joins validates the record. Every program page that goes live makes the platform harder to replicate from scratch.</p>
                <p>This isn't a media company selling attention. It's a governance-first institution selling structured authority — and the revenue model reflects that:</p>
                
                <div className="grid sm:grid-cols-2 gap-4 my-6">
                  {[
                    "Sponsorship tiers: $10K–$150K per partner",
                    "Strategic residencies: $20K–$75K/month",
                    "Retainer programs: $5K–$35K/month",
                    "Honoree Visibility Accelerator: $1.5K–$5K per honoree",
                    "Future: recruiting marketplace, investor discovery, industry research reports"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                      <div className="text-[#c9a87c] font-bold text-sm bg-[#c9a87c]/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</div>
                      <span className="text-sm font-medium text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[#c9a87c] font-bold italic text-xl">Revenue attaches to authority. The graph compounds. The moat widens.</p>
              </div>
            </div>

            <div className="space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a87c]/5 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-3xl font-serif font-bold text-white relative z-10">The Ask</h3>
              <div className="space-y-6 text-slate-300 leading-relaxed text-lg relative z-10">
                <p>We're raising on Wefunder because this platform should be co-owned by the people who believe in it — engineers, founders, researchers, investors, and anyone who knows that aerospace deserves better infrastructure than it has.</p>
                
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
                  <p className="text-xl font-medium text-white mb-6">You are not investing in attention arbitrage. You are co-founding an institution.</p>
                  <a href="https://wefunder.com/top.100.aerospace.aviation/join" target="_blank" rel="noopener noreferrer" className="block sm:inline-block">
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
                { icon: Users, text: "13,000+ member community. Honorees from NASA, SpaceX, Boeing, Airbus & the USAF." },
                { icon: Globe, text: "300+ ranked honorees across 30+ countries — the most global aerospace index built." },
                { icon: TrendingUp, text: "Global aerospace workforce exceeds 1M professionals — all underserved by existing platforms." },
                { icon: ShieldCheck, text: "Featured honorees hold P&L authority at some of the world's largest aerospace firms." },
                { icon: Target, text: "Honoree network includes astronauts, engineers, executives & policy leaders across 30+ nations." },
                { icon: Cpu, text: "We're building the institutional nervous system for Aerospace & Aviation talent." },
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