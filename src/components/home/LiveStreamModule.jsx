import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PlayCircle, Pause, Play } from 'lucide-react';
import LiveReactionPoll from './LiveReactionPoll';
import ExpertCommentaryCards from './ExpertCommentaryCards';
import LiveStreamComments from './LiveStreamComments';
import HonoreeSpotlightRail from './HonoreeSpotlightRail';
import MissionControlHeader from './MissionControlHeader';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function LiveStreamModule() {
  const [isLive, setIsLive] = useState(true);
  const [carouselApi, setCarouselApi] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!carouselApi || !isPlaying) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [carouselApi, isPlaying]);

  return (
    <div className="px-4 pb-2 md:pb-3 max-w-7xl mx-auto relative">
      {/* Subtle Starfield Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-30">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-yellow-100 rounded-full animate-pulse" style={{ animationDelay: '2.1s' }} />
      </div>

      <Card className="relative overflow-hidden bg-[#0a1526]/80 backdrop-blur-xl border-[#4a90b8]/20 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:h-[360px] xl:h-[400px]">
          <div className="lg:w-[70%] h-[240px] lg:h-full bg-black relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#4a90b8]/20">
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
          <div className="lg:w-[30%] bg-[#0a1526]/40 p-3 md:p-4 flex flex-col gap-3 h-[360px] xl:h-[400px] lg:h-full overflow-y-auto">
             <LiveReactionPoll />
             <LiveStreamComments />
          </div>
        </div>
        <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full relative group">
          <CarouselContent>
            {/* Slide 1: Mission Theater Bottom Half */}
            <CarouselItem>
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between border-t border-[#4a90b8]/20">
                <div className="pr-16">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9a87c" }}>
                    Artemis Mission Theater
                  </h3>
                  <p className="text-slate-300 max-w-2xl text-sm md:text-base">
                    Join us live for the latest updates, mission progress, and expert commentary from our panel of industry fellows.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                   <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-[#1e3a5a]" src="https://ui-avatars.com/api/?name=E+C&background=1e3a5a&color=c9a87c" alt="Expert" />
                      <img className="w-8 h-8 rounded-full border-2 border-[#1e3a5a]" src="https://ui-avatars.com/api/?name=A+B&background=4a90b8&color=fff" alt="Expert" />
                      <div className="w-8 h-8 rounded-full border-2 border-[#1e3a5a] bg-slate-800 flex items-center justify-center text-[10px] font-bold">+3</div>
                   </div>
                   <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Experts in Studio</span>
                </div>
              </div>
              <div className="px-4 pb-4 md:px-5 md:pb-5">
                 <ExpertCommentaryCards />
              </div>
              <HonoreeSpotlightRail />
            </CarouselItem>

            {/* Slide 2: Mission Control */}
            <CarouselItem>
              <div className="h-full border-t border-[#4a90b8]/20 flex flex-col justify-center">
                 {/* Adding slight padding to match the carousel visual rhythm */}
                 <div className="p-4 md:p-6">
                    <MissionControlHeader />
                 </div>
              </div>
            </CarouselItem>
          </CarouselContent>

          {/* Vibey Carousel Controls */}
          <div className="absolute right-4 top-4 md:right-6 md:top-6 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-[#0a1526]/80 backdrop-blur-md border border-[#c9a87c]/30 shadow-[0_0_15px_rgba(201,168,124,0.15)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:border-[#c9a87c]/60">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-transparent hover:bg-[#c9a87c]/20 text-[#c9a87c] transition-colors"
              title={isPlaying ? "Pause auto-scroll" : "Play auto-scroll"}
            >
              {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" /> : <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />}
            </button>
            <div className="w-px h-6 bg-[#c9a87c]/30 mx-0.5"></div>
            <CarouselPrevious className="static transform-none w-10 h-10 md:w-12 md:h-12 bg-transparent border-none text-[#c9a87c] hover:bg-[#c9a87c]/20 hover:text-[#c9a87c] [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6" />
            <CarouselNext className="static transform-none w-10 h-10 md:w-12 md:h-12 bg-transparent border-none text-[#c9a87c] hover:bg-[#c9a87c]/20 hover:text-[#c9a87c] [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6" />
          </div>
        </Carousel>
      </Card>
    </div>
  );
}