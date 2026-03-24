import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Plane, Newspaper, Satellite, Radio, ShieldAlert, Rss, Shield, Anchor, BarChart3, Siren, Zap, AlertTriangle, Building2, PackageSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  WorldMonitorGlobe,
  AviationNewsFeed,
  LiveFlightsPanel,
  SatelliteTracker,
  GpsJammingPanel,
  RiskScoresPanel,
  NewsFeedDigest,
  MilitaryPosturePanel,
  MaritimePanel,
  MarketSignalsPanel,
  ConflictAlertsPanel,
  DisastersPanel,
  CyberThreatsPanel,
  InfrastructurePanel,
  SupplyChainPanel,
} from '@/components/capabilities/global-intelligence';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const DATA_TABS = [
  { id: 'news', label: 'Aviation News', icon: Newspaper },
  { id: 'flights', label: 'Live Flights', icon: Plane },
  { id: 'satellites', label: 'Satellites', icon: Satellite },
  { id: 'gps', label: 'GPS Signals', icon: Radio },
  { id: 'risk', label: 'Risk Scores', icon: ShieldAlert },
  { id: 'digest', label: 'News Digest', icon: Rss },
  { id: 'posture', label: 'Mil. Posture', icon: Shield },
  { id: 'maritime', label: 'Maritime', icon: Anchor },
  { id: 'markets', label: 'Markets', icon: BarChart3 },
  { id: 'conflicts', label: 'Conflicts', icon: Siren },
  { id: 'disasters', label: 'Disasters',      icon: AlertTriangle },
  { id: 'cyber',     label: 'Cyber',          icon: Zap },
  { id: 'infra',     label: 'Infrastructure', icon: Building2 },
  { id: 'supply',   label: 'Supply Chain',   icon: PackageSearch },
];

export default function GlobalIntelligence() {
  const [activeTab, setActiveTab] = useState(DATA_TABS[0].id);

  return (
    <div
      className="min-h-screen overflow-x-hidden sf-pro"
      style={{ background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 50%, #faf8f5 100%)` }}
    >
      <div className="px-4 py-8 md:px-6 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-4 rounded-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            >
              <Globe2 className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold"
                style={{ color: brandColors.navyDeep }}
              >
                Global Intelligence
              </h1>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Real-time aerospace, aviation & geopolitical intelligence — fully independent data feeds
              </p>
            </div>
          </div>
        </motion.div>

        {/* Native Globe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <WorldMonitorGlobe />
        </motion.div>

        {/* Data Panels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-card border border-slate-200/50 rounded-2xl shadow-lg p-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 bg-slate-100/50 p-1.5 rounded-xl mb-6">
              {DATA_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    aria-label={tab.label}
                    className="flex flex-col items-center gap-1 rounded-lg text-xs data-[state=active]:glass-card data-[state=active]:shadow-md transition-all duration-200 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:block font-medium leading-tight text-center">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="news"><ErrorBoundary label="Aviation News">{activeTab === 'news' && <AviationNewsFeed />}</ErrorBoundary></TabsContent>
            <TabsContent value="flights"><ErrorBoundary label="Live Flights">{activeTab === 'flights' && <LiveFlightsPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="satellites"><ErrorBoundary label="Satellites">{activeTab === 'satellites' && <SatelliteTracker />}</ErrorBoundary></TabsContent>
            <TabsContent value="gps"><ErrorBoundary label="GPS Signals">{activeTab === 'gps' && <GpsJammingPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="risk"><ErrorBoundary label="Risk Scores">{activeTab === 'risk' && <RiskScoresPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="digest"><ErrorBoundary label="News Digest">{activeTab === 'digest' && <NewsFeedDigest />}</ErrorBoundary></TabsContent>
            <TabsContent value="posture"><ErrorBoundary label="Mil. Posture">{activeTab === 'posture' && <MilitaryPosturePanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="maritime"><ErrorBoundary label="Maritime">{activeTab === 'maritime' && <MaritimePanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="markets"><ErrorBoundary label="Markets">{activeTab === 'markets' && <MarketSignalsPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="conflicts"><ErrorBoundary label="Conflicts">{activeTab === 'conflicts' && <ConflictAlertsPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="disasters"><ErrorBoundary label="Disasters">{activeTab === 'disasters' && <DisastersPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="cyber"><ErrorBoundary label="Cyber Threats">{activeTab === 'cyber' && <CyberThreatsPanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="infra"><ErrorBoundary label="Infrastructure">{activeTab === 'infra' && <InfrastructurePanel />}</ErrorBoundary></TabsContent>
            <TabsContent value="supply"><ErrorBoundary label="Supply Chain">{activeTab === 'supply' && <SupplyChainPanel />}</ErrorBoundary></TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </div>
  );
}