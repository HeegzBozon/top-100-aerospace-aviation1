import { motion } from 'framer-motion';
import { 
  Rocket, Users, Vote, Trophy, PartyPopper, Check
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// Season 4 phases with dates
const SEASON_PHASES = [
  { 
    id: 'nominations', 
    label: 'Nominations', 
    shortLabel: 'Nominate',
    icon: Users, 
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    description: 'Nominate aerospace leaders'
  },
  { 
    id: 'voting', 
    label: 'Community Voting', 
    shortLabel: 'Vote',
    icon: Vote, 
    startDate: '2026-03-16',
    endDate: '2026-05-15',
    description: 'Cast your votes'
  },
  { 
    id: 'review', 
    label: 'Expert Review', 
    shortLabel: 'Review',
    icon: Trophy, 
    startDate: '2026-05-16',
    endDate: '2026-06-30',
    description: 'Panel evaluation'
  },
  { 
    id: 'announcement', 
    label: 'Finalists Announced', 
    shortLabel: 'Finalists',
    icon: PartyPopper, 
    startDate: '2026-07-01',
    endDate: '2026-07-01',
    description: 'TOP 100 revealed'
  },
];

function getPhaseStatus(phase) {
  const now = new Date();
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
}

function getActivePhaseProgress(phase) {
  const now = new Date();
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export default function Season4Tracker() {
  const currentPhaseIndex = SEASON_PHASES.findIndex(p => getPhaseStatus(p) === 'active');
  const activePhase = currentPhaseIndex >= 0 ? SEASON_PHASES[currentPhaseIndex] : null;
  const progress = activePhase ? getActivePhaseProgress(activePhase) : 0;

  return (
    <div 
      className="rounded-2xl p-4 sm:p-5"
      style={{ 
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-white/80" />
          <span className="text-white font-semibold text-sm">Season 4 Progress</span>
        </div>
        {activePhase && (
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
          >
            {activePhase.label}
          </span>
        )}
      </div>

      {/* Tracker */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-1 rounded-full bg-white/10" />
        
        {/* Progress Line Fill */}
        <motion.div 
          className="absolute top-5 left-0 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentPhaseIndex + (progress / 100)) / SEASON_PHASES.length) * 100}%` 
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Phase Nodes */}
        <div className="relative flex justify-between">
          {SEASON_PHASES.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const Icon = phase.icon;
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            
            return (
              <div 
                key={phase.id} 
                className="flex flex-col items-center"
                style={{ width: `${100 / SEASON_PHASES.length}%` }}
              >
                {/* Node */}
                <motion.div
                  className="relative z-10 flex items-center justify-center rounded-full border-2 transition-all"
                  style={{
                    width: isActive ? 44 : 36,
                    height: isActive ? 44 : 36,
                    background: isCompleted 
                      ? brandColors.goldPrestige 
                      : isActive 
                        ? 'white' 
                        : 'rgba(255,255,255,0.1)',
                    borderColor: isCompleted || isActive 
                      ? brandColors.goldPrestige 
                      : 'rgba(255,255,255,0.2)',
                    boxShadow: isActive 
                      ? `0 0 20px ${brandColors.goldPrestige}60` 
                      : 'none',
                  }}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                  ) : (
                    <Icon 
                      className={isActive ? 'w-5 h-5' : 'w-4 h-4'}
                      style={{ 
                        color: isActive ? brandColors.navyDeep : 'rgba(255,255,255,0.5)' 
                      }} 
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span 
                  className="mt-3 text-xs font-medium text-center hidden sm:block"
                  style={{ 
                    color: isActive || isCompleted ? 'white' : 'rgba(255,255,255,0.5)' 
                  }}
                >
                  {phase.label}
                </span>
                <span 
                  className="mt-3 text-xs font-medium text-center sm:hidden"
                  style={{ 
                    color: isActive || isCompleted ? 'white' : 'rgba(255,255,255,0.5)' 
                  }}
                >
                  {phase.shortLabel}
                </span>

                {/* Active Phase Description */}
                {isActive && (
                  <motion.span 
                    className="mt-1 text-xs text-white/60 text-center hidden sm:block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {phase.description}
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar for active phase */}
      {activePhase && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>{activePhase.label} Progress</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{new Date(activePhase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>{new Date(activePhase.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}