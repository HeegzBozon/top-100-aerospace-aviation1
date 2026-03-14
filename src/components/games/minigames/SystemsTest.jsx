import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const retroColors = {
  cyan: '#00ffff',
  purple: '#4a148c',
  yellow: '#ffeb3b',
  magenta: '#e91e63',
};

const scenarios = [
  { id: 'load', label: 'LOAD TEST', icon: '⚡', maps_to: 'technical_excellence' },
  { id: 'stress', label: 'STRESS TEST', icon: '🔥', maps_to: 'innovation_impact' },
  { id: 'recovery', label: 'FAILURE RECOVERY', icon: '🔄', maps_to: 'leadership_influence' },
  { id: 'adapt', label: 'ADAPTABILITY', icon: '🎯', maps_to: 'community_contribution' },
  { id: 'innovation', label: 'INNOVATION', icon: '💫', maps_to: 'future_potential' },
];

export default function SystemsTest({ nominee, onComplete, onClose }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [scores, setScores] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleScore = (score) => {
    const scenario = scenarios[currentScenario];
    const newScores = { ...scores, [scenario.maps_to]: score };
    setScores(newScores);

    if (currentScenario < scenarios.length - 1) {
      setTimeout(() => setCurrentScenario(currentScenario + 1), 500);
    } else {
      submitEvaluation(newScores);
    }
  };

  const submitEvaluation = async (finalScores) => {
    setSubmitting(true);
    try {
      await base44.functions.invoke('saveNomineeEvaluation', {
        nominee_id: nominee.id,
        mini_game_type: 'systems_test',
        technical_excellence: finalScores.technical_excellence,
        innovation_impact: finalScores.innovation_impact,
        leadership_influence: finalScores.leadership_influence,
        community_contribution: finalScores.community_contribution,
        future_potential: finalScores.future_potential,
      });
      onComplete?.(25);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
    setSubmitting(false);
  };

  const scenario = scenarios[currentScenario];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 0, 51, 0.95)' }}
    >
      <motion.div
        key={currentScenario}
        initial={{ scale: 0.9, rotateY: -90 }}
        animate={{ scale: 1, rotateY: 0 }}
        className="w-full max-w-2xl border-4 p-8 text-center"
        style={{
          background: retroColors.purple,
          borderColor: retroColors.magenta,
          boxShadow: `0 0 40px ${retroColors.magenta}`,
        }}
      >
        <div className="text-6xl mb-6">{scenario.icon}</div>
        <h2
          className="text-2xl font-bold mb-4"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.cyan,
            fontSize: '16px',
          }}
        >
          {scenario.label}
        </h2>
        <p
          className="text-sm mb-2"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.yellow,
            fontSize: '10px',
          }}
        >
          SYSTEM: {nominee.name}
        </p>
        <p className="text-white/70 text-xs mb-8">
          SCENARIO {currentScenario + 1} / {scenarios.length}
        </p>

        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((score) => (
            <motion.button
              key={score}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleScore(score)}
              className="aspect-square border-2 flex items-center justify-center text-xl font-bold"
              style={{
                background: retroColors.purple,
                borderColor: retroColors.cyan,
                color: retroColors.cyan,
              }}
            >
              {score}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}