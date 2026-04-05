import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedProfilePanel from '@/components/publication/EnhancedProfilePanel';
import ShareableCard from '@/components/publication/ShareableCard';

export default function Top100WomenRail() {
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [shareNominee, setShareNominee] = useState(null);
  const [carouselApi, setCarouselApi] = useState(null);

  useEffect(() => {
    window.openShareCard = (nominee) => setShareNominee(nominee);
    return () => { window.openShareCard = null; };
  }, []);

  const { data: nominees, isLoading } = useQuery({
    queryKey: ['top100-women-rail'],
    queryFn: async () => {
      const allNominees = await base44.entities.Nominee.list('-created_date', 500);
      const activeNominees = allNominees.filter(n => n.status === 'active' || n.status === 'winner' || n.status === 'finalist');
      return activeNominees.sort(() => 0.5 - Math.random()).slice(0, 100);
    }
  });

  useEffect(() => {
    if (!carouselApi || !nominees?.length) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselApi, nominees]);

  return (
    <div className="w-full mt-6 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Top 100 Women 2025
        </h4>
      </div>

      <div className="relative group">
        <Carousel 
          setApi={setCarouselApi} 
          opts={{ loop: true, align: "start" }} 
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <CarouselItem key={i} className="pl-3 basis-auto">
                  <div className="w-[260px] rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-full bg-white/10" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4 bg-white/10" />
                        <Skeleton className="h-3 w-1/2 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : nominees?.map((nominee) => (
              <CarouselItem key={nominee.id} className="pl-3 basis-auto">
                <button 
                  onClick={() => setSelectedNominee(nominee)}
                  className="w-[260px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a87c]/50 p-4 flex items-center gap-4 transition-all group/btn text-left h-full"
                >
                  <img 
                    src={nominee.avatar_url || nominee.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=1e3a5a&color=c9a87c`} 
                    alt={nominee.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover/btn:border-[#c9a87c] transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0 whitespace-normal">
                    <h5 className="font-bold text-sm text-white truncate group-hover/btn:text-[#c9a87c] transition-colors">{nominee.name}</h5>
                    <p className="text-xs text-white/60 line-clamp-1 mt-0.5">{nominee.title}</p>
                    <p className="text-[10px] text-white/40 line-clamp-1 mt-1">{nominee.company}</p>
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 border-none bg-black/50 text-white hover:bg-black/80 w-8 h-8" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-black/50 text-white hover:bg-black/80 w-8 h-8" />
          </div>
        </Carousel>
      </div>

      {selectedNominee && (
        <EnhancedProfilePanel 
          nominee={selectedNominee}
          rank={nominees.findIndex(n => n.id === selectedNominee.id) + 1}
          onClose={() => setSelectedNominee(null)}
          onShare={(nominee) => setShareNominee(nominee)}
          autoPlaying={false}
          onAutoPlayChange={() => {}}
          onNextNominee={() => {}}
          hasNextNominee={false}
          onPrevNominee={() => {}}
          hasPrevNominee={false}
        />
      )}
      
      {shareNominee && (
        <ShareableCard 
          nominee={shareNominee}
          rank={nominees.findIndex(n => n.id === shareNominee.id) + 1}
          onClose={() => setShareNominee(null)} 
        />
      )}
    </div>
  );
}