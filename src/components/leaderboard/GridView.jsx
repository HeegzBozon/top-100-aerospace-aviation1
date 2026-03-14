
import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function GridView({ nominees }) {
  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500'; // Gold
    if (rank === 2) return 'bg-gray-400';    // Silver
    if (rank === 3) return 'bg-amber-700';   // Bronze
    if (rank <= 10) return 'bg-blue-600';    // Top 10
    return 'bg-gray-500';                 // Others
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />; // Stable or no change
  };

  if (!nominees || nominees.length === 0) {
    return (
      <div className="text-center py-20 bg-[var(--card)]/50 rounded-lg">
        <Star className="mx-auto h-16 w-16 text-[var(--muted)] opacity-50" />
        <h3 className="mt-4 text-xl font-semibold">No Nominees</h3>
        <p className="mt-1 text-[var(--muted)]">
          There are no nominees to display for the selected season.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nominees.map((nominee, index) => (
        <motion.div
          key={nominee.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-[var(--card)] border border-white/20 shadow-lg rounded-2xl p-5 flex flex-col items-center text-center"
        >
          <div className="relative mb-4">
            <img
              src={nominee.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nominee.name)}&size=128&background=random`}
              alt={nominee.name}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-white/10"
            />
            <div
              className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md ${getRankColor(index + 1)}`}
            >
              {index + 1}
            </div>
          </div>
          <h3 className="text-lg font-bold truncate w-full">{nominee.name}</h3>
          <p className="text-sm text-[var(--muted)] truncate w-full">{nominee.title}</p>
          
          <div className="w-full bg-white/5 h-1 rounded-full my-4">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 rounded-full"
              style={{ width: `${(nominee.starpower_score || 0) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">{((nominee.starpower_score || 0) * 1000).toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted)]">
              {getTrendIcon(nominee.trend || 'stable')}
              <span>ELO: {nominee.elo_rating || 1200}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
