import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Plane, Newspaper, Satellite, Radio, ShieldAlert, Rss } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import {
  WorldMonitorGlobe,
  AviationNewsFeed,
  LiveFlightsPanel,
  SatelliteTracker,
  GpsJammingPanel,
  RiskScoresPanel,
  NewsFeedDigest,
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
];

export default function GlobalIntelligence() {
  const [activeTab, setActiveTab] = useState(DATA_TABS[0].id);
  const [isAuthed, setIsAuthed] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (!authed) base44.auth.redirectToLogin(window.location.pathname);
      else setIsAuthed(true);
    });
  }, []);

  if (!isAuthed) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

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
                Real-time aerospace, aviation & geopolitical intelligence — powered by World Monitor
              </p>
            </div>
          </div>
        </motion.div>

        {/* Globe iFrame */}
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
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100/50 p-1.5 rounded-xl mb-6">
              {DATA_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
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

            <TabsContent value="news">{activeTab === 'news' && <AviationNewsFeed />}</TabsContent>
            <TabsContent value="flights">{activeTab === 'flights' && <LiveFlightsPanel />}</TabsContent>
            <TabsContent value="satellites">{activeTab === 'satellites' && <SatelliteTracker />}</TabsContent>
            <TabsContent value="gps">{activeTab === 'gps' && <GpsJammingPanel />}</TabsContent>
            <TabsContent value="risk">{activeTab === 'risk' && <RiskScoresPanel />}</TabsContent>
            <TabsContent value="digest">{activeTab === 'digest' && <NewsFeedDigest />}</TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </div>
  );
}