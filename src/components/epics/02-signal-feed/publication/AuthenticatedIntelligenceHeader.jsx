import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Radar, TrendingUp, Newspaper } from 'lucide-react';
import RadarDashboard from '@/pages/epics/01-index-engine/RadarDashboard';
import IntelligenceDashboard from '@/pages/epics/04-project-containers/IntelligenceDashboard';
import SpaceNews from '@/pages/epics/02-signal-feed/SpaceNews';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function AuthenticatedIntelligenceHeader() {
  const [activeTab, setActiveTab] = useState('publication');

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 backdrop-blur-lg bg-white/70 border-b border-gray-200"
      style={{ borderColor: `${brandColors.ink}10` }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl font-light tracking-tight"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: brandColors.navyDeep,
            }}
          >
            Intelligence Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs md:text-sm mt-1"
            style={{ color: `${brandColors.ink}60` }}
          >
            Radar signals, reviews, and research from aerospace leaders.
          </motion.p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" defaultValue="publication">
          <TabsList 
            className="grid w-full max-w-2xl grid-cols-4 h-auto p-0.5 bg-transparent border-0"
            style={{ 
              background: 'transparent',
              borderBottom: `1px solid ${brandColors.ink}10`
            }}
          >
            <TabsTrigger
              value="publication"
              className="relative rounded-none border-0 px-3 py-3 text-xs md:text-sm font-medium transition-none data-[state=active]:bg-transparent data-[state=active]:text-inherit"
              style={{
                color: activeTab === 'publication' ? brandColors.navyDeep : `${brandColors.ink}60`,
              }}
            >
              <motion.div
                className="flex items-center gap-1.5 md:gap-2"
                layout
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Publication</span>
              </motion.div>
              {activeTab === 'publication' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: brandColors.goldPrestige }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="radar"
              className="relative rounded-none border-0 px-3 py-3 text-xs md:text-sm font-medium transition-none data-[state=active]:bg-transparent data-[state=active]:text-inherit"
              style={{
                color: activeTab === 'radar' ? brandColors.navyDeep : `${brandColors.ink}60`,
              }}
            >
              <motion.div
                className="flex flex-col items-start gap-0.5"
                layout
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Radar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Radar Dashboard</span>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider leading-none" style={{ color: brandColors.goldPrestige }}>Prototype</span>
              </motion.div>
              {activeTab === 'radar' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: brandColors.goldPrestige }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="intelligence"
              className="relative rounded-none border-0 px-3 py-3 text-xs md:text-sm font-medium transition-none data-[state=active]:bg-transparent data-[state=active]:text-inherit"
              style={{
                color: activeTab === 'intelligence' ? brandColors.navyDeep : `${brandColors.ink}60`,
              }}
            >
              <motion.div
                className="flex flex-col items-start gap-0.5"
                layout
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Intelligence</span>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider leading-none" style={{ color: brandColors.goldPrestige }}>Prototype</span>
              </motion.div>
              {activeTab === 'intelligence' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: brandColors.goldPrestige }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="alumni"
              className="relative rounded-none border-0 px-3 py-3 text-xs md:text-sm font-medium transition-none data-[state=active]:bg-transparent data-[state=active]:text-inherit"
              style={{
                color: activeTab === 'alumni' ? brandColors.navyDeep : `${brandColors.ink}60`,
              }}
            >
              <motion.div
                className="flex flex-col items-start gap-0.5"
                layout
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Newspaper className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Alumni in News</span>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider leading-none" style={{ color: brandColors.goldPrestige }}>Prototype</span>
              </motion.div>
              {activeTab === 'alumni' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: brandColors.goldPrestige }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="mt-6 md:mt-8">
            <TabsContent value="publication" className="focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-slate-600">Return to the main publication to view the full Top 100 Women 2025 index.</p>
              </motion.div>
            </TabsContent>

            <TabsContent value="radar" className="focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RadarDashboard />
              </motion.div>
            </TabsContent>

            <TabsContent value="intelligence" className="focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <IntelligenceDashboard />
              </motion.div>
            </TabsContent>

            <TabsContent value="alumni" className="focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SpaceNews />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.section>
  );
}