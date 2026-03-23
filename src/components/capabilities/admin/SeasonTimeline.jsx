import { format, isWithinInterval, isPast, isFuture } from 'date-fns';
import { 
  Calendar, Users, Vote, Award, RefreshCw, 
  CheckCircle, Play 
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

const PHASES = [
  { key: 'rollover', label: 'Rollover', icon: RefreshCw, color: 'blue' },
  { key: 'nomination', label: 'Nominations', icon: Users, color: 'yellow' },
  { key: 'voting', label: 'Voting', icon: Vote, color: 'green' },
  { key: 'review', label: 'Review', icon: Award, color: 'purple' },
];

function getPhaseStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'not_set';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isWithinInterval(now, { start, end })) return 'active';
  if (isPast(end)) return 'completed';
  if (isFuture(start)) return 'upcoming';
  return 'not_set';
}

function PhaseBlock({ phase, startDate, endDate, isFirst, isLast }) {
  const status = getPhaseStatus(startDate, endDate);
  const Icon = phase.icon;
  
  const statusStyles = {
    active: {
      bg: 'bg-green-100 border-green-500',
      icon: 'text-green-600',
      badge: 'bg-green-500 text-white',
      line: 'bg-green-500',
    },
    completed: {
      bg: 'bg-gray-100 border-gray-300',
      icon: 'text-gray-500',
      badge: 'bg-gray-500 text-white',
      line: 'bg-gray-400',
    },
    upcoming: {
      bg: 'bg-white border-gray-200',
      icon: 'text-gray-400',
      badge: 'bg-gray-200 text-gray-600',
      line: 'bg-gray-200',
    },
    not_set: {
      bg: 'bg-gray-50 border-dashed border-gray-200',
      icon: 'text-gray-300',
      badge: 'bg-gray-100 text-gray-400',
      line: 'bg-gray-100',
    },
  }[status];

  return (
    <div className="flex items-center">
      <div className={`relative flex-1 p-3 rounded-lg border-2 ${statusStyles.bg} transition-all`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${statusStyles.icon}`} />
          <span className="font-semibold text-sm text-gray-800">{phase.label}</span>
          {status === 'active' && (
            <span className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              <Play className="w-3 h-3" /> Live
            </span>
          )}
          {status === 'completed' && (
            <CheckCircle className="w-4 h-4 text-gray-500" />
          )}
        </div>
        {startDate && endDate ? (
          <p className="text-xs text-gray-500">
            {format(new Date(startDate), 'MMM d')} → {format(new Date(endDate), 'MMM d, yyyy')}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">Not scheduled</p>
        )}
      </div>
      {!isLast && (
        <div className={`w-8 h-1 ${statusStyles.line}`} />
      )}
    </div>
  );
}

export default function SeasonTimeline({ season }) {
  if (!season) return null;

  const phases = [
    { 
      ...PHASES[0], 
      startDate: season.start_date, 
      endDate: season.nomination_start,
    },
    { 
      ...PHASES[1], 
      startDate: season.nomination_start, 
      endDate: season.nomination_end,
    },
    { 
      ...PHASES[2], 
      startDate: season.voting_start, 
      endDate: season.voting_end,
    },
    { 
      ...PHASES[3], 
      startDate: season.review_start, 
      endDate: season.review_end,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Season Timeline</span>
      </div>
      <div className="flex items-center gap-0">
        {phases.map((phase, idx) => (
          <PhaseBlock 
            key={phase.key}
            phase={phase}
            startDate={phase.startDate}
            endDate={phase.endDate}
            isFirst={idx === 0}
            isLast={idx === phases.length - 1}
          />
        ))}
      </div>
    </div>
  );
}