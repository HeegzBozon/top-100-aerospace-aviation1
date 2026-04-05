import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';

export default function HonoreeSpotlightRail() {
  const [carouselApi, setCarouselApi] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { data: fellows, isLoading } = useQuery({
    queryKey: ['artemis-fellows-csv-matched'],
    queryFn: async () => {
      const [fellowsData, nomineesData] = await Promise.all([
        base44.entities.ArtemisFellow.list(),
        base44.entities.Nominee.filter({ status: 'active' }, '', 1000)
      ]);
      
      return fellowsData.map((fellow) => {
        const match = nomineesData.find(n => 
          n.name.toLowerCase() === fellow.name.toLowerCase() || 
          n.name.toLowerCase().includes(fellow.name.toLowerCase()) ||
          fellow.name.toLowerCase().includes(n.name.toLowerCase())
        );
        
        return {
          ...fellow,
          actual_profile_id: match?.id,
          actual_avatar_url: match?.avatar_url || match?.photo_url || null,
        };
      });
    }
  });

  useEffect(() => {
    if (!carouselApi || !fellows?.length || isHovered) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselApi, fellows, isHovered]);

  return (
    <div 
      className="w-full border-t border-[#4a90b8]/20 pt-4 pb-4 bg-[#0a1526]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#c9a87c]" />
          Artemis-Adjacent Fellows
        </h4>
        <Link to="/artemis-2" className="text-xs text-[#c9a87c] hover:text-white font-semibold uppercase tracking-wider flex items-center transition-colors">
          Read the Special Report <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="relative group px-4 md:px-6">
        <Carousel 
          setApi={setCarouselApi} 
          opts={{ loop: true, align: "start", dragFree: true }} 
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <CarouselItem key={i} className="pl-3 basis-auto">
                  <div className="w-[280px] rounded-xl bg-[#1e3a5a]/40 border border-[#4a90b8]/30 p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-full bg-[#1e3a5a]/60" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4 bg-[#1e3a5a]/60" />
                        <Skeleton className="h-3 w-1/2 bg-[#1e3a5a]/60" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : fellows?.map((fellow) => (
              <CarouselItem key={fellow.id} className="pl-3 basis-auto">
                <a 
                  href={fellow.actual_profile_id ? `/ProfileView?id=${fellow.actual_profile_id}` : (fellow.profile_url || '#')}
                  className="w-[280px] block rounded-xl bg-[#1e3a5a]/40 hover:bg-[#1e3a5a]/80 border border-[#4a90b8]/30 hover:border-[#c9a87c]/50 p-4 flex items-center gap-4 transition-all group/btn"
                >
                  <img 
                    src={fellow.actual_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fellow.name)}&background=1e3a5a&color=c9a87c`} 
                    alt={fellow.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#1e3a5a] group-hover/btn:border-[#c9a87c] transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0 whitespace-normal">
                    <h5 className="font-bold text-sm text-slate-100 truncate group-hover/btn:text-white transition-colors">{fellow.name}</h5>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{fellow.rail_copy || fellow.title}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c9a87c]/10 text-[#c9a87c] border border-[#c9a87c]/20">
                      Mission Fellow
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 border-none bg-slate-900/80 text-white hover:bg-slate-800 w-8 h-8" />
            <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 border-none bg-slate-900/80 text-white hover:bg-slate-800 w-8 h-8" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}