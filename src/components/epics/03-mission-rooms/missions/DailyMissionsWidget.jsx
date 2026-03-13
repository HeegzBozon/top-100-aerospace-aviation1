import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Zap, Trophy, CheckCircle, Clock, Target, Brain, Rocket, Flame, Award, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import VotingModal from '@/components/epics/06-nomination-engine/voting/VotingModal';
import NominationModal from '@/components/epics/06-nomination-engine/nominations/NominationModal';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

// Calculate current week based on Dec 13 start
const getVotingWeek = () => {
  const startDate = new Date('2025-12-13');
  const now = new Date();
  const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0; // Before start
  if (diff < 3) return 1; // Week 1: Dec 13-15
  if (diff < 10) return 2; // Week 2: Dec 16-22
  if (diff < 12) return 3; // Week 3: Dec 23-24
  return 4; // After Dec 24
};

export default function DailyMissionsWidget() {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showNominationModal, setShowNominationModal] = useState(false);

  // Fetch user and voting stats
  const { data: user } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pairwiseVotes = [], isLoading: loadingPairwise } = useQuery({
    queryKey: ['pairwise-votes', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      const votes = await base44.entities.PairwiseVote.filter({ voter_email: user.email });
      return votes;
    },
    enabled: !!user,
  });

  const { data: rankedVotes = [], isLoading: loadingRanked } = useQuery({
    queryKey: ['ranked-votes', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.RankedVote.filter({ voter_email: user.email });
    },
    enabled: !!user,
  });

  const { data: nominees = [] } = useQuery({
    queryKey: ['user-nominees', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Nominee.filter({ claimed_by_user_email: user.email });
    },
    enabled: !!user,
  });

  const currentWeek = getVotingWeek();
  const votingEnded = true; // Season 3 voting has concluded
  
  // Calculate stats
  const todayVotes = pairwiseVotes.filter(v => {
    const voteDate = new Date(v.created_date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return voteDate === today;
  }).length;
  
  const totalPairwiseVotes = pairwiseVotes.length;
  const hasRankedBallot = rankedVotes.length > 0;
  const isNominee = nominees.length > 0;
  const isPowerVoter = totalPairwiseVotes >= 100;

  const isLoading = loadingPairwise || loadingRanked;

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-[var(--border)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
            🧭 TOP 100 Voting Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (votingEnded) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-[var(--border)] relative overflow-hidden">
        <CardHeader className="relative pb-2 px-3 md:px-6 pt-3 md:pt-6">
          <CardTitle className="flex items-center gap-2 text-xs md:text-sm">
            <Target className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: brandColors.goldPrestige }} />
            🧭 TOP 100 Seasons
          </CardTitle>
        </CardHeader>
        <CardContent className="relative px-3 md:px-6 pb-3 md:pb-6">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* Season 3 Complete */}
            <div className="p-2 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                <CheckCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                <span className="text-[10px] md:text-xs font-semibold text-green-700 uppercase tracking-wide">Complete</span>
              </div>
              <div className="text-xl md:text-3xl mb-1 md:mb-2">🏆</div>
              <h3 className="font-bold text-xs md:text-sm mb-0.5 md:mb-1" style={{ color: brandColors.navyDeep }}>
                Season 3
              </h3>
              <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">
                2025 results are live!
              </p>
              <a 
                href={createPageUrl('Top100Women2025')}
                className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold transition-all hover:scale-105"
                style={{ background: brandColors.goldPrestige, color: 'white' }}
              >
                <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                View
              </a>
            </div>

            {/* Season 4 Nominations Open */}
            <div className="p-2 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                <Rocket className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
                <span className="text-[10px] md:text-xs font-semibold text-blue-700 uppercase tracking-wide">Open Now</span>
              </div>
              <div className="text-xl md:text-3xl mb-1 md:mb-2">🚀</div>
              <h3 className="font-bold text-xs md:text-sm mb-0.5 md:mb-1" style={{ color: brandColors.navyDeep }}>
                Season 4
              </h3>
              <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">
                Nominations open!
              </p>
              <Button
                onClick={() => setShowNominationModal(true)}
                className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 h-auto rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold transition-all hover:scale-105"
                style={{ background: brandColors.skyBlue, color: 'white' }}
              >
                <Target className="w-3 h-3 md:w-3.5 md:h-3.5" />
                Nominate
              </Button>
            </div>
          </div>
        </CardContent>

        {showNominationModal && (
          <NominationModal
            isOpen={showNominationModal}
            onClose={() => setShowNominationModal(false)}
          />
        )}
      </Card>
    );
  }

  const weeklyMissionData = [
    { week: 1, icon: Target, label: 'Signal Calibration', dates: 'Now → Dec 15', pairwise: 25, ranked: 'Start' },
    { week: 2, icon: Rocket, label: 'Momentum Build', dates: 'Dec 16 → Dec 22', pairwise: 50, ranked: 'Complete 1' },
    { week: 3, icon: Flame, label: 'Final Burn', dates: 'Dec 23 → Dec 24', pairwise: 25, ranked: 'Last chance' },
  ];

  const currentWeekData = weeklyMissionData[currentWeek - 1];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-[var(--border)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Target className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              🧭 TOP 100 Voting Missions
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Live Now → Closes Dec 24
            </p>
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {24 - new Date().getDate()} days left
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Action Buttons - Top Position */}
        <div className="flex gap-2 pb-3 border-b border-gray-200">
          <Button 
            onClick={() => setShowNominationModal(true)}
            variant="outline"
            className="flex-1 text-sm font-semibold"
            style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
          >
            Nominate
          </Button>
          <Button 
            onClick={() => setShowVotingModal(true)}
            className="flex-1 text-sm font-semibold"
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            Vote Now
          </Button>
        </div>
        {/* Daily Missions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5" style={{ color: brandColors.skyBlue }} />
            <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-600">Daily Missions</h3>
          </div>

          {/* Daily Signal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-white border border-blue-100 mb-2 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(createPageUrl('VotingHub'))}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-sm">Daily Signal</h4>
                  <button
                    onMouseEnter={() => setShowTooltip('pairwise')}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="relative"
                  >
                    <Info className="w-3 h-3 text-gray-400" />
                    {showTooltip === 'pairwise' && (
                      <div className="absolute left-0 top-5 bg-gray-900 text-white text-xs rounded p-2 w-48 z-10">
                        Fast comparisons that measure perception at scale
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600">Cast 10 Pairwise Votes</p>
                <p className="text-xs text-gray-500 mt-1">Contributes to real-time leaderboard movement</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < todayVotes ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-right">{todayVotes}/10</p>
          </motion.div>

          {/* Daily Reputation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-white border border-purple-100 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(createPageUrl('RankedChoice'))}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-sm">Daily Reputation</h4>
                  <span className="text-xs text-gray-500">(optional, high-impact)</span>
                  <button
                    onMouseEnter={() => setShowTooltip('ranked')}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="relative"
                  >
                    <Info className="w-3 h-3 text-gray-400" />
                    {showTooltip === 'ranked' && (
                      <div className="absolute left-0 top-5 bg-gray-900 text-white text-xs rounded p-2 w-48 z-10">
                        Deeper evaluation that reflects earned reputation
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600">Advance or complete 1 Ranked Ballot</p>
                <p className="text-xs text-gray-500 mt-1 italic">You can save and return anytime</p>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                hasRankedBallot ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {hasRankedBallot ? '✅ Submitted' : '⬜ In Progress'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Missions */}
        {currentWeekData && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-3.5 h-3.5" style={{ color: brandColors.goldPrestige }} />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-600">Weekly Missions</h3>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-white border-2 border-amber-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <currentWeekData.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                <div>
                  <h4 className="font-bold text-sm">WEEK {currentWeekData.week} — {currentWeekData.label}</h4>
                  <p className="text-xs text-gray-500">{currentWeekData.dates}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">• {currentWeekData.pairwise} Pairwise Votes total</span>
                  <span className="font-medium">{totalPairwiseVotes}/{currentWeekData.pairwise}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">• {currentWeekData.ranked} Ranked Ballot</span>
                  <span className="font-medium">{hasRankedBallot ? '✅' : '⬜'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                📌 {currentWeek === 1 ? 'Sets baseline perception model' : currentWeek === 2 ? 'Sharpens accuracy & reduces noise' : 'Voting closes Dec 24. No extensions.'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Power User Missions */}
        {(isPowerVoter || isNominee) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-3.5 h-3.5 text-orange-600" />
              <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-600">Power User Missions</h3>
            </div>

            {isPowerVoter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-white border border-orange-200 mb-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">🏅 Power Voter</h4>
                </div>
                <p className="text-xs text-gray-600 mb-1">Cast 50 more votes</p>
                <p className="text-xs text-gray-500 italic">Helps resolve close statistical ties</p>
              </motion.div>
            )}

            {isNominee && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-white border border-indigo-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-semibold text-sm">🏆 Nominee Steward</h4>
                </div>
                <p className="text-xs text-gray-600 mb-1">Participate as a peer voter</p>
                <p className="text-xs text-gray-500 italic">The TOP 100 is shaped by those inside the arena</p>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>

      {showVotingModal && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
        />
      )}

      {showNominationModal && (
        <NominationModal
          isOpen={showNominationModal}
          onClose={() => setShowNominationModal(false)}
        />
      )}
    </Card>
  );
}