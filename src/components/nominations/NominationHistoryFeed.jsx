import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Loader2,
  Clock, Send, Inbox, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Not Selected', color: 'bg-gray-100 text-gray-500' },
  winner: { label: 'Winner', color: 'bg-purple-100 text-purple-700' },
  finalist: { label: 'Finalist', color: 'bg-indigo-100 text-indigo-700' },
};

/* ─── Submitted Card ─────────────────────────────────────── */
function SubmittedCard({ nominee }) {
  const status = statusConfig[nominee.status] || statusConfig.pending;

  return (
    <div
      className="p-4 border-b last:border-b-0 hover:bg-gray-50/50 transition-colors"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm"
          style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
        >
          {nominee.name?.charAt(0)?.toUpperCase() || 'N'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: brandColors.skyBlue }} />
                <h4 className="font-semibold text-[15px]" style={{ color: brandColors.navyDeep }}>
                  {nominee.name}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5 ml-5">
                {nominee.category && (
                  <span className="text-xs capitalize" style={{ color: `${brandColors.navyDeep}60` }}>
                    {nominee.category.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="text-xs" style={{ color: `${brandColors.navyDeep}40` }}>•</span>
                <span className="text-xs flex items-center gap-1" style={{ color: `${brandColors.navyDeep}50` }}>
                  <Clock className="w-3 h-3" />
                  {moment(nominee.created_date).fromNow()}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className={`${status.color} text-[10px] font-medium shrink-0`}>
              {status.label}
            </Badge>
          </div>

          {/* Reason preview */}
          {nominee.nomination_reason && (
            <p className="text-sm mt-2 line-clamp-2 ml-5" style={{ color: `${brandColors.navyDeep}80` }}>
              "{nominee.nomination_reason}"
            </p>
          )}

          {/* LinkedIn link */}
          {nominee.linkedin_profile_url && (
            <a
              href={nominee.linkedin_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-2 ml-5 hover:underline"
              style={{ color: brandColors.skyBlue }}
            >
              <ExternalLink className="w-3 h-3" />
              View LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Received Card ──────────────────────────────────────── */
function ReceivedCard({ nominee }) {
  const status = statusConfig[nominee.status] || statusConfig.pending;

  return (
    <div
      className="p-4 border-b last:border-b-0 transition-colors"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      {/* Gold accent strip on left */}
      <div className="flex gap-3 relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ background: `linear-gradient(180deg, ${brandColors.goldPrestige}, ${brandColors.skyBlue})` }}
        />
        <div className="pl-3 flex gap-3 w-full">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})` }}
          >
            {nominee.nominated_by?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" style={{ color: brandColors.goldPrestige }} />
                  <span className="text-xs font-medium" style={{ color: brandColors.goldPrestige }}>
                    You were nominated!
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 ml-5">
                  <span className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                    by <span className="font-medium">{nominee.nominated_by || 'Someone'}</span>
                  </span>
                  {nominee.category && (
                    <>
                      <span className="text-xs" style={{ color: `${brandColors.navyDeep}40` }}>•</span>
                      <span className="text-xs capitalize" style={{ color: `${brandColors.navyDeep}60` }}>
                        {nominee.category.replace(/_/g, ' ')}
                      </span>
                    </>
                  )}
                  <span className="text-xs" style={{ color: `${brandColors.navyDeep}40` }}>•</span>
                  <span className="text-xs flex items-center gap-1" style={{ color: `${brandColors.navyDeep}50` }}>
                    <Clock className="w-3 h-3" />
                    {moment(nominee.created_date).fromNow()}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className={`${status.color} text-[10px] font-medium shrink-0`}>
                {status.label}
              </Badge>
            </div>

            {/* Reason preview */}
            {nominee.nomination_reason && (
              <div
                className="mt-2 ml-5 px-3 py-2 rounded-lg text-sm italic line-clamp-2"
                style={{
                  background: `${brandColors.goldPrestige}10`,
                  borderLeft: `2px solid ${brandColors.goldPrestige}40`,
                  color: `${brandColors.navyDeep}80`,
                }}
              >
                "{nominee.nomination_reason}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Bar ──────────────────────────────────────────── */
function StatsBar({ submitted, received }) {
  return (
    <div
      className="grid grid-cols-2 gap-px border-b"
      style={{ borderColor: `${brandColors.navyDeep}10`, background: `${brandColors.navyDeep}08` }}
    >
      <div className="bg-white px-4 py-3 text-center">
        <p className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>{submitted.length}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: `${brandColors.navyDeep}50` }}>Submitted</p>
      </div>
      <div className="bg-white px-4 py-3 text-center">
        <p className="text-xl font-bold" style={{ color: brandColors.goldPrestige }}>{received.length}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: `${brandColors.navyDeep}50` }}>Received</p>
      </div>
    </div>
  );
}

/* ─── Empty States ───────────────────────────────────────── */
function EmptySubmitted() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: `${brandColors.goldPrestige}15` }}
      >
        <Send className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: brandColors.navyDeep }}>
        No nominations submitted yet
      </h3>
      <p className="text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
        Switch to the "Nominate" tab to put someone forward.
      </p>
    </div>
  );
}

function EmptyReceived() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: `${brandColors.skyBlue}15` }}
      >
        <Inbox className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: brandColors.navyDeep }}>
        No nominations received yet
      </h3>
      <p className="text-sm" style={{ color: `${brandColors.navyDeep}60` }}>
        When someone nominates you, it'll show up here.
      </p>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function NominationHistoryFeed() {
  const [activeTab, setActiveTab] = useState('submitted');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  /* Nominations I submitted */
  const { data: submitted = [], isLoading: loadingSubmitted } = useQuery({
    queryKey: ['nominations-submitted', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Nominee.filter({ nominated_by: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
  });

  /* Nominations received (someone nominated me) */
  const { data: received = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['nominations-received', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Nominee.filter({ nominee_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
  });

  const isLoading = loadingSubmitted || loadingReceived;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  const tabs = [
    {
      id: 'submitted',
      label: 'Submitted',
      icon: Send,
      count: submitted.length,
      color: brandColors.navyDeep,
    },
    {
      id: 'received',
      label: 'Received',
      icon: Inbox,
      count: received.length,
      color: brandColors.goldPrestige,
      highlight: received.length > 0,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Stats Bar */}
      <StatsBar submitted={submitted} received={received} />

      {/* Tabs */}
      <div
        className="flex border-b sticky top-0 z-10 bg-white"
        style={{ borderColor: `${brandColors.navyDeep}10` }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
              style={{ color: isActive ? tab.color : `${brandColors.navyDeep}50` }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? `${tab.color}18` : `${brandColors.navyDeep}08`,
                    color: isActive ? tab.color : `${brandColors.navyDeep}50`,
                  }}
                >
                  {tab.count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: tab.color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              {/* Received new badge */}
              {tab.highlight && tab.count > 0 && !isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full absolute top-2.5 right-6"
                  style={{ background: brandColors.goldPrestige }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            {submitted.length === 0 ? (
              <EmptySubmitted />
            ) : (
              <div>
                {submitted.map((nominee) => (
                  <SubmittedCard key={nominee.id} nominee={nominee} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'received' && (
          <motion.div
            key="received"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            {received.length === 0 ? (
              <EmptyReceived />
            ) : (
              <div>
                {received.map((nominee) => (
                  <ReceivedCard key={nominee.id} nominee={nominee} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}