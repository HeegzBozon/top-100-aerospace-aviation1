import { motion, AnimatePresence } from 'framer-motion';
import { brand } from './NominateConfig';
import { Rocket, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NominateShell({ children, stageKey, progress, onExit }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col sf-pro" style={{ background: `linear-gradient(180deg, ${brand.cream}, #f0ebe4)` }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white/40 backdrop-blur-sm border-b z-20" style={{ borderColor: `${brand.navy}10` }}>
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4" style={{ color: brand.gold }} />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: `${brand.navy}60` }}>
            TOP 100 · Nominations
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-top100')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer transition-all hover:scale-105"
            style={{ background: brand.navy, color: '#fff' }}
          >
            <ListChecks className="w-3.5 h-3.5" style={{ color: brand.gold }} />
            Build Your Top 100
          </button>
          {onExit && (
            <button onClick={onExit} className="text-[11px] font-medium cursor-pointer" style={{ color: `${brand.navy}50` }}>
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 shrink-0" style={{ background: `${brand.navy}10` }}>
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={stageKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}