import { Calendar, RefreshCw, Users, Vote, Award, CheckCircle, Archive, Play, Square, RotateCcw } from 'lucide-react';

// Lifecycle transitions per cohort status. variant: 'primary' (copper) | 'outline'.
export const STATUS_CONFIG = {
  planning: {
    label: 'Planning', icon: Calendar, tone: 'bg-editorial-navy/5 text-editorial-navy',
    actions: [
      { label: 'Open Nominations', nextStatus: 'nominations_open', icon: Play, variant: 'primary' },
      { label: 'Start Rollover', icon: RefreshCw, variant: 'outline', requiresRollover: true },
    ],
  },
  rollover: {
    label: 'Rollover', icon: RefreshCw, tone: 'bg-editorial-navy/5 text-editorial-navy',
    actions: [
      { label: 'Open Nominations', nextStatus: 'nominations_open', icon: Play, variant: 'primary' },
      { label: 'Rollover Nominees', icon: RefreshCw, variant: 'outline', requiresRollover: true },
      { label: 'Back to Planning', nextStatus: 'planning', icon: RotateCcw, variant: 'outline' },
    ],
  },
  nominations_open: {
    label: 'Nominations Open', icon: Users, tone: 'bg-editorial-gold/20 text-editorial-navy',
    actions: [
      { label: 'Open Voting', nextStatus: 'voting_open', icon: Vote, variant: 'primary', requiresValidation: true },
      { label: 'Back to Rollover', nextStatus: 'rollover', icon: RotateCcw, variant: 'outline' },
    ],
  },
  voting_open: {
    label: 'Voting Open', icon: Vote, tone: 'bg-editorial-copper/15 text-editorial-copper',
    actions: [
      { label: 'Start Review', nextStatus: 'review', icon: Award, variant: 'primary' },
      { label: 'Close Season', nextStatus: 'completed', icon: Square, variant: 'outline' },
      { label: 'Back to Nominations', nextStatus: 'nominations_open', icon: RotateCcw, variant: 'outline' },
    ],
  },
  review: {
    label: 'Review', icon: Award, tone: 'bg-editorial-copper/15 text-editorial-copper',
    actions: [
      { label: 'Complete Season', nextStatus: 'completed', icon: CheckCircle, variant: 'primary' },
      { label: 'Back to Voting', nextStatus: 'voting_open', icon: RotateCcw, variant: 'outline' },
    ],
  },
  completed: {
    label: 'Completed', icon: CheckCircle, tone: 'bg-editorial-navy text-editorial-cream',
    actions: [
      { label: 'Archive', nextStatus: 'archived', icon: Archive, variant: 'primary' },
      { label: 'Rollover Nominees', icon: RefreshCw, variant: 'outline', requiresRollover: true },
      { label: 'Reopen', nextStatus: 'planning', icon: RotateCcw, variant: 'outline' },
    ],
  },
  archived: { label: 'Archived', icon: Archive, tone: 'bg-editorial-navy/10 text-editorial-navy/60', actions: [] },
};

// Phases an admin can move a whole season (all cohorts) into from the parent level.
export const GROUP_PHASES = [
  { status: 'planning', label: 'Planning' },
  { status: 'nominations_open', label: 'Nominations' },
  { status: 'voting_open', label: 'Voting' },
  { status: 'review', label: 'Review' },
  { status: 'completed', label: 'Completed' },
];

export const statusOf = (s) => STATUS_CONFIG[s?.status] || STATUS_CONFIG.planning;