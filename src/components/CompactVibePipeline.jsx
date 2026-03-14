import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CAPABILITY_METRICS = [
  { 
    id: 'engagement', 
    label: 'Engagement', 
    value: 87, 
    color: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-500/20'
  },
  { 
    id: 'activity', 
    label: 'Activity', 
    value: 92, 
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/20'
  },
  { 
    id: 'collaboration', 
    label: 'Collaboration', 
    value: 78, 
    color: 'from-purple-500 to-indigo-400',
    bgColor: 'bg-purple-500/20'
  },
  { 
    id: 'momentum', 
    label: 'Momentum', 
    value: 95, 
    color: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-500/20'
  },
  { 
    id: 'energy', 
    label: 'Energy', 
    value: 84, 
    color: 'from-yellow-500 to-orange-400',
    bgColor: 'bg-yellow-500/20'
  }
];

export function CompactVibePipeline() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationValues, setAnimationValues] = useState(
    CAPABILITY_METRICS.map(metric => metric.value)
  );

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationValues(prev => 
        prev.map((value, index) => {
          const baseValue = CAPABILITY_METRICS[index].value;
          const variance = Math.random() * 10 - 5; // ±5% variance
          return Math.max(0, Math.min(100, baseValue + variance));
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const overallHealth = Math.round(
    animationValues.reduce((sum, value) => sum + value, 0) / animationValues.length
  );

  const getHealthColor = (value) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 75) return 'bg-yellow-500';
    if (value >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHealthLabel = (value) => {
    if (value >= 90) return 'Excellent';
    if (value >= 75) return 'Good';
    if (value >= 50) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="relative">
      {/* Compact Status Bar */}
      <div 
        className="
          bg-gradient-to-r from-black/20 to-black/10 
          backdrop-blur-lg rounded-full border border-white/20
          shadow-lg overflow-hidden cursor-pointer
          hover:from-black/30 hover:to-black/20 transition-all duration-300
        "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`
              w-3 h-3 rounded-full animate-pulse
              ${getHealthColor(overallHealth)}
            `} />
            <span className="text-white text-sm font-medium">
              Pipeline: {getHealthLabel(overallHealth)} ({overallHealth}%)
            </span>
          </div>

          {/* Status Lights */}
          <div className="flex items-center gap-1">
            {CAPABILITY_METRICS.map((metric, index) => {
              const currentValue = animationValues[index];
              return (
                <div
                  key={metric.id}
                  className={`
                    w-2 h-2 rounded-full
                    ${getHealthColor(currentValue)}
                    opacity-75
                  `}
                  title={`${metric.label}: ${currentValue.toFixed(1)}%`}
                />
              );
            })}
            
            <div className="ml-2">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="
          absolute top-full left-0 right-0 mt-2 z-50
          bg-gradient-to-r from-black/30 to-black/20 
          backdrop-blur-xl rounded-2xl border border-white/20
          shadow-2xl overflow-hidden
        ">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Detailed Metrics</h3>
            <div className="
              px-2 py-1 rounded-full text-xs font-medium
              bg-white/20 text-white/90 border border-white/20
            ">
              Health: {overallHealth}%
            </div>
          </div>

          {/* Metrics */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {CAPABILITY_METRICS.map((metric, index) => {
              const currentValue = animationValues[index];
              
              return (
                <div key={metric.id} className="flex items-center gap-3">
                  {/* Status light */}
                  <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${getHealthColor(currentValue)}
                  `} />

                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <div className="text-white/90 text-sm font-medium">
                      {metric.label}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 max-w-20">
                    <div className="
                      h-2 bg-white/10 rounded-full overflow-hidden
                      border border-white/20
                    ">
                      <div
                        className={`
                          h-full bg-gradient-to-r ${metric.color} rounded-full
                          transition-all duration-1000 ease-out
                        `}
                        style={{ width: `${currentValue}%` }}
                      />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-white/70 text-xs font-mono min-w-8 text-right">
                    {Math.round(currentValue)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}