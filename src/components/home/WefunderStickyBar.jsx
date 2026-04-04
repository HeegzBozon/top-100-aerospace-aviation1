import React, { useState, useEffect } from 'react';
import { X, Rocket } from 'lucide-react';

export default function WefunderStickyBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('wefunder_cta_dismissed');
    if (!isDismissed) {
      // Small delay to allow the page to load first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('wefunder_cta_dismissed', 'true');
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div className="pointer-events-auto bg-slate-950/95 border border-[#c9a87c]/30 shadow-2xl shadow-black/50 backdrop-blur-xl rounded-2xl w-full max-w-4xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-[#c9a87c]/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#c9a87c]/10 border border-[#c9a87c]/30 items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-[#c9a87c]" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#c9a87c] font-bold text-sm sm:text-base leading-tight">Invest in the Future of Space</h4>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              Join our Wefunder community round and own a piece of TOP 100.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto z-10 shrink-0">
          <a 
            href="https://wefunder.com/top.100.aerospace.aviation" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none whitespace-nowrap bg-[#c9a87c] text-slate-950 hover:bg-[#c9a87c]/90 px-6 py-2 rounded-lg font-bold text-sm transition-colors text-center"
          >
            Invest Now
          </a>
          <button 
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}