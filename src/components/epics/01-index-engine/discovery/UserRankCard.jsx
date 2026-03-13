import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Sparkles, Shield, Star } from 'lucide-react';
import { RankDisplay } from '@/components/epics/06-nomination-engine/voting';

export default function UserRankCard({ user, showAnimation = true }) {
  if (!user) return null;

  const auraScore = user.aura_score || 0;
  const stardustPoints = user.stardust_points || 0;
  const cloutScore = user.clout || 0;
  const starPower = user.star_power || 0;

  // Calculate progress to next rank
  const getNextRankThreshold = (current) => {
    const thresholds = [400, 800, 1200, 1600, 2000, 2400, 2800];
    return thresholds.find(t => t > current) || 3000;
  };

  const nextThreshold = getNextRankThreshold(auraScore);
  const currentThreshold = auraScore >= 400 ? 
    [400, 800, 1200, 1600, 2000, 2400, 2800].filter(t => t <= auraScore).pop() || 0 : 0;
  
  const progress = ((auraScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 30 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-[var(--border)] shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <RankDisplay 
              auraScore={auraScore} 
              division={user.stardust_division_name}
              showAnimation={showAnimation}
            />
          </div>

          <div className="space-y-6">
            {/* Aura Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Progress to Next Rank</span>
                <span className="font-medium text-[var(--text)]">
                  {Math.round(auraScore)} / {nextThreshold}
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3" />
              <p className="text-xs text-[var(--muted)] text-center">
                {Math.max(0, nextThreshold - auraScore)} Aura needed to rank up
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-400 mr-1" />
                </div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {Math.round(stardustPoints)}
                </div>
                <div className="text-xs text-[var(--muted)]">Stardust</div>
              </motion.div>

              <motion.div
                initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-purple-400 mr-1" />
                </div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {Math.round(cloutScore)}
                </div>
                <div className="text-xs text-[var(--muted)]">Clout</div>
              </motion.div>

              <motion.div
                initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-blue-400 mr-1" />
                </div>
                <div className="text-xl font-bold text-[var(--text)]">
                  {Math.round(starPower)}
                </div>
                <div className="text-xs text-[var(--muted)]">Star Power</div>
              </motion.div>
            </div>

            {/* Rank Badge */}
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white px-6 py-2 text-lg font-semibold">
                {user.stardust_rank_name || 'Bronze'} 
                {user.stardust_division_name && ` • ${user.stardust_division_name}`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}