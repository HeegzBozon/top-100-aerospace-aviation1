import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarDays, Map, Compass, Plane } from 'lucide-react';
import { ScheduleTab } from '@/components/capabilities/calendar';
import { RoadmapTab } from '@/components/capabilities/calendar';
import { StrategicThemesTab } from '@/components/capabilities/calendar';
import { FlightPlanTab } from '@/components/capabilities/calendar';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const TABS = [
  { value: 'flightplan', icon: Plane, label: 'Flight Plan', shortLabel: 'Flight' },
  { value: 'strategy', icon: Compass, label: 'Strategic Themes', shortLabel: 'Themes' },
  { value: 'roadmap', icon: Map, label: 'Roadmap', shortLabel: 'Roadmap' },
  { value: 'events', icon: CalendarDays, label: 'Schedule', shortLabel: 'Schedule' },
];

export default function CalendarView({ initialTab = 'flightplan', embedded = false }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (!embedded) {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && TABS.some(t => t.value === tab)) {
        setActiveTab(tab);
      }
    }
  }, [embedded]);

  return (
    <div 
      className={`${embedded ? '' : 'min-h-screen p-3 md:p-6'}`} 
      style={{ background: brandColors.cream }}
    >
      <div className="w-full">
        {/* Header - hide when embedded */}
        {!embedded && (
          <div className="mb-6 md:mb-8 text-center px-2">
            <div 
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4"
              style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2c4a6e 100%)` }}
            >
              <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 
              className="text-2xl md:text-4xl font-bold mb-2"
              style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
            >
              Calendar
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto px-4">
              Stay updated with community events and help shape our future.
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal scroll pills */}
          <div className="md:hidden mb-4 px-1">
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeTab === tab.value
                      ? 'text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                  style={activeTab === tab.value ? { background: brandColors.navyDeep } : {}}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Centered tab list */}
          <div className="hidden md:flex justify-center mb-8">
            <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
              {TABS.map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="gap-2 px-4 data-[state=active]:bg-slate-100"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <TabsContent value="flightplan" className="mt-0">
              <FlightPlanTab />
            </TabsContent>

            <TabsContent value="strategy" className="mt-0">
              <StrategicThemesTab />
            </TabsContent>

            <TabsContent value="roadmap" className="mt-0">
              <RoadmapTab />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <ScheduleTab />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}