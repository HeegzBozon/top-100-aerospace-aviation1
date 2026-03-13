import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const retroColors = {
  cyan: '#00ffff',
  purple: '#4a148c',
  yellow: '#ffeb3b',
};

const missions = [
  { id: 'rapid_response', label: 'RAPID RESPONSE OPS', icon: '⚡', maps_to: 'technical_excellence', description: 'High-speed technical execution' },
  { id: 'deep_research', label: 'DEEP RESEARCH', icon: '🔬', maps_to: 'innovation_impact', description: 'Breakthrough discoveries' },
  { id: 'crew_challenge', label: 'CREW LEADERSHIP', icon: '👥', maps_to: 'leadership_influence', description: 'Team coordination under pressure' },
  { id: 'outreach', label: 'COMMUNITY OUTREACH', icon: '🌍', maps_to: 'community_contribution', description: 'Industry impact and mentorship' },
  { id: 'frontier', label: 'FRONTIER MISSION', icon: '🚀', maps_to: 'future_potential', description: 'Next-gen capabilities' },
];

export default function MatchMissions({ nominee, onComplete, onClose }) {
  const [matches, setMatches] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleMatch = (missionId, rating) => {
    setMatches({ ...matches, [missionId]: rating });
  };

  const isComplete = Object.keys(matches).length === missions.length;

  const handleSubmit = async () => {
    if (!isComplete) return;
    setSubmitting(true);

    const scores = {};
    missions.forEach(mission => {
      scores[mission.maps_to] = matches[mission.id];
    });

    try {
      await base44.functions.invoke('saveNomineeEvaluation', {
        nominee_id: nominee.id,
        mini_game_type: 'match_missions',
        ...scores
      });
      onComplete?.(25);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 0, 51, 0.95)' }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-4xl border-4 p-6 overflow-y-auto max-h-[90vh]"
        style={{
          background: retroColors.purple,
          borderColor: retroColors.cyan,
          boxShadow: `0 0 40px ${retroColors.cyan}`,
        }}
      >
        <h2
          className="text-center text-2xl font-bold mb-4"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.cyan,
            fontSize: '18px',
          }}
        >
          MATCH MISSIONS
        </h2>
        <p
          className="text-center text-xs mb-8"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.yellow,
            fontSize: '10px',
          }}
        >
          ASSESS FIT: {nominee.name}
        </p>

        <div className="space-y-6 mb-6">
          {missions.map((mission) => (
            <div key={mission.id} className="border-2 p-4" style={{ borderColor: retroColors.cyan }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{mission.icon}</span>
                <div className="flex-1">
                  <div
                    className="text-sm font-bold mb-1"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      color: 'white',
                      fontSize: '10px',
                    }}
                  >
                    {mission.label}
                  </div>
                  <p className="text-white/60 text-xs">{mission.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                  <motion.button
                    key={rating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMatch(mission.id, rating)}
                    className="flex-1 aspect-square border-2 flex items-center justify-center font-bold"
                    style={{
                      background: matches[mission.id] === rating ? retroColors.cyan : 'transparent',
                      borderColor: retroColors.cyan,
                      color: matches[mission.id] === rating ? retroColors.purple : retroColors.cyan,
                    }}
                  >
                    {rating}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            style={{ borderColor: retroColors.cyan }}
          >
            ABORT
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
            className="flex-1 border-4"
            style={{
              background: isComplete ? retroColors.cyan : 'gray',
              borderColor: retroColors.yellow,
              color: retroColors.purple,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
            }}
          >
            {submitting ? 'PROCESSING...' : isComplete ? '✓ SUBMIT' : 'INCOMPLETE'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}