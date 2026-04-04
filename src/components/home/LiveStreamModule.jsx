import React from 'react';
import { Card } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import LiveReactionPoll from './LiveReactionPoll';
import ExpertCommentaryCards from './ExpertCommentaryCards';

export default function LiveStreamModule() {
  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <Card className="overflow-hidden bg-slate-950 border-slate-800 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-[70%] aspect-video bg-black relative flex items-center justify-center group cursor-pointer border-b lg:border-b-0 lg:border-r border-slate-800">
             <img 
               src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&auto=format" 
               className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-30" 
               alt="Live stream placeholder" 
             />
             <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
               LIVE
             </div>
             <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300 z-10" />
          </div>
          <div className="lg:w-[30%] bg-slate-950 p-4 md:p-6 flex flex-col justify-center items-center">
             <LiveReactionPoll />
          </div>
        </div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-t border-slate-800/50">
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
        <div className="px-6 pb-6 md:px-8 md:pb-8">
           <ExpertCommentaryCards />
        </div>
      </Card>
    </div>
  );
}