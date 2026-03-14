import React, { useState, useEffect } from 'react';
import { Swords, Award, TrendingUp, Zap, Users } from 'lucide-react';

const ICONS = {
  vote: Swords,
  endorsement: Award,
  rank_up: TrendingUp,
  spotlight: Zap,
  default: Users
};

const generateFakeActivity = () => {
  const types = ['vote', 'endorsement', 'rank_up', 'spotlight'];
  const competitors = ['Aria', 'Jaxon', 'Luna', 'Kael', 'Seraphina', 'Orion', 'Zane', 'Lyra'];
  const type = types[Math.floor(Math.random() * types.length)];
  const competitor1 = competitors[Math.floor(Math.random() * competitors.length)];
  let message = '';
  switch (type) {
    case 'vote':
      const competitor2 = competitors.filter(c => c !== competitor1)[Math.floor(Math.random() * (competitors.length - 1))];
      message = `${competitor1} won a match vs ${competitor2}.`;
      break;
    case 'endorsement':
      message = `${competitor1} received an endorsement!`;
      break;
    case 'rank_up':
      const newRank = Math.floor(Math.random() * 50) + 1;
      message = `${competitor1} surged to Rank #${newRank}!`;
      break;
    case 'spotlight':
      message = `${competitor1} is now in the Spotlight!`;
      break;
    default:
      message = `${competitor1} did something interesting.`;
  }

  return {
    id: Date.now() + Math.random(),
    type,
    message,
  };
};

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState(() => Array.from({ length: 2 }, generateFakeActivity));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => [generateFakeActivity(), ...prev.slice(0, 1)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--text)]">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        Live Feed
      </h2>
      <div className="space-y-2 overflow-hidden">
        {activities.map((activity) => {
          const Icon = ICONS[activity.type] || ICONS.default;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-1.5 rounded-lg"
            >
              <div className="w-8 h-8 flex-shrink-0 bg-black/10 rounded-lg flex items-center justify-center border border-white/5">
                <Icon className="w-4 h-4 text-[var(--accent-2)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--text)] leading-tight">{activity.message}</p>
                <p className="text-xs text-[var(--muted)]">Just now</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}