import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from '@/components/games/GameContext';
import MissionBriefing from '@/components/games/recruitment/MissionBriefing';
import PuzzleEngine from '@/components/games/recruitment/PuzzleEngine';
import { GameMission } from '@/entities/GameMission';
import { Nominee } from '@/entities/Nominee';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Trophy, Star, Target, ChevronRight, 
  Lock, CheckCircle, Loader2 
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

function RecruitmentGame() {
  const { player, awardInsightPoints, addBadge, refreshData } = useGame();
  const [missions, setMissions] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [gameState, setGameState] = useState('hub'); // 'hub' | 'briefing' | 'playing' | 'complete'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const [missionData, nomineeData] = await Promise.all([
        GameMission.filter({ is_active: true }, 'order'),
        Nominee.filter({ status: 'active' }, '-elo_rating', 20)
      ]);
      
      // If no missions exist, create sample missions
      if (missionData.length === 0) {
        const sampleMissions = await createSampleMissions();
        setMissions(sampleMissions);
      } else {
        setMissions(missionData);
      }
      
      setNominees(nomineeData);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleMissions = async () => {
    const samples = [
      {
        mission_id: 'mission_001',
        title: 'The Propulsion Pioneer',
        briefing: 'Intelligence suggests a breakthrough in ion propulsion technology. The architect behind this innovation has been spotted at a major aerospace conference. Decode the clues to identify this pioneer.',
        difficulty: 'tutorial',
        puzzle_type: 'pattern_match',
        target_role: 'Propulsion Engineer',
        target_location: 'North America',
        insight_reward: 100,
        order: 1,
        clues: [
          { clue_text: 'Specializes in electric propulsion systems', is_encrypted: false },
          { clue_text: 'Published research on Hall-effect thrusters', is_encrypted: false, hint: 'Look for aerospace research credentials' },
          { clue_text: 'Recently spoke at the AIAA conference', is_encrypted: true }
        ],
        is_active: true
      },
      {
        mission_id: 'mission_002',
        title: 'Wings of Innovation',
        briefing: 'A revolutionary drone design has captured the industry\'s attention. The Council needs you to identify the visionary behind this technology before competitors do.',
        difficulty: 'easy',
        puzzle_type: 'data_decode',
        target_role: 'Drone Architect',
        target_location: 'Europe',
        insight_reward: 150,
        order: 2,
        clues: [
          { clue_text: 'UAV-PIONEER-2024', is_encrypted: false },
          { clue_text: 'Known for autonomous flight systems', is_encrypted: true }
        ],
        is_active: true
      },
      {
        mission_id: 'mission_003',
        title: 'The Orbital Strategist',
        briefing: 'Satellite constellation optimization is the next frontier. We\'ve intercepted communications about a key strategist reshaping space operations. Find them.',
        difficulty: 'medium',
        puzzle_type: 'pattern_match',
        target_role: 'Space Operations Lead',
        target_location: 'Global',
        insight_reward: 250,
        order: 3,
        clues: [
          { clue_text: 'Manages multi-orbit satellite networks', is_encrypted: true },
          { clue_text: 'Background in orbital mechanics and AI', is_encrypted: true },
          { clue_text: 'Advised on recent mega-constellation deployment', is_encrypted: true }
        ],
        is_active: true
      }
    ];

    const created = [];
    for (const sample of samples) {
      try {
        const mission = await GameMission.create(sample);
        created.push(mission);
      } catch (e) {
        console.error('Error creating sample mission:', e);
      }
    }
    return created;
  };

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setGameState('briefing');
  };

  const handleMissionStart = () => {
    setGameState('playing');
  };

  const handleMissionComplete = async (points) => {
    await awardInsightPoints(points);
    
    // Check for first mission badge
    if (player?.rr_missions_completed?.length === 0) {
      await addBadge({
        badge_id: 'first_mission',
        name: 'First Contact',
        description: 'Completed your first recruitment mission',
        category: 'curator',
        tier: 'bronze',
        icon: 'Target'
      });
    }
    
    await refreshData();
    setGameState('complete');
  };

  const handleMissionFail = () => {
    setGameState('briefing');
  };

  const handleReturnToHub = () => {
    setSelectedMission(null);
    setGameState('hub');
    loadGameData();
  };

  const isMissionCompleted = (missionId) => {
    return player?.rr_missions_completed?.includes(missionId);
  };

  const isMissionLocked = (mission, index) => {
    if (index === 0) return false;
    const previousMission = missions[index - 1];
    return previousMission && !isMissionCompleted(previousMission.mission_id);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandColors.cream }}
      >
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ background: brandColors.cream }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-40 backdrop-blur-sm border-b"
        style={{ background: 'rgba(255,255,255,0.9)', borderColor: '#e2e8f0' }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {gameState !== 'hub' ? (
              <Button
                variant="ghost"
                onClick={handleReturnToHub}
                style={{ color: brandColors.navyDeep }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Mission Hub
              </Button>
            ) : (
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" style={{ color: brandColors.navyDeep }}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Exit
                </Button>
              </Link>
            )}
            <div>
              <h1 
                className="text-xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
              >
                The Recruitment Run
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: `${brandColors.goldPrestige}15` }}
            >
              <Star className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span 
                className="font-bold"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                {player?.insight_points || 0} IP
              </span>
            </div>
            <div 
              className="px-4 py-2 rounded-full text-white font-medium"
              style={{ background: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
            >
              {player?.prestige_rank || 'Bronze'}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {gameState === 'hub' && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Mission Hub Header */}
              <div className="text-center mb-12">
                <h2 
                  className="text-3xl mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
                >
                  Council of Flight - Mission Dossier
                </h2>
                <p 
                  className="text-lg max-w-2xl mx-auto"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: '#64748b' }}
                >
                  As a Curator-in-Training, your mission is to identify the world's top aerospace innovators. 
                  Each successful recruitment strengthens your insight and brings you closer to Platinum status.
                </p>
              </div>

              {/* Mission List */}
              <div className="space-y-4">
                {missions.map((mission, index) => {
                  const completed = isMissionCompleted(mission.mission_id);
                  const locked = isMissionLocked(mission, index);
                  
                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => !locked && handleMissionSelect(mission)}
                        disabled={locked}
                        className={`w-full p-6 rounded-2xl text-left transition-all ${
                          locked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
                        }`}
                        style={{ 
                          background: completed ? `${brandColors.goldPrestige}10` : 'white',
                          border: `1px solid ${completed ? brandColors.goldPrestige : '#e2e8f0'}`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ 
                                background: completed ? brandColors.goldPrestige : locked ? '#9ca3af' : brandColors.navyDeep 
                              }}
                            >
                              {completed ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : locked ? (
                                <Lock className="w-6 h-6 text-white" />
                              ) : (
                                <Target className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 
                                className="text-lg font-semibold"
                                style={{ fontFamily: "'Playfair Display', serif", color: brandColors.navyDeep }}
                              >
                                {mission.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span 
                                  className="text-xs px-2 py-1 rounded"
                                  style={{ 
                                    background: `${brandColors.skyBlue}20`, 
                                    color: brandColors.skyBlue 
                                  }}
                                >
                                  {mission.difficulty}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {mission.target_role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div 
                                className="font-bold"
                                style={{ color: brandColors.goldPrestige }}
                              >
                                +{mission.insight_reward} IP
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'briefing' && selectedMission && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <MissionBriefing
                mission={selectedMission}
                onStart={handleMissionStart}
                isLocked={false}
              />
            </motion.div>
          )}

          {gameState === 'playing' && selectedMission && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PuzzleEngine
                mission={selectedMission}
                nominees={nominees}
                onComplete={handleMissionComplete}
                onFail={handleMissionFail}
              />
            </motion.div>
          )}

          {gameState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <Trophy className="w-24 h-24 mx-auto mb-6" style={{ color: brandColors.goldPrestige }} />
              <h2 
                className="text-3xl mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
              >
                Mission Accomplished
              </h2>
              <p 
                className="text-lg mb-8"
                style={{ fontFamily: "'Montserrat', sans-serif", color: '#64748b' }}
              >
                The Council of Flight commends your exceptional work.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleReturnToHub}
                  className="px-8 py-6 text-lg text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  Continue to Next Mission
                </Button>
                <Link to={createPageUrl('TheHangar')}>
                  <Button
                    variant="outline"
                    className="px-8 py-6 text-lg"
                    style={{ 
                      borderColor: brandColors.navyDeep,
                      color: brandColors.navyDeep,
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  >
                    Return to Hangar
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function RecruitmentRun() {
  return (
    <GameProvider>
      <RecruitmentGame />
    </GameProvider>
  );
}