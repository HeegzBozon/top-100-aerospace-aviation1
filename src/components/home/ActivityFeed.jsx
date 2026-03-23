import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Activity, Zap, BrainCircuit, UserPlus, Trophy,
  Rocket, Newspaper, ArrowRight, Briefcase, Star
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const SIGNAL_CONFIG = {
  nomination: { icon: UserPlus, color: '#3b82f6', bg: '#eff6ff' },
  patent: { icon: Zap, color: '#f97316', bg: '#fff7ed' },
  research: { icon: BrainCircuit, color: '#8b5cf6', bg: '#f5f3ff' },
  recognition: { icon: Trophy, color: '#eab308', bg: '#fefce8' },
  article: { icon: Newspaper, color: '#06b6d4', bg: '#ecfeff' },
  startup: { icon: Rocket, color: '#10b981', bg: '#ecfdf5' },
  flightography: { icon: Briefcase, color: '#ec4899', bg: '#fdf2f8' },
  community: { icon: Star, color: '#6366f1', bg: '#eef2ff' },
};

function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed({ user }) {
  // Fetch recent nominations
  const { data: nominations = [] } = useQuery({
    queryKey: ['widget-nominations'],
    queryFn: () => base44.entities.Nominee.list('-created_date', 5),
    staleTime: 120000,
  });

  // Fetch recent signals
  const { data: signals = [] } = useQuery({
    queryKey: ['widget-signals'],
    queryFn: () => base44.entities.IntelligenceSignal.list('-verified_at', 5),
    staleTime: 120000,
  });

  // Build combined feed
  const activities = [
    ...nominations.map(n => ({
      id: `nom-${n.id}`,
      type: 'nomination',
      text: `${n.full_name || 'Someone'} was nominated`,
      time: n.created_date || n.updated_date,
    })),
    ...signals.map(s => ({
      id: `sig-${s.id}`,
      type: s.type || 'research',
      text: s.title?.slice(0, 80) || 'New signal detected',
      time: s.publication_date || s.verified_at,
    })),
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border shadow-sm"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>Signal Feed</h3>
        </div>
        <Link
          to={createPageUrl('SignalFeed')}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:underline"
          style={{ color: brandColors.goldPrestige }}
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((activity, index) => {
            const config = SIGNAL_CONFIG[activity.type] || { icon: Activity, color: '#64748b', bg: '#f8fafc' };
            const Icon = config.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-start gap-3 group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: config.bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug truncate">{activity.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(activity.time)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}