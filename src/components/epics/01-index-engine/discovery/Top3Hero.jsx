
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RankGlow = ({ rank }) => {
  const glows = {
    1: 'shadow-[0_0_20px_theme(colors.yellow.400)]',
    2: 'shadow-[0_0_20px_theme(colors.slate.400)]',
    3: 'shadow-[0_0_20px_#CD7F32]', // Bronze color
  };
  return <div className={`absolute inset-0 rounded-full ${glows[rank]} opacity-50 animate-pulse`} />;
};

const DeltaArrow = ({ delta }) => {
  if (delta === null || delta === undefined || delta === 0) {
    return <Minus className="w-3 h-3 text-[var(--muted)]" />;
  }
  if (delta > 0) {
    return <ArrowUp className="w-3 h-3 text-green-400" />;
  }
  return <ArrowDown className="w-3 h-3 text-red-400" />;
};

const NomineeCard = ({ nominee, rank, onNomineeClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: rank * 0.1 }}
    className="bg-[var(--glass)] border border-white/10 rounded-3xl p-6 text-center w-full min-w-[280px] snap-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    onClick={() => onNomineeClick?.(nominee)}
  >
    <div className="relative w-24 h-24 mx-auto mb-4">
      <RankGlow rank={rank} />
      <img
        src={nominee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${nominee.nomineeName}`}
        alt={nominee.nomineeName}
        className="w-full h-full rounded-full object-cover border-4 border-white/20"
      />
      <div className="absolute -bottom-2 -right-1 w-10 h-10 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {nominee.rank}
      </div>
    </div>
    <h3 className="text-xl font-bold truncate">{nominee.nomineeName}</h3>
    <div className="flex items-center justify-center gap-4 mt-2">
      <div className="text-center">
        <div className="text-2xl font-bold text-[var(--accent-2)]">{Math.round(nominee.aura)}</div>
        <div className="text-xs text-[var(--muted)]">AURA</div>
      </div>
      <div className="h-8 border-l border-[var(--border)]"></div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-2xl font-bold">
          <DeltaArrow delta={nominee.delta24h} />
          <span>{nominee.delta24h !== null ? Math.abs(nominee.delta24h) : '-'}</span>
        </div>
        <div className="text-xs text-[var(--muted)]">Δ24H</div>
      </div>
    </div>
  </motion.div>
);

export default function Top3Hero({ top3, isLoading, onNomineeClick }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1,2,3].map(i => (
            <div key={i} className="bg-[var(--glass)] border border-white/10 rounded-3xl p-6 text-center w-full">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
            </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide md:grid md:grid-cols-3">
        {top3.map((nominee) => (
          <NomineeCard key={nominee.nomineeId} nominee={nominee} rank={nominee.rank} onNomineeClick={onNomineeClick} />
        ))}
      </div>
    </div>
  );
}
