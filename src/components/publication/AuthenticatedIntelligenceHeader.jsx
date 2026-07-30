import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Library } from 'lucide-react';
import ComingSoonIntelligenceTab from '@/components/publication/ComingSoonIntelligenceTab';
import PublicationTabSearch from '@/components/publication/PublicationTabSearch';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function AuthenticatedIntelligenceHeader({ nominees = [], onSelectNominee }) {
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
          <div className="flex items-center gap-2 md:gap-4" style={{ borderBottom: `1px solid ${brandColors.ink}10` }}>
          <TabsList 
            className="grid max-w-md flex-1 grid-cols-2 h-auto p-0.5 bg-transparent border-0"
            style={{ background: 'transparent' }}
          >
...
          </TabsList>
          <a
            href="#volumes"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('volumes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-3 text-xs md:text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: `${brandColors.ink}60` }}
          >
            <Library className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Archive</span>
          </a>
          </div>

          {/* Content */}
          <div className="mt-6 md:mt-8">
            <TabsContent value="publication" className="focus-visible:outline-none">
              <PublicationTabSearch nominees={nominees} onSelectNominee={onSelectNominee} />
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