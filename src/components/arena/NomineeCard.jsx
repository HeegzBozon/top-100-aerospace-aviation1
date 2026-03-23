import HolisticScoreDisplay from './HolisticScoreDisplay';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const DeltaIndicator = ({ delta }) => {
  if (delta === null || delta === undefined || delta === 0) {
    return (
      <div className="flex items-center gap-0.5 text-xs text-[var(--muted)]">
        <Minus className="w-3 h-3" />
        <span>-</span>
      </div>
    );
  }
  const isPositive = delta > 0;
  return (
    <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      <span>{Math.abs(delta)}</span>
    </div>
  );
};

export default function NomineeCard({ nominee, onClick, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 } }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className="bg-[var(--card)]/80 backdrop-blur-xl rounded-2xl p-3 border border-[var(--border)] cursor-pointer hover:border-[var(--accent)]/50 transition-all duration-300 shadow-lg hover:shadow-[var(--accent)]/10 hover:-translate-y-1"
    >
      <div className="relative mb-2">
        <div className="relative w-full aspect-square">
          {/* Laurel wreath background */}
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/e15baa063_Gemini_Generated_Image_4pcatw4pcatw4pca.png"
            alt="Laurel wreath"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {/* Circular headshot in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={nominee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${nominee.nomineeName}`}
              alt={nominee.nomineeName}
              className="w-[60%] h-[60%] rounded-full object-cover border-2 border-white/20"
            />
          </div>
        </div>
        <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white font-bold px-2 py-0.5 rounded-full text-xs">
          #{nominee.rank}
        </div>
      </div>
      <h3 className="font-bold text-[var(--text)] truncate text-sm sm:text-base">{nominee.nomineeName}</h3>
      <p className="text-xs text-[var(--muted)] truncate">{nominee.title}</p>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--border)]">
        <span className="font-bold text-base sm:text-lg text-[var(--accent-2)]">{Math.round(nominee.aura)}</span>
        <DeltaIndicator delta={nominee.delta24h} />
      </div>
      
      {nominee.holistic_score > 0 && (
        <div className="mt-2">
          <HolisticScoreDisplay nominee={nominee} />
        </div>
      )}
    </motion.div>
  );
}