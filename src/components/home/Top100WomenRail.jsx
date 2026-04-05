import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function Top100WomenRail() {
  const [carouselApi, setCarouselApi] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const { data: women, isLoading } = useQuery({
    queryKey: ['top-100-women-2025-rail'],
    queryFn: async () => {
      // Fetch nominees that have winner status
      const data = await base44.entities.Nominee.filter({ status: 'winner' }, '', 200);
      return data;
    }
  });

  const shuffledWomen = useMemo(() => {
    if (!women) return [];
    return [...women].sort(() => 0.5 - Math.random());
  }, [women]);

  useEffect(() => {
    if (!carouselApi || isHovered) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselApi, isHovered]);

  if (!isLoading && shuffledWomen.length === 0) return null;

  return (
    <div 
      className="w-full border-t border-white/10 pt-4 pb-4 bg-black/20 mt-auto relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-6">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase">
          <Award className="w-4 h-4 text-[#c9a87c]" />
          Top 100 Women 2025
        </h4>
        <Link to="/Top100Women2025" className="text-[10px] text-[#c9a87c] hover:text-white font-semibold uppercase tracking-wider flex items-center transition-colors">
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Link>
      </div>

      <Carousel 
        setApi={setCarouselApi}
        opts={useMemo(() => ({ loop: true, align: "start" }), [])}
        className="w-full"
      >
        <CarouselContent className="-ml-3 px-4 md:px-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <CarouselItem key={i} className="pl-3 basis-auto">
                <div className="w-[220px] rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-3/4 bg-white/10" />
                      <Skeleton className="h-2 w-1/2 bg-white/10" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))
          ) : shuffledWomen?.map((woman) => (
            <CarouselItem key={woman.id} className="pl-3 basis-auto">
              <a 
                href={`/ProfileView?id=${woman.id}`}
                className="block w-[220px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a87c]/50 p-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={woman.avatar_url || woman.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(woman.name)}&background=1e3a5a&color=c9a87c`} 
                    alt={woman.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 group-hover:border-[#c9a87c] transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-100 truncate group-hover:text-white transition-colors">{woman.name}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{woman.title || woman.company || 'Aerospace Leader'}</p>
                  </div>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}