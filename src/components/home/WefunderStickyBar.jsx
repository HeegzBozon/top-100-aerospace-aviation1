import React from 'react';
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WefunderStickyBar() {
  return (
    <div className="p-4 bg-gradient-to-b from-[#1e3a5a]/20 to-[#0a1526]/80 border border-[#c9a87c]/30 rounded-2xl relative overflow-hidden flex flex-col items-center text-center group transition-all duration-500 hover:border-[#c9a87c]/60 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(201,168,124,0.15)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#c9a87c]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#c9a87c]/20 transition-colors duration-500" />
      
      <div className="w-10 h-10 rounded-full bg-[#c9a87c]/10 border border-[#c9a87c]/30 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(201,168,124,0.2)]">
        <Rocket className="w-5 h-5 text-[#c9a87c]" />
      </div>
      
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <h4 className="text-[#c9a87c] font-bold text-sm leading-tight">Invest in the New Space Economy</h4>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          Join our Wefunder community round and own a piece of TOP 100.
        </p>
      </div>
      
      <Link 
        to="/community-round"
        className="w-full bg-[#c9a87c] text-slate-950 hover:bg-[#b09268] py-2 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-300 relative z-10 shadow-[0_0_15px_rgba(201,168,124,0.2)] hover:shadow-[0_0_20px_rgba(201,168,124,0.4)] hover:scale-[1.02]"
      >
        Invest Now
      </Link>
    </div>
  );
}