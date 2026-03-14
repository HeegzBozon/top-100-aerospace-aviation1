import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Zap,
  Heart,
  Users,
  TrendingUp
} from 'lucide-react';

const CAPABILITY_METRICS = [
  { 
    id: 'engagement', 
    label: 'Engagement', 
    icon: Heart, 
    value: 87, 
    color: 'from-pink-500 to-rose-400',
    bgColor: 'bg-pink-900/30'
  },
  { 
    id: 'activity', 
    label: 'Activity', 
    icon: Activity, 
    value: 92, 
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-900/30'
  },
  { 
    id: 'collaboration', 
    label: 'Collaboration', 
    icon: Users, 
    value: 78, 
    color: 'from-purple-500 to-indigo-400',
    bgColor: 'bg-purple-900/30'
  },
  { 
    id: 'momentum', 
    label: 'Momentum', 
    icon: TrendingUp, 
    value: 95, 
    color: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-900/30'
  },
  { 
    id: 'energy', 
    label: 'Energy', 
    icon: Zap, 
    value: 84, 
    color: 'from-yellow-500 to-orange-400',
    bgColor: 'bg-yellow-900/30'
  }
];

export default function VibePipelineBar() {
  const [animationValues, setAnimationValues] = useState(
    CAPABILITY_METRICS.map(metric => metric.value)
  );

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationValues(prev => 
        prev.map((value, index) => {
          const baseValue = CAPABILITY_METRICS[index].value;
          const variance = Math.random() * 8 - 4; // ±4% variance
          return Math.max(10, Math.min(100, baseValue + variance));
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const overallHealth = Math.round(
    animationValues.reduce((sum, value) => sum + value, 0) / animationValues.length
  );

  return (
    <div className="
      bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700
      shadow-lg p-3 space-y-2
    ">
      {CAPABILITY_METRICS.map((metric, index) => {
        const IconComponent = metric.icon;
        const currentValue = animationValues[index];
        
        return (
          <div key={metric.id} className="grid grid-cols-5 items-center gap-2 text-xs">
            {/* Icon & Label */}
            <div className="col-span-2 flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${metric.bgColor} flex items-center justify-center`}>
                <IconComponent className="w-3 h-3 text-white/80" />
              </div>
              <div className="text-slate-300 font-medium truncate">{metric.label}</div>
            </div>

            {/* Progress bar */}
            <div className="col-span-2">
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                  style={{
                    width: `${currentValue}%`,
                    transition: 'width 1.5s ease-out'
                  }}
                />
              </div>
            </div>

            {/* Value */}
            <div className="col-span-1 text-slate-400 font-mono text-right">
              {Math.round(currentValue)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}