import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const retroColors = {
  cyan: '#00ffff',
  purple: '#4a148c',
  yellow: '#ffeb3b',
};

export default function MissionDebrief({ nominee, onComplete, onClose }) {
  const [scores, setScores] = useState({
    technical_excellence: 4,
    innovation_impact: 4,
    leadership_influence: 4,
    community_contribution: 4,
    future_potential: 4,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.functions.invoke('saveNomineeEvaluation', {
        nominee_id: nominee.id,
        mini_game_type: 'mission_debrief',
        ...scores
      });
      onComplete?.(25);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
    setSubmitting(false);
  };

  const categories = [
    { key: 'technical_excellence', label: 'MISSION READINESS', icon: '🔧' },
    { key: 'innovation_impact', label: 'BREAKTHROUGH PROBABILITY', icon: '💡' },
    { key: 'leadership_influence', label: 'CREW COHESION', icon: '👥' },
    { key: 'community_contribution', label: 'CULTURAL IMPACT', icon: '🌍' },
    { key: 'future_potential', label: 'TRAJECTORY SCORE', icon: '📈' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 0, 51, 0.95)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl border-4 p-6"
        style={{
          background: retroColors.purple,
          borderColor: retroColors.cyan,
          boxShadow: `0 0 40px ${retroColors.cyan}`,
        }}
      >
        <div className="text-center mb-6">
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: retroColors.cyan,
              fontSize: '20px',
            }}
          >
            MISSION DEBRIEF
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: retroColors.yellow,
              fontSize: '10px',
            }}
          >
            ASSESS INNOVATOR: {nominee.name}
          </p>
        </div>

        <div className="space-y-6 mb-6">
          {categories.map((cat) => (
            <div key={cat.key}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <span
                  className="text-xs flex-1"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    color: 'white',
                  }}
                >
                  {cat.label}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: retroColors.yellow }}
                >
                  {scores[cat.key]}
                </span>
              </div>
              <Slider
                value={[scores[cat.key]]}
                onValueChange={(val) =>
                  setScores({ ...scores, [cat.key]: val[0] })
                }
                min={1}
                max={7}
                step={1}
                className="w-full"
              />
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
            disabled={submitting}
            className="flex-1 border-4"
            style={{
              background: retroColors.cyan,
              borderColor: retroColors.yellow,
              color: retroColors.purple,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '12px',
            }}
          >
            {submitting ? 'PROCESSING...' : '✓ SUBMIT'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}