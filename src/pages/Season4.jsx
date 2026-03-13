import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Award, Users, Calendar, ArrowRight, Sparkles, Trophy, Star, Plane, Compass, Map, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import ScheduleTab from '@/components/capabilities/calendar/ScheduleTab';
import RoadmapTab from '@/components/capabilities/calendar/RoadmapTab';
import StrategicThemesTab from '@/components/capabilities/calendar/StrategicThemesTab';
import FlightPlanTab from '@/components/capabilities/calendar/FlightPlanTab';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

export default function Season4() {
  const [activeTab, setActiveTab] = useState('flightplan');
  
  // Check URL params for tab on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['flightplan', 'strategy', 'roadmap', 'events'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const { data: nominees = [] } = useQuery({
    queryKey: ['season4-nominees'],
    queryFn: () => base44.entities.Nominee.filter({ status: 'active' }, '-aura_score', 10),
  });

  return (
    <div className="min-h-screen overflow-x-hidden max-w-[100vw]" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div 
        className="relative py-10 md:py-20 px-4 md:px-6 text-center overflow-hidden"
        style={{ 
          background: `linear-gradient(160deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 50%, ${brandColors.navyDeep} 100%)`,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: brandColors.goldPrestige }}
          />
          <div 
            className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: brandColors.goldLight }}
          />
        </div>

        <motion.div 
          className="max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 md:mb-5 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(201, 168, 124, 0.3)' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: brandColors.goldPrestige }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: brandColors.goldPrestige }}></span>
            </span>
            <span 
              className="text-[11px] md:text-sm font-semibold uppercase tracking-widest"
              style={{ color: brandColors.goldPrestige }}
            >
              Nominations Open
            </span>
          </motion.div>

          <h1 
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            TOP 100 Women in<br className="md:hidden" /> Aerospace & Aviation
          </h1>
          <p 
            className="text-base md:text-xl mb-2 font-medium"
            style={{ color: brandColors.goldLight, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Season 4 — 2026
          </p>
          <p 
            className="text-sm md:text-base text-white/70 max-w-md mx-auto mb-6 md:mb-8"
          >
            Celebrating extraordinary women shaping the future of flight and space.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button
              asChild
              className="text-white h-12 md:h-14 px-6 md:px-8 text-sm md:text-lg font-semibold rounded-xl shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}
            >
              <Link to={createPageUrl('Nominations')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Nominate Someone
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-lg border-white/20 text-white hover:bg-white/10 rounded-xl backdrop-blur-sm active:scale-[0.98] transition-transform"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Link to={createPageUrl('Top100Nominees2025') + '?list=women'}>
                View Nominees
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-5xl mx-auto py-6 md:py-16 px-4 md:px-6 overflow-hidden">
        <h2 
          className="text-lg md:text-3xl font-bold text-center mb-4 md:mb-12"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Season 4 Timeline
        </h2>
        {/* Mobile: Horizontal scroll timeline */}
        <div className="md:hidden -mx-4 px-4 overflow-hidden">
          <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide max-w-[100vw]">
            {[
              { phase: 'Nominations', date: 'Q1 2026', status: 'active', icon: Users },
              { phase: 'Voting Opens', date: 'Q2 2026', status: 'upcoming', icon: Star },
              { phase: 'Final Voting', date: 'Q3 2026', status: 'upcoming', icon: Award },
              { phase: 'Publication', date: 'Q4 2026', status: 'upcoming', icon: Trophy },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`shrink-0 w-[5.5rem] text-center p-3 rounded-2xl relative ${item.status === 'active' ? 'shadow-md' : ''}`}
                style={{ 
                  background: item.status === 'active' 
                    ? `linear-gradient(145deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}25)` 
                    : 'white',
                  border: `1px solid ${item.status === 'active' ? brandColors.goldPrestige + '50' : brandColors.navyDeep}12`
                }}
              >
                {item.status === 'active' && (
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                    style={{ background: brandColors.goldPrestige }}
                  />
                )}
                <div 
                  className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center ${item.status === 'active' ? '' : 'bg-slate-50'}`}
                  style={item.status === 'active' ? { background: `${brandColors.goldPrestige}20` } : {}}
                >
                  <item.icon 
                    className="w-5 h-5" 
                    style={{ color: item.status === 'active' ? brandColors.goldPrestige : brandColors.skyBlue }} 
                  />
                </div>
                <h3 
                  className="font-semibold text-[11px] mb-0.5 leading-tight"
                  style={{ color: brandColors.navyDeep }}
                >
                  {item.phase}
                </h3>
                <p className="text-[10px] font-medium" style={{ color: item.status === 'active' ? brandColors.goldPrestige : brandColors.skyBlue }}>
                  {item.date}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {[
            { phase: 'Nominations', date: 'Q1 2026', status: 'active', icon: Users },
            { phase: 'Voting Opens', date: 'Q2 2026', status: 'upcoming', icon: Star },
            { phase: 'Final Voting', date: 'Q3 2026', status: 'upcoming', icon: Award },
            { phase: 'Publication', date: 'Q4 2026', status: 'upcoming', icon: Trophy },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="text-center p-6 rounded-xl"
              style={{ 
                background: item.status === 'active' ? `linear-gradient(135deg, ${brandColors.goldPrestige}20, ${brandColors.roseAccent}20)` : 'white',
                border: `1px solid ${item.status === 'active' ? brandColors.goldPrestige : brandColors.navyDeep}20`
              }}
            >
              <item.icon 
                className="w-10 h-10 mx-auto mb-3" 
                style={{ color: item.status === 'active' ? brandColors.goldPrestige : brandColors.skyBlue }} 
              />
              <h3 
                className="font-bold text-lg mb-1"
                style={{ color: brandColors.navyDeep }}
              >
                {item.phase}
              </h3>
              <p className="text-sm" style={{ color: brandColors.skyBlue }}>
                {item.date}
              </p>
              {item.status === 'active' && (
                <span 
                  className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: brandColors.goldPrestige }}
                >
                  NOW OPEN
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-5xl mx-auto pb-6 md:pb-16 px-4 md:px-6 overflow-hidden">
        {/* Mobile: Horizontal scroll cards */}
        <div className="md:hidden -mx-4 px-4 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-[100vw]">
            {[
              { to: 'Top100Women2025', icon: Trophy, color: brandColors.goldPrestige, title: '2025 Winners', desc: "Last year's TOP 100" },
              { to: 'Top100Nominees2025', icon: Users, color: brandColors.skyBlue, title: 'Nominees', desc: 'Season 4 candidates' },
              { to: 'HowWePick', icon: Award, color: brandColors.roseAccent, title: 'How We Pick', desc: 'Selection process' },
            ].map((item, idx) => (
              <Link 
                key={idx}
                to={createPageUrl(item.to)}
                className="shrink-0 w-36 p-4 rounded-2xl bg-white active:scale-[0.97] transition-all shadow-sm hover:shadow-md"
                style={{ border: `1px solid ${brandColors.navyDeep}08` }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: `${item.color}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-semibold text-[13px] mb-0.5" style={{ color: brandColors.navyDeep }}>
                  {item.title}
                </h3>
                <p className="text-[10px] leading-snug" style={{ color: brandColors.skyBlue }}>
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <Link 
            to={createPageUrl('Top100Women2025')}
            className="p-6 rounded-xl bg-white hover:shadow-lg transition-shadow"
            style={{ border: `1px solid ${brandColors.navyDeep}10` }}
          >
            <Trophy className="w-8 h-8 mb-3" style={{ color: brandColors.goldPrestige }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
              2025 Winners
            </h3>
            <p className="text-sm mb-3" style={{ color: brandColors.skyBlue }}>
              View last year's TOP 100 honorees
            </p>
            <span className="flex items-center text-sm font-medium" style={{ color: brandColors.goldPrestige }}>
              View List <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          <Link 
            to={createPageUrl('Top100Nominees2025')}
            className="p-6 rounded-xl bg-white hover:shadow-lg transition-shadow"
            style={{ border: `1px solid ${brandColors.navyDeep}10` }}
          >
            <Users className="w-8 h-8 mb-3" style={{ color: brandColors.skyBlue }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
              Current Nominees
            </h3>
            <p className="text-sm mb-3" style={{ color: brandColors.skyBlue }}>
              Browse Season 4 nominees
            </p>
            <span className="flex items-center text-sm font-medium" style={{ color: brandColors.goldPrestige }}>
              Explore <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>

          <Link 
            to={createPageUrl('HowWePick')}
            className="p-6 rounded-xl bg-white hover:shadow-lg transition-shadow"
            style={{ border: `1px solid ${brandColors.navyDeep}10` }}
          >
            <Award className="w-8 h-8 mb-3" style={{ color: brandColors.roseAccent }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
              How We Pick
            </h3>
            <p className="text-sm mb-3" style={{ color: brandColors.skyBlue }}>
              Learn about our selection process
            </p>
            <span className="flex items-center text-sm font-medium" style={{ color: brandColors.goldPrestige }}>
              Learn More <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="max-w-7xl mx-auto py-6 md:py-16 px-4 md:px-6 overflow-hidden">
        <h2 
          className="text-lg md:text-3xl font-bold text-center mb-5 md:mb-8"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <Calendar className="w-5 h-5 md:w-8 md:h-8 inline-block mr-1.5 md:mr-3 mb-0.5" style={{ color: brandColors.goldPrestige }} />
          Season Calendar
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Pill tabs */}
          <div className="md:hidden mb-5 -mx-4 px-4 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-[100vw]">
              {[
                { value: 'flightplan', icon: Plane, label: 'Flight Plan' },
                { value: 'strategy', icon: Compass, label: 'Themes' },
                { value: 'roadmap', icon: Map, label: 'Roadmap' },
                { value: 'events', icon: CalendarDays, label: 'Schedule' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all shrink-0 active:scale-[0.97] ${
                    activeTab === tab.value
                      ? 'text-white shadow-lg'
                      : 'bg-white text-slate-500 shadow-sm'
                  }`}
                  style={activeTab === tab.value ? { 
                    background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`,
                  } : {
                    border: `1px solid ${brandColors.navyDeep}10`
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Centered tab list */}
          <div className="hidden md:flex justify-center mb-8">
            <TabsList className="bg-white border border-slate-200 p-1 shadow-sm">
              <TabsTrigger 
                value="flightplan" 
                className="gap-2 px-4 data-[state=active]:bg-slate-100"
              >
                <Plane className="w-4 h-4" />
                Flight Plan
              </TabsTrigger>
              <TabsTrigger 
                value="strategy" 
                className="gap-2 px-4 data-[state=active]:bg-slate-100"
              >
                <Compass className="w-4 h-4" />
                Strategic Themes
              </TabsTrigger>
              <TabsTrigger 
                value="roadmap" 
                className="gap-2 px-4 data-[state=active]:bg-slate-100"
              >
                <Map className="w-4 h-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="gap-2 px-4 data-[state=active]:bg-slate-100"
              >
                <CalendarDays className="w-4 h-4" />
                Schedule
              </TabsTrigger>
            </TabsList>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
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