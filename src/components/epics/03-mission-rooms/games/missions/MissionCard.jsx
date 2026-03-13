import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trophy, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const difficultyColors = {
  tutorial: '#4ade80',
  easy: '#60a5fa',
  medium: '#fbbf24',
  hard: '#f87171',
  expert: '#a855f7',
};

export default function MissionCard({ playerMission, gameMission, onClaim }) {
  const [expanded, setExpanded] = useState(false);
  
  const allCompleted = playerMission.objectives_progress?.every(obj => obj.completed);
  const canClaim = playerMission.status === 'completed' && !playerMission.rewards_claimed;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border-2"
      style={{ 
        borderColor: canClaim ? brandColors.goldPrestige : '#e5e7eb',
        background: canClaim ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'white'
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${difficultyColors[gameMission.difficulty]}20` }}
          >
            🚀
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg" style={{ color: brandColors.navyDeep }}>
              {gameMission.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{ 
                  background: difficultyColors[gameMission.difficulty],
                  color: 'white'
                }}
              >
                {gameMission.difficulty.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                {playerMission.objectives_progress?.filter(o => o.completed).length || 0}/{playerMission.objectives_progress?.length || 0} tasks
              </span>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-5 space-y-4">
              {/* Objectives */}
              {playerMission.objectives_progress?.map((objective, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                      {objective.description}
                    </span>
                    <div className="flex items-center gap-2">
                      {objective.completed ? (
                        <span className="text-green-500 text-xl">✓</span>
                      ) : (
                        <span className="text-yellow-500 text-2xl">?</span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((objective.current / objective.target) * 100, 100)}%` 
                      }}
                      className="h-full rounded-full"
                      style={{ 
                        background: objective.completed 
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{objective.current}/{objective.target}</span>
                    <span>{Math.round((objective.current / objective.target) * 100)}%</span>
                  </div>
                </div>
              ))}

              {/* Rewards Section */}
              {allCompleted && (
                <div className="mt-6 pt-4 border-t-2 border-dashed" style={{ borderColor: brandColors.goldPrestige }}>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="text-sm font-bold uppercase tracking-wider px-4 py-1 rounded"
                        style={{ 
                          background: brandColors.goldPrestige,
                          color: 'white'
                        }}
                      >
                        REWARDS
                      </div>
                    </div>
                    <div className="h-8" />
                  </div>
                  
                  <div 
                    className="mt-4 p-4 rounded-xl grid grid-cols-3 gap-4"
                    style={{ background: `${brandColors.skyBlue}10` }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2"
                        style={{ background: `${brandColors.goldPrestige}20` }}
                      >
                        ⭐
                      </div>
                      <div className="text-lg font-bold" style={{ color: brandColors.goldPrestige }}>
                        {gameMission.insight_reward}
                      </div>
                      <div className="text-xs text-gray-600">XP</div>
                    </div>
                    
                    {gameMission.artifact_reward_id && (
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2"
                          style={{ background: `${brandColors.skyBlue}20` }}
                        >
                          🎁
                        </div>
                        <div className="text-lg font-bold" style={{ color: brandColors.skyBlue }}>
                          x1
                        </div>
                        <div className="text-xs text-gray-600">Artifact</div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2"
                        style={{ background: `${brandColors.navyDeep}20` }}
                      >
                        🏆
                      </div>
                      <div className="text-lg font-bold" style={{ color: brandColors.navyDeep }}>
                        x1
                      </div>
                      <div className="text-xs text-gray-600">Badge</div>
                    </div>
                  </div>

                  {canClaim && (
                    <Button
                      onClick={() => onClaim(playerMission)}
                      className="w-full mt-4 py-6 text-lg font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
                        color: 'white'
                      }}
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      CLAIM REWARDS
                    </Button>
                  )}
                  
                  {playerMission.rewards_claimed && (
                    <div className="mt-4 text-center py-4 rounded-lg bg-green-50 text-green-700 font-semibold">
                      ✓ Rewards Claimed
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}