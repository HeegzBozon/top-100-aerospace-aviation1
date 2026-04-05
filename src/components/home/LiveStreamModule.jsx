import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PlayCircle, Pause, Play, ChevronRight, Rocket, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExpertCommentaryCards from './ExpertCommentaryCards';
import LiveStreamComments from './LiveStreamComments';
import FloatingReactions from './FloatingReactions';
import HonoreeSpotlightRail from './HonoreeSpotlightRail';
import MissionControlHeader from './MissionControlHeader';
import Top100WomenRail from './Top100WomenRail';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function LiveStreamModule() {
  const [isLive, setIsLive] = useState(true);
  const [carouselApi, setCarouselApi] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!carouselApi || !isPlaying || isHovered) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [carouselApi, isPlaying, isHovered]);

  return (
    <div className="px-4 pb-2 md:pb-3 max-w-7xl mx-auto relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-30">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-yellow-100 rounded-full" style={{ animationDelay: '2.1s' }} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[360px] xl:h-[400px]">
          <Card className="w-full aspect-video lg:w-auto lg:aspect-video lg:h-full bg-black relative flex items-center justify-center overflow-hidden border-[#4a90b8]/20 shadow-2xl shrink-0">
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
             <FloatingReactions />
          </Card>

          <div className="flex-1 min-w-0 flex flex-col h-[360px] xl:h-[400px] lg:h-full">
             <LiveStreamComments />
          </div>
        </div>

        <Card className="relative overflow-hidden bg-[#0a1526]/80 backdrop-blur-xl border-[#4a90b8]/20 text-white shadow-2xl">
          <Carousel 
            setApi={setCarouselApi} 
            opts={{ loop: true }} 
            className="w-full relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CarouselContent>
              <CarouselItem className="flex flex-col h-full">
                <div className="flex-1 flex flex-col border-t border-[#4a90b8]/20 relative overflow-hidden">
                  <div className="p-3 md:p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
                    <div className="pr-12 md:pr-16">
                      <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9a87c" }}>
                        Artemis Mission Theater
                      </h3>
                      <p className="text-slate-300 max-w-2xl text-xs md:text-sm leading-relaxed">
                        Join us live for the latest updates, mission progress, and expert commentary from our panel of industry fellows.
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                       <div className="flex -space-x-2">
                          <img className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#1e3a5a]" src="https://ui-avatars.com/api/?name=E+C&background=1e3a5a&color=c9a87c" alt="Expert" />
                          <img className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#1e3a5a]" src="https://ui-avatars.com/api/?name=A+B&background=4a90b8&color=fff" alt="Expert" />
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#1e3a5a] bg-slate-800 flex items-center justify-center text-[9px] md:text-[10px] font-bold">+3</div>
                       </div>
                       <span className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-wider uppercase">Correspondents</span>
                    </div>
                  </div>
                  <div className="px-3 pb-3 md:px-4 md:pb-4 flex-1 flex flex-col justify-center">
                     <ExpertCommentaryCards />
                  </div>
                  <div className="shrink-0 px-4 md:px-6 pb-4 md:pb-5">
                    <HonoreeSpotlightRail />
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="flex flex-col h-full">
                <div className="flex-1 flex flex-col border-t border-[#4a90b8]/20 relative overflow-hidden">
                   <MissionControlHeader className="!rounded-none" />
                </div>
              </CarouselItem>

              <CarouselItem className="flex flex-col h-full">
                <div className="flex-1 flex flex-col border-t border-[#4a90b8]/20 relative overflow-hidden">
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e3a5a] blur-[100px] opacity-30 pointer-events-none" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#c9a87c] blur-[120px] opacity-10 pointer-events-none" />
                  
                  <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center relative z-10">
                    <div className="max-w-3xl mx-auto flex flex-col items-center">
                      <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 mb-4 md:mb-5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live on Wefunder
                      </div>
                      
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 md:mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Aerospace recognition infrastructure that turns influence into <span className="text-[#c9a87c]">institutional power.</span>
                      </h2>
                      
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-5 md:mb-6 max-w-xl font-medium">
                        A human-verified talent graph that connects recognition to sponsorship, mentorship to capital, and siloed programs to coordinated action.
                      </p>
                      
                      <div className="flex flex-row gap-3 items-center justify-center flex-wrap">
                        <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
                          <Button className="bg-[#c9a87c] hover:bg-[#b09268] text-slate-950 font-bold px-5 py-2 rounded-full text-xs md:text-sm shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:shadow-[0_0_30px_rgba(201,168,124,0.5)] transition-all flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            Reserve your spot
                          </Button>
                        </a>
                        <a href="https://calendar.app.google/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold px-5 py-2 rounded-full text-xs md:text-sm backdrop-blur-md flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Let's Talk
                          </Button>
                        </a>
                        <a href="mailto:matthew@top100os.com?subject=Data%20Room%20Access%20Request">
                          <Button variant="outline" className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold px-5 py-2 rounded-full text-xs md:text-sm backdrop-blur-md flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Data Room
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 px-4 md:px-6 pb-4 md:pb-5 relative z-20">
                    <Top100WomenRail />
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="flex flex-col h-full">
                <div className="flex-1 flex flex-col border-t border-[#4a90b8]/20 relative overflow-hidden">
                   <div className="absolute top-8 right-8 w-32 h-32 opacity-10 pointer-events-none text-[#4a90b8]">
                     <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                   </div>
                   
                   <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col justify-center relative z-10">
                     <div className="text-[10px] uppercase tracking-widest text-[#c9a87c] font-bold mb-4 absolute top-4 left-6 hidden md:block">Alumni & Fellow Correspondents</div>
                     
                     <div className="flex flex-col gap-4 lg:gap-8 items-center w-full max-w-5xl mx-auto pt-2 md:pt-6 mt-2 md:mt-0">
                       {/* Top Banner / Program Launch */}
                       <div className="w-full text-center mb-6 md:mb-10 bg-[#c9a87c]/10 border border-[#c9a87c]/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(201,168,124,0.15)]">
                         <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[#c9a87c]/40 bg-[#c9a87c]/20 text-[#c9a87c] text-[10px] font-bold uppercase tracking-widest">
                           <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] animate-pulse" />
                           Program Launch
                         </div>
                         <h2 className="text-[#c9a87c] text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider mb-3 md:mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                           THE ALUMNI CORRESPONDENT PROGRAM IS LIVE.
                         </h2>
                         <p className="text-slate-200 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
                           The index just got a voice. Alumni publishing directly to the community — always on, year-round.
                         </p>
                       </div>

                       <div className="w-full flex flex-col md:flex-row gap-4 lg:gap-8 items-center md:items-start pt-2 border-t border-[#4a90b8]/30">
                         {/* Left Side: Avatar & Info */}
                         <div className="flex-1 flex flex-col md:flex-row gap-4 items-center text-center md:text-left min-w-0 w-full mt-4">
                           <div className="shrink-0 relative">
                             <img 
                               src="https://media.base44.com/images/public/68996845be6727838fdb822e/1261c7b10_Untitleddesign-11.png" 
                               alt="Morgan Kainu" 
                               className="w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                             />
                           </div>
                           <div className="min-w-0 flex flex-col justify-center">
                             <h3 className="text-[#c9a87c] text-base md:text-lg font-bold mb-1">
                               Morgan Kainu 
                             </h3>
                             <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider leading-relaxed">
                               TOP 100 WOMEN 2021 & 2022 • MISSION DEVELOPMENT DIRECTOR @ SPACE NATION | APPLIED SPACE ANTHROPOLOGIST
                             </p>
                           </div>
                         </div>
                         
                         {/* Right Side: Active Mission */}
                         <div className="flex-1 md:border-l border-[#4a90b8]/30 md:pl-6 lg:pl-8 flex flex-col justify-center text-center md:text-left mt-4">
                           <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#c95a43]" />
                             <span className="text-[#c95a43] text-[10px] font-bold uppercase tracking-widest">Active Mission</span>
                           </div>
                           <p className="text-slate-200 text-xs leading-relaxed mb-4 font-medium">
                             Recruiting for the STAR Summit—an immersive 5-day analog mission training program at Biosphere 2. Develop leadership, teamwork, and operational readiness under pressure.
                           </p>
                           <div>
                             <a href="/star-summit">
                               <button className="bg-gradient-to-r from-[#c95a43] to-[#8f2a58] hover:from-[#b34d38] hover:to-[#7a224a] text-white text-[10px] font-bold uppercase tracking-wider px-5 py-2 rounded-full shadow-[0_0_15px_rgba(201,90,67,0.3)] hover:shadow-[0_0_20px_rgba(201,90,67,0.5)] transition-all hover:scale-105 active:scale-95">
                                 Explore STAR Summit
                               </button>
                             </a>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="shrink-0 px-4 md:px-6 pb-4 md:pb-5 relative z-20">
                     <Top100WomenRail />
                   </div>
                </div>
              </CarouselItem>
            </CarouselContent>

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
    </div>
  );
}