import React, { useState, useEffect } from 'react';
import { SubmissionHub } from '@/components/epics/06-nomination-engine/nominations';
import { PairwiseVoting } from '@/components/epics/06-nomination-engine/voting';
import { RankedChoiceVoting } from '@/components/epics/06-nomination-engine/voting';
import { Season } from '@/entities/Season';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Eye, Trophy, PlusSquare } from 'lucide-react';

export default function NominationHub({ user, urlParams }) {
  const [activeMode, setActiveMode] = useState('pairwise'); // 'pairwise', 'ranked', or 'nominate'
  const [activeSeason, setActiveSeason] = useState(null);
  const [votingNominees, setVotingNominees] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const seasons = await Season.list('-created_date');
      const currentSeason = seasons.find(s => s.status === 'active') || seasons[0];
      setActiveSeason(currentSeason);

      if (currentSeason) {
        const activeNominees = await Nominee.filter({ season_id: currentSeason.id, status: 'active' }, '-created_date');
        setVotingNominees(activeNominees);
      }
    };
    loadData();
  }, []);

  // Check URL params to set active mode
  useEffect(() => {
    if (urlParams) {
      const subtab = urlParams.get('subtab');
      if (subtab === 'vote' || subtab === 'pairwise') {
        setActiveMode('pairwise');
      } else if (subtab === 'ranked') {
        setActiveMode('ranked');
      } else if (subtab === 'nominate') {
        setActiveMode('nominate');
      }
    }
  }, [urlParams]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="bg-[var(--card)]/60 backdrop-blur-sm rounded-2xl p-1.5 sm:p-2 border border-[var(--border)] inline-flex flex-wrap gap-1">
          <Button
            variant={activeMode === 'pairwise' ? 'default' : 'ghost'}
            onClick={() => setActiveMode('pairwise')}
            className="rounded-xl gap-2"
          >
            <Eye className="w-4 h-4" />
            Perception
          </Button>
          <Button
            variant={activeMode === 'ranked' ? 'default' : 'ghost'}
            onClick={() => setActiveMode('ranked')}
            className="rounded-xl gap-2"
          >
            <Trophy className="w-4 h-4" />
            Reputation
          </Button>
          <Button
            variant={activeMode === 'nominate' ? 'default' : 'ghost'}
            onClick={() => setActiveMode('nominate')}
            className="rounded-xl gap-2"
          >
            <PlusSquare className="w-4 h-4" />
            Submit Nominations
          </Button>
        </div>
      </div>

      {activeMode === 'pairwise' ? (
        <PairwiseVoting
          nominees={votingNominees}
          season={activeSeason}
          currentUser={user}
        />
      ) : activeMode === 'ranked' ? (
        <RankedChoiceVoting
          nominees={votingNominees}
          season={activeSeason}
          currentUser={user}
        />
      ) : (
        <SubmissionHub />
      )}
    </div>
  );
}