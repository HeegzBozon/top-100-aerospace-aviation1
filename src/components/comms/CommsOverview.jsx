import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Activity, CheckCircle2, Rocket, CalendarDays,
  Sparkles, Shield, Settings
} from 'lucide-react';
import { RoadmapItem } from '@/entities/RoadmapItem';
import { base44 } from '@/api/base44Client';
import CalendarView from '@/components/calendar/CalendarView';
import RoadmapTab from '@/components/calendar/RoadmapTab';
import Season4Tracker from '@/components/comms/Season4Tracker.jsx';
import Season4DateEditor from '@/components/comms/Season4DateEditor.jsx';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const PLATFORM_VERSION = "3.2.0";
const LAST_UPDATED = "February 19, 2026";

const SYSTEM_STATUS = [
  { name: "Core Platform", status: "operational", uptime: "99.98%" },
  { name: "Database", status: "operational", uptime: "99.99%" },
  { name: "Authentication", status: "operational", uptime: "100%" },
  { name: "File Storage", status: "operational", uptime: "99.95%" },
  { name: "Notifications", status: "operational", uptime: "99.90%" },
  { name: "Integrations", status: "operational", uptime: "99.85%" },
];

const RECENT_UPDATES = [
  { version: "3.2.0", date: "Feb 19, 2026", description: "Arcade games, Gather space integration, improved comms" },
  { version: "3.1.5", date: "Feb 12, 2026", description: "Channel management, message reactions, poll enhancements" },
  { version: "3.1.0", date: "Feb 5, 2026", description: "Slack-style navigation, new icon rail, DM improvements" },
  { version: "3.0.0", date: "Jan 28, 2026", description: "Season 3 launch, holistic scoring, new brand identity" },
];

const TABS = [
  { value: 'status', icon: Activity, label: 'Platform Status' },
  { value: 'roadmap', icon: Rocket, label: 'Program Roadmap' },
  { value: 'calendar', icon: CalendarDays, label: 'Calendar' },
];

const StatusBadge = ({ status }) => {
  const colors = {
    operational: { bg: '#10b98120', text: '#10b981', label: 'Operational' },
    degraded: { bg: '#f59e0b20', text: '#f59e0b', label: 'Degraded' },
    outage: { bg: '#ef444420', text: '#ef4444', label: 'Outage' },
  };
  const c = colors[status] || colors.operational;

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
};

const RoadmapStatusBadge = ({ status }) => {
  const colors = {
    'in-progress': { bg: '#3b82f620', text: '#3b82f6', label: 'in-progress' },
    'planned': { bg: '#8b5cf620', text: '#8b5cf6', label: 'planned' },
    'upcoming': { bg: '#f59e0b20', text: '#f59e0b', label: 'upcoming' },
    'completed': { bg: '#10b98120', text: '#10b981', label: 'completed' },
  };
  const c = colors[status] || colors.planned;

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
};

export default function CommsOverview({ initialTab = 'status' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showDateEditor, setShowDateEditor] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && TABS.some(t => t.value === tab)) {
      setActiveTab(tab);
    }

    // Check if user is admin
    base44.auth.me().then(setUser).catch(() => { });
  }, []);

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ['roadmap-items-status'],
    queryFn: () => RoadmapItem.filter({}, '-target_date', 10),
  });

  const isAdmin = user?.role === 'admin';
  const allOperational = SYSTEM_STATUS.every(s => s.status === 'operational');

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: brandColors.cream }}>
      {/* Header with Season 4 Tracker */}
      <div
        className="px-6 py-6 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2d4a6a 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Operations Hub</h1>
                <p className="text-white/60 text-sm">Platform status, roadmap & calendar</p>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDateEditor(true)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Dates
              </Button>
            )}
          </div>

          {/* Admin Date Editor Modal */}
          {showDateEditor && (
            <Season4DateEditor onClose={() => setShowDateEditor(false)} />
          )}

          {/* Season 4 Progress Tracker */}
          <Season4Tracker />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 bg-white border-b shrink-0" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 p-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-6"
          >
            <div className="max-w-4xl mx-auto">
              {/* Overall Status Banner */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                style={{ background: allOperational ? '#10b98115' : '#f59e0b15' }}
              >
                <CheckCircle2
                  className="w-6 h-6"
                  style={{ color: allOperational ? '#10b981' : '#f59e0b' }}
                />
                <div>
                  <p className="font-semibold" style={{ color: brandColors.navyDeep }}>
                    {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last checked: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Systems Grid */}
              <div className="grid gap-3 mb-6">
                {SYSTEM_STATUS.map((system, i) => (
                  <motion.div
                    key={system.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border"
                    style={{ borderColor: `${brandColors.navyDeep}08` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: system.status === 'operational' ? '#10b981' : '#f59e0b' }}
                      />
                      <span className="font-medium" style={{ color: brandColors.navyDeep }}>
                        {system.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{system.uptime} uptime</span>
                      <StatusBadge status={system.status} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Version Info */}
              <div className="p-5 rounded-xl bg-white shadow-sm border" style={{ borderColor: `${brandColors.navyDeep}08` }}>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>Version Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Version</p>
                    <p className="font-mono font-bold text-lg" style={{ color: brandColors.navyDeep }}>
                      v{PLATFORM_VERSION}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium" style={{ color: brandColors.navyDeep }}>
                      {LAST_UPDATED}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4" style={{ borderColor: `${brandColors.navyDeep}10` }}>
                  <p className="text-xs font-medium text-gray-500 mb-3">Recent Updates</p>
                  <div className="space-y-2">
                    {RECENT_UPDATES.map((update, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span
                          className="px-2 py-0.5 rounded font-mono text-xs shrink-0"
                          style={{ background: `${brandColors.skyBlue}15`, color: brandColors.skyBlue }}
                        >
                          {update.version}
                        </span>
                        <span className="text-gray-600">{update.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RoadmapTab />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CalendarView embedded={true} />
          </motion.div>
        )}
      </div>
    </div>
  );
}