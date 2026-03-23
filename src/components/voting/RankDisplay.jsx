import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Star } from 'lucide-react';

export default function RankDisplay({ auraScore, rank, division, showAnimation = true }) {
  const getRankData = (score) => {
    if (score >= 2800) return { name: 'Supersonic Legend', color: 'from-purple-400 to-pink-500', icon: Trophy };
    if (score >= 2400) return { name: 'Grand Champion', color: 'from-yellow-400 to-orange-500', icon: Trophy };
    if (score >= 2000) return { name: 'Champion', color: 'from-blue-400 to-purple-500', icon: Star };
    if (score >= 1600) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', icon: TrendingUp };
    if (score >= 1200) return { name: 'Platinum', color: 'from-green-400 to-teal-500', icon: TrendingUp };
    if (score >= 800) return { name: 'Gold', color: 'from-yellow-300 to-yellow-500', icon: TrendingUp };
    if (score >= 400) return { name: 'Silver', color: 'from-gray-300 to-gray-500', icon: TrendingUp };
    return { name: 'Bronze', color: 'from-orange-300 to-orange-500', icon: TrendingUp };
  };

  const rankData = getRankData(auraScore || 0);
  const Icon = rankData.icon;

  return (
    <motion.div
      initial={showAnimation ? { scale: 0, rotate: -180 } : {}}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="flex flex-col items-center"
    >
      <div className={`w-24 h-24 bg-gradient-to-br ${rankData.color} rounded-full flex items-center justify-center shadow-xl mb-4`}>
        <Icon className="w-12 h-12 text-white" />
      </div>
      
      <motion.div
        initial={showAnimation ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
          {rankData.name}
        </h3>
        
        {division && (
          <Badge className={`bg-gradient-to-r ${rankData.color} text-white border-0 mb-2`}>
            Division {division}
          </Badge>
        )}
        
        <p className="text-[var(--muted)] text-lg">
          {Math.round(auraScore || 0)} Aura
        </p>
      </motion.div>
    </motion.div>
  );
}