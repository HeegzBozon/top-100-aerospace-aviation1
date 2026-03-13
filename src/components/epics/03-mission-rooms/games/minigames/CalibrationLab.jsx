import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';

const retroColors = {
  cyan: '#00ffff',
  purple: '#4a148c',
  yellow: '#ffeb3b',
};

export default function CalibrationLab({ nominee, onComplete, onClose }) {
  const [calibrations, setCalibrations] = useState({
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
        mini_game_type: 'calibration_lab',
        ...calibrations
      });
      onComplete?.(25);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
    setSubmitting(false);
  };

  const dials = [
    { key: 'technical_excellence', label: 'STABILITY', icon: '📏', color: '#00ff88' },
    { key: 'innovation_impact', label: 'CREATIVITY', icon: '🎨', color: '#ff66ff' },
    { key: 'leadership_influence', label: 'RESONANCE', icon: '📡', color: '#ffeb3b' },
    { key: 'community_contribution', label: 'IMPACT', icon: '🌟', color: '#00d4ff' },
    { key: 'future_potential', label: 'TRAJECTORY', icon: '🚀', color: '#ff6b35' },
  ];

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
        className="w-full max-w-3xl border-4 p-6"
        style={{
          background: retroColors.purple,
          borderColor: retroColors.cyan,
          boxShadow: `0 0 40px ${retroColors.cyan}`,
        }}
      >
        <h2
          className="text-center text-2xl font-bold mb-6"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.cyan,
            fontSize: '18px',
          }}
        >
          CALIBRATION LAB
        </h2>
        <p
          className="text-center text-xs mb-8"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: retroColors.yellow,
            fontSize: '10px',
          }}
        >
          CALIBRATE PROFILE: {nominee.name}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {dials.map((dial) => (
            <div key={dial.key} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{dial.icon}</span>
                <div className="flex-1">
                  <div
                    className="text-xs mb-1"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      color: dial.color,
                    }}
                  >
                    {dial.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[calibrations[dial.key]]}
                      onValueChange={(val) =>
                        setCalibrations({ ...calibrations, [dial.key]: val[0] })
                      }
                      min={1}
                      max={7}
                      step={1}
                      className="flex-1"
                    />
                    <span
                      className="text-xl font-bold w-8 text-center"
                      style={{ color: dial.color }}
                    >
                      {calibrations[dial.key]}
                    </span>
                  </div>
                </div>
              </div>
              <motion.div
                className="h-1 rounded"
                style={{ background: dial.color, opacity: 0.3 }}
                animate={{ width: `${(calibrations[dial.key] / 7) * 100}%` }}
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
            {submitting ? 'CALIBRATING...' : '✓ LOCK IN'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}