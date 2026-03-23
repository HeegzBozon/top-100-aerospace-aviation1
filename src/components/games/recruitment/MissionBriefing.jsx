import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, User, ArrowRight, Lock } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

export default function MissionBriefing({ mission, onStart, isLocked }) {
  if (!mission) return null;

  const difficultyColors = {
    tutorial: '#22c55e',
    easy: '#4ade80',
    medium: '#fbbf24',
    hard: '#f97316',
    expert: '#ef4444'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full"
      style={{ border: `1px solid ${brandColors.navyDeep}20` }}
    >
      {/* Header */}
      <div 
        className="p-6"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, #0f1f33)` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ background: difficultyColors[mission.difficulty] }}
              >
                {mission.difficulty?.toUpperCase()}
              </span>
              <span className="text-white/60 text-sm">{mission.puzzle_type?.replace('_', ' ')}</span>
            </div>
            <h2 
              className="text-2xl text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              {mission.title}
            </h2>
          </div>
          <div 
            className="text-right"
            style={{ color: brandColors.goldPrestige }}
          >
            <div className="text-2xl font-bold">+{mission.insight_reward}</div>
            <div className="text-sm opacity-80">Insight Points</div>
          </div>
        </div>
      </div>

      {/* Briefing Content */}
      <div className="p-6 space-y-6">
        {/* Council Message */}
        <div 
          className="p-4 rounded-xl"
          style={{ background: `${brandColors.cream}`, border: `1px dashed ${brandColors.navyDeep}30` }}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 mt-1" style={{ color: brandColors.navyDeep }} />
            <div>
              <div 
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: brandColors.goldPrestige, fontFamily: "'Montserrat', sans-serif" }}
              >
                Council of Flight Transmission
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
              >
                {mission.briefing}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <User className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
            <div>
              <div className="text-xs text-slate-500">Target Role</div>
              <div 
                className="font-medium"
                style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
              >
                {mission.target_role}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <MapPin className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
            <div>
              <div className="text-xs text-slate-500">Location Hint</div>
              <div 
                className="font-medium"
                style={{ color: brandColors.navyDeep, fontFamily: "'Montserrat', sans-serif" }}
              >
                {mission.target_location || 'Classified'}
              </div>
            </div>
          </div>
        </div>

        {/* Clues Preview */}
        {mission.clues && mission.clues.length > 0 && (
          <div>
            <div 
              className="text-sm font-semibold mb-2"
              style={{ color: brandColors.navyDeep }}
            >
              Intel Available: {mission.clues.length} clue{mission.clues.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              {mission.clues.map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: brandColors.skyBlue }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artifact Reward */}
        {mission.artifact_reward_id && (
          <div 
            className="p-3 rounded-lg flex items-center gap-3"
            style={{ background: `${brandColors.goldPrestige}15`, border: `1px solid ${brandColors.goldPrestige}30` }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: brandColors.goldPrestige }}
            >
              🏆
            </div>
            <div>
              <div className="text-xs" style={{ color: brandColors.goldPrestige }}>Bonus Reward</div>
              <div className="font-medium" style={{ color: brandColors.navyDeep }}>
                Exclusive Artifact
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={onStart}
          disabled={isLocked}
          className="w-full py-6 text-lg font-semibold text-white rounded-xl"
          style={{ 
            background: isLocked ? '#9ca3af' : `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          {isLocked ? (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Mission Locked
            </>
          ) : (
            <>
              Begin Mission
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}