import React from 'react';
import { ArrowRight, Zap, Vote, Sparkles } from 'lucide-react';

const iconMap = {
  vote: Vote,
  quest: Sparkles,
  default: Zap,
};

export default function NextMoveCard({ type, title, reward }) {
  const Icon = iconMap[type] || iconMap.default;

  return (
    <div className="bg-[var(--glass)] border border-white/10 shadow-lg rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer">
      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--accent)]" />
      </div>
      <div className="flex-1">
        <div className="font-semibold leading-tight">{title}</div>
        <div className="text-sm text-[var(--accent-2)] font-medium">{reward}</div>
      </div>
      <ArrowRight className="w-5 h-5 text-[var(--muted)]" />
    </div>
  );
}