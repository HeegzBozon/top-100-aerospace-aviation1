import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import LiveReactionPoll from './LiveReactionPoll';
import ExpertCommentaryCards from './ExpertCommentaryCards';
import LiveStreamComments from './LiveStreamComments';
import HonoreeSpotlightRail from './HonoreeSpotlightRail';

export default function LiveStreamModule() {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="px-4 py-4 md:py-6 max-w-7xl mx-auto relative">
      {/* Subtle Starfield Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-30">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-yellow-100 rounded-full animate-pulse" style={{ animationDelay: '2.1s' }} />
      </div>

      <Card className="relative overflow-hidden bg-slate-950/60 backdrop-blur-xl border-slate-800/60 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-[70%] aspect-video bg-black relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800">
             {isLive ? (
               <iframe 
                 className="absolute inset-0 w-full h-full"
                 src="https://www.youtube.com/embed/8n1GGe0fUBs?autoplay=1&mute=1" 
                 title="Artemis Live Stream" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
                 referrerPolicy="strict-origin-when-cross-origin"
               ></iframe>
             ) : (
               <div className="absolute inset-0 w-full h-full group cursor-pointer">
                 <img 
                   src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&auto=format" 
                   className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-30" 
                   alt="Offline slate" 
                 />
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-80 mb-4" />
                    <span className="text-white font-semibold tracking-widest uppercase">Stream Offline</span>
                 </div>
               </div>
             )}
          </div>
          <div className="lg:w-[30%] bg-slate-950/40 p-3 md:p-4 flex flex-col gap-3 lg:max-h-[500px] overflow-y-auto">
             <LiveReactionPoll />
             <LiveStreamComments />
          </div>
        </div>
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between border-t border-slate-800/50">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9a87c" }}>
              Artemis Mission Theater
            </h3>
            <p className="text-slate-300 max-w-2xl text-sm md:text-base">
              Join us live for the latest updates, mission progress, and expert commentary from our panel of industry fellows.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-4">
             <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-slate-950" src="https://ui-avatars.com/api/?name=E+C&background=1e3a5a&color=c9a87c" alt="Expert" />
                <img className="w-8 h-8 rounded-full border-2 border-slate-950" src="https://ui-avatars.com/api/?name=A+B&background=4a90b8&color=fff" alt="Expert" />
                <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold">+3</div>
             </div>
             <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Experts in Studio</span>
          </div>
        </div>
        <div className="px-4 pb-4 md:px-5 md:pb-5">
           <ExpertCommentaryCards />
        </div>
        <HonoreeSpotlightRail />
      </Card>
    </div>
  );
}