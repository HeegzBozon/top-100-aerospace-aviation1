import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';

export default function HonoreeSpotlightRail() {
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

  const marqueeItems = fellows ? [...fellows, ...fellows, ...fellows] : [];

  return (
    <div className="w-full border-t border-[#4a90b8]/20 pt-4 pb-4 bg-[#0a1526]/50 overflow-hidden">
      <style>
        {`
          @keyframes seamless-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333333%); }
          }
          .animate-seamless-marquee {
            animation: seamless-marquee 60s linear infinite;
          }
          .group:hover .animate-seamless-marquee {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#c9a87c]" />
          Artemis-Adjacent Fellows
        </h4>
        <Link to="/artemis-2" className="text-xs text-[#c9a87c] hover:text-white font-semibold uppercase tracking-wider flex items-center transition-colors">
          Read the Special Report <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="w-full group overflow-hidden">
        <div className="flex w-max space-x-4 px-4 animate-seamless-marquee">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="w-[240px] shrink-0 rounded-2xl bg-[#1e3a5a]/40 border border-[#4a90b8]/30 p-5 flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full bg-[#1e3a5a]/60 mb-4" />
                <div className="space-y-2 w-full flex flex-col items-center">
                  <Skeleton className="h-4 w-3/4 bg-[#1e3a5a]/60" />
                  <Skeleton className="h-3 w-1/2 bg-[#1e3a5a]/60" />
                  <Skeleton className="h-3 w-2/3 bg-[#1e3a5a]/60 mt-2" />
                </div>
              </div>
            ))
          ) : marqueeItems.map((fellow, i) => (
            <a 
              key={`${fellow.id}-${i}`}
              href={fellow.actual_profile_id ? `/ProfileView?id=${fellow.actual_profile_id}` : (fellow.profile_url || '#')}
              className="w-[240px] shrink-0 rounded-2xl bg-[#1e3a5a]/40 hover:bg-[#1e3a5a]/80 border border-[#4a90b8]/30 hover:border-[#c9a87c]/50 p-5 flex flex-col items-center text-center transition-all"
            >
              <img 
                src={fellow.actual_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fellow.name)}&background=1e3a5a&color=c9a87c`} 
                alt={fellow.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#1e3a5a] mb-3 transition-colors shrink-0 shadow-lg"
              />
              <div className="flex flex-col flex-1 min-w-0 whitespace-normal items-center w-full">
                <h5 className="font-bold text-base text-slate-100 line-clamp-2 transition-colors leading-tight">{fellow.name}</h5>
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">{fellow.rail_copy || fellow.title}</p>
                {fellow.company && <p className="text-xs font-semibold text-[#c9a87c] mt-1.5 line-clamp-1">{fellow.company}</p>}
                <div className="mt-auto pt-4 w-full">
                  <div className="inline-flex w-full items-center justify-center px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#c9a87c]/10 text-[#c9a87c] border border-[#c9a87c]/20">
                    Mission Fellow
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}