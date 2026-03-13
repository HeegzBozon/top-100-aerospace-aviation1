import React, { useState, useEffect } from 'react';
import { Crown, Star, Zap, Award, TrendingUp } from 'lucide-react';

const SPOTLIGHT_CATEGORIES = [
  {
    id: 'rising_star',
    name: 'Rising Stars',
    icon: TrendingUp,
    color: 'from-green-400 to-emerald-500',
    description: 'Emerging talents making their mark'
  },
  {
    id: 'rock_star',
    name: 'Rock Stars',
    icon: Zap,
    color: 'from-purple-400 to-pink-500',
    description: 'Consistent high performers'
  },
  {
    id: 'super_star',
    name: 'Super Stars',
    icon: Star,
    color: 'from-blue-400 to-cyan-500',
    description: 'Exceptional leaders and innovators'
  },
  {
    id: 'north_star',
    name: 'North Stars',
    icon: Crown,
    color: 'from-yellow-400 to-orange-500',
    description: 'Visionary guides and mentors'
  }
];

export default function SpotlightLayer({ nominees, onNomineeClick }) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const currentCategory = SPOTLIGHT_CATEGORIES[currentCategoryIndex];

  // Rotate through categories every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex(prev => (prev + 1) % SPOTLIGHT_CATEGORIES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getSpotlightNominees = () => {
    if (!nominees || nominees.length === 0) return [];
    
    const startIndex = currentCategoryIndex * 2;
    return nominees.slice(startIndex, startIndex + 3);
  };

  const spotlightNominees = getSpotlightNominees();
  const Icon = currentCategory.icon;

  if (!spotlightNominees || spotlightNominees.length === 0) {
    return (
      <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-3 lg:p-4">
        <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br ${currentCategory.color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-bold text-[var(--text)]">{currentCategory.name}</h2>
            <p className="text-xs text-[var(--muted)] hidden sm:block">{currentCategory.description}</p>
          </div>
        </div>
        <div className="text-center py-4 lg:py-6">
          <p className="text-[var(--muted)] text-sm">No {currentCategory.name.toLowerCase()} to showcase.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-3 lg:p-4">
      <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br ${currentCategory.color} flex items-center justify-center transition-all duration-500`}>
          <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-base lg:text-lg font-bold text-[var(--text)]">{currentCategory.name}</h2>
          <p className="text-xs text-[var(--muted)] hidden sm:block">{currentCategory.description}</p>
        </div>
        
        {/* Category Indicators */}
        <div className="flex gap-1">
          {SPOTLIGHT_CATEGORIES.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentCategoryIndex 
                  ? 'bg-[var(--accent-2)]' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {spotlightNominees.map((nominee, index) => (
          <div 
            key={nominee.nomineeId || nominee.id || index}
            className="relative group cursor-pointer bg-black/10 rounded-xl p-2 lg:p-3 border border-white/5 hover:bg-white/10 transition-all duration-300"
            onClick={() => onNomineeClick(nominee)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-1 lg:mb-2">
                <img
                  src={nominee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${nominee.nomineeName || 'default'}`}
                  alt={nominee.nomineeName || 'Competitor'}
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white/20"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 lg:w-6 lg:h-6 bg-gradient-to-br ${
                  index === 0 ? currentCategory.color : 'from-gray-600 to-gray-800'
                } rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                  #{nominee.rank || index + 1}
                </div>
              </div>
              <h3 className="text-xs lg:text-sm font-bold truncate group-hover:text-[var(--accent-2)] transition-colors w-full">
                {nominee.nomineeName || 'Unknown Competitor'}
              </h3>
              <div className="flex items-center gap-1 lg:gap-2 mt-1 text-xs">
                <span className="font-bold text-[var(--accent-2)]">{Math.round(nominee.aura || 0)}</span>
                {(nominee.delta24h !== null && nominee.delta24h !== undefined) && (
                  <span className={`font-bold ${
                    (nominee.delta24h || 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(nominee.delta24h || 0) > 0 ? '+' : ''}{nominee.delta24h || 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}