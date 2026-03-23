import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Archive, ChevronDown, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import Season4ScoringFramework from '@/components/scoring/Season4ScoringFramework';
import Season3ScoringFramework from '@/components/scoring/Season3ScoringFramework';
import LegacyScoringFramework from '@/components/scoring/LegacyScoringFramework';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// Wrapper components to pass season prop
const Season2Component = () => <LegacyScoringFramework season={2} />;
const Season1Component = () => <LegacyScoringFramework season={1} />;

const SEASONS = [
  { id: 'season4', label: 'Season 4 (2026)', component: Season4ScoringFramework, current: true },
  { id: 'season3', label: 'Season 3 (2025)', component: Season3ScoringFramework, archived: true },
  { id: 'season2', label: 'Season 2 (2022)', component: Season2Component, archived: true },
  { id: 'season1', label: 'Season 1 (2021)', component: Season1Component, archived: true },
];

export default function Top100OS() {
  const [activeSeason, setActiveSeason] = useState('season4');
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const activeSeasonData = SEASONS.find(s => s.id === activeSeason);
  const ActiveComponent = activeSeasonData?.component;

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Season Selector */}
      <div className="sticky top-0 z-20 border-b" style={{ background: brandColors.cream, borderColor: `${brandColors.navyDeep}10` }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowSeasonPicker(!showSeasonPicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:bg-white"
              style={{ color: brandColors.navyDeep }}
            >
              <span>{activeSeasonData?.label}</span>
              {activeSeasonData?.current && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
                >
                  Current
                </span>
              )}
              {activeSeasonData?.archived && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1"
                  style={{ background: `${brandColors.navyDeep}10`, color: brandColors.navyDeep }}
                >
                  <Archive className="w-3 h-3" />
                  Archived
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showSeasonPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSeasonPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border overflow-hidden min-w-[200px]"
                style={{ borderColor: `${brandColors.navyDeep}10` }}
              >
                {SEASONS.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => {
                      setActiveSeason(season.id);
                      setShowSeasonPicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      activeSeason === season.id ? 'bg-gray-50' : ''
                    }`}
                    style={{ color: brandColors.navyDeep }}
                  >
                    <span>{season.label}</span>
                    {season.current && (
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
                      >
                        Current
                      </span>
                    )}
                    {season.archived && (
                      <Archive className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            <span className="text-sm font-semibold hidden sm:inline" style={{ color: brandColors.navyDeep }}>
              TOP 100 OS
            </span>
          </div>
        </div>
      </div>

      {/* Active Framework */}
      {ActiveComponent && <ActiveComponent />}

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1e3a5a] to-[#2a4a6a] rounded-2xl p-10 text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Participate?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Nominate outstanding aerospace & aviation professionals, cast your votes, 
              or claim your profile if you've been nominated.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Passport')}>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto"
                  style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Arena')}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                >
                  View Current Standings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}