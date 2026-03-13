import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MissionCard from './MissionCard';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

export default function MissionsPanel({ isOpen, onClose }) {
  const [playerMissions, setPlayerMissions] = useState([]);
  const [gameMissions, setGameMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMissions();
    }
  }, [isOpen]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load all active game missions
      const missions = await base44.entities.GameMission.filter({ is_active: true });
      setGameMissions(missions);

      // Load player's mission progress
      const playerProgress = await base44.entities.PlayerMission.filter({ 
        user_email: currentUser.email 
      });
      setPlayerMissions(playerProgress);

      // Auto-create PlayerMission for any GameMission user hasn't started
      const startedMissionIds = playerProgress.map(pm => pm.mission_id);
      const unstarted = missions.filter(gm => !startedMissionIds.includes(gm.mission_id));
      
      for (const mission of unstarted) {
        const newPlayerMission = await base44.entities.PlayerMission.create({
          user_email: currentUser.email,
          mission_id: mission.mission_id,
          status: 'active',
          objectives_progress: generateObjectives(mission),
          started_date: new Date().toISOString(),
          rewards_claimed: false
        });
        setPlayerMissions(prev => [...prev, newPlayerMission]);
      }
    } catch (error) {
      console.error('Failed to load missions:', error);
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const generateObjectives = (gameMission) => {
    // Generate objectives based on mission type
    switch (gameMission.puzzle_type) {
      case 'pattern_match':
        return [
          { description: 'Collect 3 clues', current: 0, target: 3, completed: false },
          { description: 'Identify the target nominee', current: 0, target: 1, completed: false }
        ];
      case 'data_decode':
        return [
          { description: 'Decode encrypted data', current: 0, target: 1, completed: false },
          { description: 'Verify nominee profile', current: 0, target: 1, completed: false }
        ];
      default:
        return [
          { description: 'Complete mission objectives', current: 0, target: 1, completed: false }
        ];
    }
  };

  const handleClaimRewards = async (playerMission) => {
    try {
      // Award insight points
      const gameMission = gameMissions.find(gm => gm.mission_id === playerMission.mission_id);
      if (gameMission?.insight_reward) {
        await base44.entities.GamePlayer.updateWhere(
          { user_email: user.email },
          { 
            $inc: { insight_points: gameMission.insight_reward } 
          }
        );
      }

      // Update mission status
      await base44.entities.PlayerMission.update(playerMission.id, {
        rewards_claimed: true
      });

      // Refresh missions
      await loadMissions();
      
      toast.success(`Claimed ${gameMission?.insight_reward || 0} Insight Points!`);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div 
          className="p-6 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` }}
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Space Missions</h2>
            <p className="text-white/80 text-sm mt-1">Complete objectives to earn rewards</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.skyBlue }} />
            </div>
          ) : (
            <>
              {playerMissions.map((playerMission) => {
                const gameMission = gameMissions.find(gm => gm.mission_id === playerMission.mission_id);
                if (!gameMission) return null;
                
                return (
                  <MissionCard
                    key={playerMission.id}
                    playerMission={playerMission}
                    gameMission={gameMission}
                    onClaim={handleClaimRewards}
                  />
                );
              })}

              {playerMissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active missions</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}