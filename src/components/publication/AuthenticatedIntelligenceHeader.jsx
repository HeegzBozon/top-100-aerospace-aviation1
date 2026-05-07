import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock } from 'lucide-react';
import ComingSoonIntelligenceTab from '@/components/publication/ComingSoonIntelligenceTab';

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
            className="grid w-full max-w-md grid-cols-2 h-auto p-0.5 bg-transparent border-0"
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
              value="coming-soon"
              className="relative rounded-none border-0 px-3 py-3 text-xs md:text-sm font-medium transition-none data-[state=active]:bg-transparent data-[state=active]:text-inherit"
              style={{
                color: activeTab === 'coming-soon' ? brandColors.navyDeep : `${brandColors.ink}60`,
              }}
            >
              <motion.div className="flex items-center gap-1.5 md:gap-2" layout>
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Coming Soon</span>
              </motion.div>
              {activeTab === 'coming-soon' && (
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

            <TabsContent value="coming-soon" className="focus-visible:outline-none">
              <ComingSoonIntelligenceTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.section>
  );
}