import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MissionDebrief from './MissionDebrief';
import SystemsTest from './SystemsTest';
import CalibrationLab from './CalibrationLab';
import MatchMissions from './MatchMissions';

const retroColors = {
  cyan: '#00ffff',
  purple: '#4a148c',
  yellow: '#ffeb3b',
  magenta: '#e91e63',
};

const miniGames = [
  { id: 'mission_debrief', name: 'MISSION DEBRIEF', icon: '📋', component: MissionDebrief },
  { id: 'systems_test', name: 'SYSTEMS TEST', icon: '🔬', component: SystemsTest },
  { id: 'calibration_lab', name: 'CALIBRATION LAB', icon: '🎛️', component: CalibrationLab },
  { id: 'match_missions', name: 'MATCH MISSIONS', icon: '🎯', component: MatchMissions },
];

export default function MiniGameHub({ isOpen, onClose, onInsightAwarded }) {
  const [nominees, setNominees] = useState([]);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNominees();
    }
  }, [isOpen]);

  const loadNominees = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Nominee.filter({ status: 'active' });
      setNominees(data.slice(0, 10)); // Limit to 10 for now
    } catch (error) {
      console.error('Error loading nominees:', error);
    }
    setLoading(false);
  };

  const handleComplete = (insightPoints) => {
    onInsightAwarded?.(insightPoints);
    setSelectedGame(null);
    setSelectedNominee(null);
  };

  const GameComponent = selectedGame?.component;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(26, 0, 51, 0.95)' }}
        >
          {!selectedNominee && !selectedGame && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-5xl border-4 p-6"
              style={{
                background: retroColors.purple,
                borderColor: retroColors.cyan,
                boxShadow: `0 0 40px ${retroColors.cyan}`,
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: retroColors.cyan,
                    fontSize: '18px',
                  }}
                >
                  R&D EVALUATION SUITE
                </h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  style={{ color: retroColors.cyan }}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <p
                className="text-center text-xs mb-8"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: retroColors.yellow,
                  fontSize: '10px',
                }}
              >
                SELECT INNOVATOR TO EVALUATE
              </p>

              {loading ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="text-4xl mb-4"
                  >
                    🚀
                  </motion.div>
                  <p style={{ color: retroColors.cyan }}>LOADING...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  {nominees.map((nominee) => (
                    <motion.button
                      key={nominee.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedNominee(nominee)}
                      className="border-2 p-4 text-center"
                      style={{
                        borderColor: retroColors.cyan,
                        background: 'rgba(0, 255, 255, 0.1)',
                      }}
                    >
                      <div className="text-3xl mb-2">👤</div>
                      <div
                        className="text-xs"
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          color: 'white',
                          fontSize: '8px',
                        }}
                      >
                        {nominee.name.split(' ')[0]}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {selectedNominee && !selectedGame && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full max-w-3xl border-4 p-6"
              style={{
                background: retroColors.purple,
                borderColor: retroColors.magenta,
                boxShadow: `0 0 40px ${retroColors.magenta}`,
              }}
            >
              <Button
                onClick={() => setSelectedNominee(null)}
                variant="ghost"
                className="mb-4"
                style={{ color: retroColors.cyan }}
              >
                ← BACK
              </Button>

              <h3
                className="text-xl font-bold mb-6 text-center"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: retroColors.cyan,
                  fontSize: '14px',
                }}
              >
                {selectedNominee.name}
              </h3>

              <p
                className="text-center text-xs mb-8"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: retroColors.yellow,
                  fontSize: '10px',
                }}
              >
                SELECT EVALUATION MODE
              </p>

              <div className="grid grid-cols-2 gap-4">
                {miniGames.map((game) => (
                  <motion.button
                    key={game.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedGame(game)}
                    className="border-4 p-6 text-center"
                    style={{
                      borderColor: retroColors.cyan,
                      background: retroColors.purple,
                    }}
                  >
                    <div className="text-5xl mb-3">{game.icon}</div>
                    <div
                      className="text-xs"
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        color: retroColors.cyan,
                        fontSize: '10px',
                      }}
                    >
                      {game.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedGame && GameComponent && (
            <GameComponent
              nominee={selectedNominee}
              onComplete={handleComplete}
              onClose={() => setSelectedGame(null)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}