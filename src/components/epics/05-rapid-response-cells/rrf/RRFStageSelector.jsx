import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';

const STAGES = [
  { key: 'FORM', label: 'FORM', color: '#C8A97E', description: 'Plant Presence' },
  { key: 'STORM', label: 'STORM', color: '#E07B5A', description: 'Probe & Reopen' },
  { key: 'NORM', label: 'NORM', color: '#7BA7C8', description: 'Propose' },
  { key: 'PERFORM', label: 'PERFORM', color: '#5ABF8A', description: 'Execute & Close' },
];

const stageStyles = {
  FORM: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    dot: 'bg-amber-400',
    placeholder: 'No ask. Plant presence.'
  },
  STORM: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    dot: 'bg-orange-400',
    placeholder: 'Probe and navigate.'
  },
  NORM: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    dot: 'bg-blue-400',
    placeholder: 'Propose shared architecture.'
  },
  PERFORM: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    dot: 'bg-green-400',
    placeholder: 'Execute and close.'
  },
};

export default function RRFStageSelector({ currentStage = 'FORM', onStageChange, disabled = false, layout = 'horizontal' }) {
  const styles = stageStyles[currentStage];

  if (layout === 'tabs') {
    return (
      <div className="flex gap-3 px-6 py-3 border-t border-gray-800/50 bg-black/40 backdrop-blur">
        {STAGES.map((stage) => {
          const isActive = currentStage === stage.key;
          const stageStyle = stageStyles[stage.key];

          return (
            <button
              key={stage.key}
              onClick={() => !disabled && onStageChange?.(stage.key)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? `border border-amber-500/50 text-amber-300`
                  : 'border border-gray-700/50 text-gray-500 hover:text-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-pressed={isActive}
            >
              {stage.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-4 py-3 border-b border-gray-700/50 bg-black/20">
      {STAGES.map((stage) => {
        const isActive = currentStage === stage.key;
        const stageStyle = stageStyles[stage.key];

        return (
          <button
            key={stage.key}
            onClick={() => !disabled && onStageChange?.(stage.key)}
            disabled={disabled}
            className={`flex-1 px-3 py-2 rounded text-center transition-all min-h-[36px] flex flex-col items-center justify-center ${
              isActive
                ? `${stageStyle.bg} ${stageStyle.border} border-2 text-xs font-bold`
                : 'bg-gray-900/50 border border-gray-700 opacity-60 hover:opacity-80'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={isActive}
            aria-label={`${stage.label}: ${stage.description}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${stageStyle.dot}`} />
          </button>
        );
      })}
    </div>
  );
}