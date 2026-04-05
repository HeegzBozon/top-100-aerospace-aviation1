import React from 'react';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CommunityRound() {
  return (
    <div className="min-h-screen bg-[#0a1526] text-white">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#1e3a5a] blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#c9a87c] blur-[100px] opacity-20" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <Link to="/" className="mb-8">
            <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live on Wefunder
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Own a Piece of <br className="hidden md:block" />
            <span className="text-[#c9a87c]">TOP 100 Aerospace</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            We are opening our cap table to the community. Invest in the platform that measures, celebrates, and scales the people building the future of aerospace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 font-bold px-8 rounded-full h-14 text-base">
                <Rocket className="w-5 h-5 mr-2" />
                Invest on Wefunder
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6 text-[#c9a87c]">Why we are raising a community round</h2>
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>
              When we started TOP 100, we had a simple hypothesis: the aerospace industry does a great job celebrating missions and machines, but a terrible job celebrating the people who build them.
            </p>
            <p>
              We've built a powerful platform that connects the most talented individuals in aerospace, aviation, and defense. Our community spans across continents, disciplines, and career stages. We're now raising capital to scale our platform's capabilities, expand our editorial reach, and introduce new tools for professional discovery.
            </p>
            <p>
              We didn't want to just go to traditional venture capital. We want the people who make up our ecosystem to literally own the platform they are a part of. That's why we're raising on Wefunder.
            </p>
          </div>

          <div className="mt-10 p-6 bg-[#1e3a5a]/30 border border-[#4a90b8]/30 rounded-2xl">
            <h3 className="text-lg font-bold mb-2 text-white">Disclosure</h3>
            <p className="text-sm text-slate-400">
              We are 'testing the waters' to gauge investor interest in an offering under Regulation Crowdfunding. No money or other consideration is being solicited. If sent, it will not be accepted. No offer to buy securities will be accepted. No part of the purchase price will be received until a Form C is filed and only through Wefunder's platform. Any indication of interest involves no obligation or commitment of any kind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}