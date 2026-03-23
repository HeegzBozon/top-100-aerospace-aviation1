import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, SkipForward, BarChart, Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { getStandingsData } from '@/functions/getStandingsData';
import { Season } from '@/entities/Season';

export default function ReviewStandingsStep({ onComplete, onBack }) {
  const [subStep, setSubStep] = useState('spotlights'); // 'spotlights' or 'reveal'
  const [standingsData, setStandingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    loadStandingsData();
  }, []);

  const loadStandingsData = async () => {
    try {
      const seasons = await Season.filter({ status: 'active' });
      if (seasons.length > 0) {
        setActiveSeason(seasons[0]);
        
        const { data } = await getStandingsData({
          season: seasons[0].id,
          sort: 'aura',
          dir: 'desc',
          page: 1,
          limit: 10
        });
        
        if (data && !data.error) {
          setStandingsData(data);
        }
      }
    } catch (error) {
      console.error('Failed to load standings data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-[var(--muted)]">Loading current standings...</p>
      </div>
    );
  }

  if (subStep === 'spotlights') {
    const topThree = standingsData?.standings?.rows?.slice(0, 3) || [];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl mb-6">
            <Eye className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Review Spotlights
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            Here are today's top performers and rising stars making waves in the community.
          </p>
          
          {topThree.length > 0 ? (
            <div className="space-y-4 mb-8">
              {topThree.map((nominee, index) => {
                const icons = [Trophy, Medal, Award];
                const Icon = icons[index] || Award;
                const colors = [
                  'from-yellow-400 to-amber-500',
                  'from-gray-400 to-gray-500', 
                  'from-amber-600 to-orange-500'
                ];
                
                return (
                  <motion.div
                    key={nominee.nomineeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[var(--card)] p-4 rounded-lg flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${colors[index]} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-[var(--text)]">{nominee.nomineeName}</h3>
                      <p className="text-sm text-[var(--muted)]">{nominee.title || 'Rising Star'}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--accent)]">{Math.round(nominee.aura)}</div>
                      <div className="text-xs text-[var(--muted)]">Aura</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--card)] p-6 rounded-lg mb-8 text-[var(--muted)]">
              No nominees found in the current season.
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setSubStep('reveal')}>
              <SkipForward className="w-4 h-4 mr-2" />
              Skip to Full Reveal
            </Button>
            <Button onClick={() => setSubStep('reveal')} className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
              Next: Overall Standings
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (subStep === 'reveal') {
    const allNominees = standingsData?.standings?.rows || [];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl mb-6">
            <BarChart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
            Overall Reveal
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            Here's the full picture of the current standings. Your votes are shaping the future!
          </p>
          
          {allNominees.length > 0 ? (
            <div className="bg-[var(--card)] rounded-lg mb-8 overflow-hidden max-h-80 overflow-y-auto">
              {allNominees.map((nominee, index) => (
                <motion.div
                  key={nominee.nomineeId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 border-b border-[var(--border)] hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {nominee.rank}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-[var(--text)]">{nominee.nomineeName}</div>
                      {nominee.title && (
                        <div className="text-xs text-[var(--muted)]">{nominee.title}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--accent)]">{Math.round(nominee.aura)}</div>
                    <div className="text-xs text-[var(--muted)]">Aura</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card)] p-6 rounded-lg mb-8 text-[var(--muted)]">
              No standings data available for the current season.
            </div>
          )}
          
          <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <TrendingUp className="w-5 h-5 mr-2" />
            Continue to Hype Squad
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}