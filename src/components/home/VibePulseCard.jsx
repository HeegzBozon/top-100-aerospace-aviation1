import React from 'react';
import { Heart, MessageSquare, Trophy } from 'lucide-react';

const pulseIcons = {
  endorsement: Heart,
  tip: MessageSquare,
  quest: Trophy,
};

const pulseColors = {
  endorsement: 'text-pink-400',
  tip: 'text-blue-400',
  quest: 'text-yellow-400',
};

export default function VibePulseCard({ actor, action, subject, time, type }) {
  const Icon = pulseIcons[type] || Heart;
  const colorClass = pulseColors[type] || 'text-gray-400';

  return (
    <div className="bg-[var(--glass)] border border-white/10 shadow-lg rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
      <div>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="flex-1 text-sm">
        <p>
          <span className="font-semibold">{actor}</span> {action} <span className="font-semibold">{subject}</span>
        </p>
      </div>
      <div className="text-xs text-[var(--muted)]">
        {time}
      </div>
    </div>
  );
}