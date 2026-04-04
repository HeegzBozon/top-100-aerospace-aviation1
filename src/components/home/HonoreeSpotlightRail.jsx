import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Award } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';

export default function HonoreeSpotlightRail() {
  const { data: nominees, isLoading } = useQuery({
    queryKey: ['artemis-fellows'],
    queryFn: async () => {
      // Fetch some active nominees, sorting by score to get notable fellows
      return base44.entities.Nominee.filter({ status: 'active' }, '-aura_score', 10);
    }
  });

  return (
    <div className="w-full border-t border-slate-800/50 pt-6 pb-6 bg-slate-950/50">
      <div className="flex items-center justify-between mb-4 px-6 md:px-8">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#c9a87c]" />
          Artemis-Adjacent Fellows
        </h4>
        <button className="text-xs text-[#c9a87c] hover:text-white font-semibold uppercase tracking-wider flex items-center transition-colors">
          View Directory <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-4 px-6 md:px-8">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-[280px] shrink-0 rounded-xl bg-slate-900 border border-slate-800 p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-slate-800" />
                    <Skeleton className="h-3 w-1/2 bg-slate-800" />
                  </div>
                </div>
              </div>
            ))
          ) : nominees?.map((nominee) => (
            <a 
              key={nominee.id}
              href={`/profiles/${nominee.id}`}
              className="w-[280px] shrink-0 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-[#c9a87c]/50 p-4 flex items-center gap-4 transition-all group"
            >
              <img 
                src={nominee.avatar_url || nominee.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&background=1e3a5a&color=c9a87c`} 
                alt={nominee.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-800 group-hover:border-[#c9a87c] transition-colors shrink-0"
              />
              <div className="flex-1 min-w-0 whitespace-normal">
                <h5 className="font-bold text-sm text-slate-100 truncate group-hover:text-white transition-colors">{nominee.name}</h5>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{nominee.title || nominee.industry || 'Space Pioneer'}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c9a87c]/10 text-[#c9a87c] border border-[#c9a87c]/20">
                  Mission Fellow
                </div>
              </div>
            </a>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-slate-900/50" />
      </ScrollArea>
    </div>
  );
}