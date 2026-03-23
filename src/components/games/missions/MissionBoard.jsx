import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';
import { GameMission } from '@/entities/GameMission';
import { Button } from '@/components/ui/button';
import { X, Star, Clock, Zap, Trophy, Calendar } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const missionTypes = {
  daily: { icon: Clock, color: '#4a90b8', label: 'Daily' },
  weekly: { icon: Calendar, color: '#c9a87c', label: 'Weekly' },
  research: { icon: Star, color: '#9b59b6', label: 'Research' },
  special: { icon: Zap, color: '#f39c12', label: 'Special Event' },
};

export default function MissionBoard({ isOpen, onClose }) {
  const { player } = useGame();
  const [missions, setMissions] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && player) {
      loadMissions();
    }
  }, [isOpen, player]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const allMissions = await GameMission.filter({});
      
      // Filter by player's active/completed missions
      const playerActiveMissions = player?.active_mission_ids || [];
      const playerCompletedMissions = player?.completed_mission_ids || [];
      
      const active = allMissions.filter(m => playerActiveMissions.includes(m.id));
      const completed = allMissions.filter(m => playerCompletedMissions.includes(m.id));
      const available = allMissions.filter(m => 
        !playerActiveMissions.includes(m.id) && 
        !playerCompletedMissions.includes(m.id) &&
        m.status === 'active'
      );
      
      setActiveMissions(active);
      setCompletedMissions(completed);
      setMissions(available);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMissionTypeInfo = (type) => missionTypes[type] || missionTypes.research;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${brandColors.navyDeep}, #0a1525)`,
            border: `2px solid ${brandColors.goldPrestige}40`,
          }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: `${brandColors.goldPrestige}30` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: `${brandColors.goldPrestige}20` }}>
                  <Trophy className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Mission Control</h2>
                  <p className="text-sm opacity-60 text-white">Space Center Operations</p>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/60">Loading missions...</div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Active Missions */}
                {activeMissions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                      Active Missions ({activeMissions.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {activeMissions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} status="active" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Missions */}
                {missions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                      Available Missions ({missions.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {missions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} status="available" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Missions */}
                {completedMissions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" style={{ color: '#2ecc71' }} />
                      Completed ({completedMissions.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {completedMissions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} status="completed" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MissionCard({ mission, status }) {
  const typeInfo = missionTypes[mission.mission_type] || missionTypes.research;
  const Icon = typeInfo.icon;
  
  const progress = mission.objectives 
    ? (mission.objectives.filter(o => o.completed).length / mission.objectives.length) * 100 
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl border"
      style={{
        background: status === 'completed' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)',
        borderColor: status === 'completed' ? '#2ecc71' : brandColors.goldPrestige + '40',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: typeInfo.color }} />
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ 
            background: typeInfo.color + '20', 
            color: typeInfo.color 
          }}>
            {typeInfo.label}
          </span>
        </div>
        {mission.rewards?.insight_points && (
          <div className="flex items-center gap-1 text-xs" style={{ color: brandColors.goldPrestige }}>
            <Star className="w-3 h-3" />
            {mission.rewards.insight_points} IP
          </div>
        )}
      </div>

      <h4 className="text-white font-semibold mb-2">{mission.name}</h4>
      <p className="text-white/60 text-sm mb-3">{mission.description}</p>

      {/* Progress Bar */}
      {status === 'active' && mission.objectives && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{ background: brandColors.skyBlue }}
            />
          </div>
        </div>
      )}

      {/* Objectives */}
      {mission.objectives && (
        <div className="space-y-1">
          {mission.objectives.slice(0, 3).map((obj, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/60">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                obj.completed ? 'bg-green-500 border-green-500' : 'border-white/30'
              }`}>
                {obj.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <span>{obj.description}</span>
            </div>
          ))}
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-white/10 text-center text-green-400 text-sm font-semibold">
          ✓ Mission Complete
        </div>
      )}
    </motion.div>
  );
}