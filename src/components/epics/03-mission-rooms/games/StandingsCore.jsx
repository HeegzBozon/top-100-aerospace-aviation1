
import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StandingsCore({ nominees, onRowClick, favorites, processingFav, onFavoriteToggle }) {
  return (
    <div className="space-y-3">
      {nominees.map((nominee) => (
        <div key={nominee.nomineeId} className="bg-[var(--card)]/80 backdrop-blur-2xl rounded-2xl border border-[var(--border)] p-4 hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4">
            {/* Stacked Rank & Favorite Button */}
            <div className="flex flex-col items-center justify-center gap-2 w-10 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onFavoriteToggle(nominee.nomineeId); }}
                disabled={processingFav === nominee.nomineeId}
                className="w-7 h-7 rounded-full"
              >
                <Star className={`w-4 h-4 transition-all ${favorites.includes(nominee.nomineeId) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 group-hover:text-yellow-400'}`} />
              </Button>
              <span className="text-sm sm:text-base font-bold text-[var(--muted)]">#{nominee.rank}</span>
            </div>
            
            {/* Profile Image - Even Bigger */}
            <div className="flex-shrink-0">
              {nominee.avatarUrl ? (
                <img
                  src={nominee.avatarUrl}
                  alt={nominee.nomineeName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                  {nominee.nomineeName ? nominee.nomineeName.slice(0, 2).toUpperCase() : 'NN'}
                </div>
              )}
            </div>
            
            {/* Content Area - Clickable */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onRowClick(nominee)}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[var(--text)] truncate text-base sm:text-lg">{nominee.nomineeName}</h3>
                  <div className="space-y-1">
                    {nominee.title && (
                      <p className="text-sm text-[var(--muted)] truncate">{nominee.title}</p>
                    )}
                    {nominee.company && (
                      <p className="text-sm text-[var(--muted)] truncate">at {nominee.company}</p>
                    )}
                    {nominee.country && (
                      <p className="text-xs text-[var(--muted)]">{nominee.country}</p>
                    )}
                  </div>
                </div>
                
                {/* Aura Score - Smaller */}
                <div className="text-right flex-shrink-0 mt-2 sm:mt-0">
                  <div className="text-lg sm:text-xl font-bold text-[var(--score-aura)]">
                    {nominee.aura || 0}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Aura</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
