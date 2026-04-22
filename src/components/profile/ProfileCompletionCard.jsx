import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Circle, Camera, FileText, Linkedin, MapPin,
  Briefcase, Link2, Hash, Sparkles, Trophy, Zap, Shield, Star
} from 'lucide-react';

const brandColors = { navyDeep: '#1e3a5a', goldPrestige: '#c9a87c' };

// These fields match exactly what the merged UserProfileEditor edits
const PROFILE_FIELDS = [
  { key: 'avatar_url', label: 'Profile photo', icon: Camera, points: 15, source: 'user' },
  { key: 'headline', label: 'Professional headline', icon: Briefcase, points: 15, source: 'user' },
  { key: 'bio', label: 'Bio / About', icon: FileText, points: 15, source: 'user' },
  { key: 'location', label: 'Country', icon: MapPin, points: 10, source: 'user' },
  { key: 'linkedin_url', label: 'LinkedIn URL', icon: Linkedin, points: 10, source: 'user' },
  { key: 'website_url', label: 'Website', icon: Link2, points: 5, source: 'user' },
  { key: 'industry_role', label: 'Industry role', icon: Briefcase, points: 10, source: 'user' },
  { key: 'expertise_tags', label: 'Expertise tags', icon: Hash, points: 10, source: 'user', isArray: true },
];

const NOMINEE_BONUS_FIELDS = [
  { key: 'six_word_story', label: 'Six-word story', icon: Sparkles, points: 10, source: 'nominee' },
];

const BADGES = [
  { id: 'starter', label: 'Mission Ready', icon: Zap, threshold: 25, color: '#64748b', desc: 'Started your profile' },
  { id: 'builder', label: 'Signal Builder', icon: Star, threshold: 50, color: '#c9a87c', desc: '50% complete' },
  { id: 'authority', label: 'Authority', icon: Shield, threshold: 75, color: '#4a90b8', desc: '75% complete' },
  { id: 'legend', label: 'TOP 100 Legend', icon: Trophy, threshold: 100, color: '#c9a87c', desc: 'Fully complete' },
];

function RadialProgress({ percentage, size = 100 }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${brandColors.navyDeep}10`} strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={brandColors.navyDeep} />
            <stop offset="100%" stopColor={brandColors.goldPrestige} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-2xl font-bold" style={{ color: brandColors.navyDeep }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {percentage}%
        </motion.span>
      </div>
    </div>
  );
}

export default function ProfileCompletionCard({ user, nominee }) {
  const [showChecklist, setShowChecklist] = useState(false);

  const allFields = useMemo(() => {
    const base = [...PROFILE_FIELDS];
    if (nominee) base.push(...NOMINEE_BONUS_FIELDS);
    return base;
  }, [nominee]);

  const { percentage, completed, missing, earnedBadges, nextBadge } = useMemo(() => {
    let totalPoints = 0;
    let earnedPoints = 0;
    const completedFields = [];
    const missingFields = [];

    allFields.forEach(field => {
      totalPoints += field.points;
      const entity = field.source === 'nominee' ? nominee : user;
      const val = entity?.[field.key];
      const isFilled = field.isArray ? (Array.isArray(val) && val.length > 0) : !!val;
      if (isFilled) {
        earnedPoints += field.points;
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    });

    const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const earned = BADGES.filter(b => pct >= b.threshold);
    const next = BADGES.find(b => pct < b.threshold);

    return { percentage: pct, completed: completedFields, missing: missingFields, earnedBadges: earned, nextBadge: next };
  }, [user, nominee, allFields]);

  const rankLabel = percentage === 100 ? 'LEGEND' : percentage >= 75 ? 'AUTHORITY' : percentage >= 50 ? 'BUILDER' : 'RECRUIT';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brandColors.navyDeep }}>Profile Strength</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {percentage === 100 ? 'Maximum signal achieved' : `${missing.length} field${missing.length !== 1 ? 's' : ''} to go`}
            </p>
          </div>
          <Badge
            className="text-[10px] font-bold tracking-wider"
            style={{
              background: percentage >= 75 ? `${brandColors.goldPrestige}20` : `${brandColors.navyDeep}10`,
              color: percentage >= 75 ? brandColors.goldPrestige : brandColors.navyDeep,
            }}
          >
            {rankLabel}
          </Badge>
        </div>

        <div className="flex items-center gap-5">
          <RadialProgress percentage={percentage} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {earnedBadges.map(badge => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: `${badge.color}18`, color: badge.color }}
                    title={badge.desc}
                  >
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </motion.div>
                );
              })}
            </div>
            {nextBadge && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Next: <strong className="text-slate-600">{nextBadge.label}</strong> at {nextBadge.threshold}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowChecklist(!showChecklist)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-medium border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
        style={{ color: brandColors.navyDeep }}
      >
        <span>{showChecklist ? 'Hide checklist' : 'Show checklist'}</span>
        <span className="text-slate-400">{completed.length}/{allFields.length}</span>
      </button>

      {showChecklist && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-100 px-5 py-3 space-y-2"
        >
          {allFields.map(field => {
            const Icon = field.icon;
            const entity = field.source === 'nominee' ? nominee : user;
            const val = entity?.[field.key];
            const done = field.isArray ? (Array.isArray(val) && val.length > 0) : !!val;
            return (
              <div key={field.key} className="flex items-center gap-2.5 py-1">
                {done ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-700 font-medium'}`}>{field.label}</span>
                {field.source === 'nominee' && <span className="text-[9px] text-slate-300 italic">nominee</span>}
                <span className="ml-auto text-[10px] text-slate-300">+{field.points}pts</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}