import React, { useState, useEffect } from 'react';
import { BugPairwiseVote } from '@/entities/BugPairwiseVote';
import { awardStardust } from '@/functions/awardStardust';
import { Zap, AlertTriangle, Bug } from 'lucide-react';

export default function PairwiseBugVoting({ bugs, currentUser, onVoteComplete }) {
  const [currentPair, setCurrentPair] = useState(null);
  const [availableBugs, setAvailableBugs] = useState([]);
  const [votingHistory, setVotingHistory] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bugs.length >= 2) {
      setAvailableBugs([...bugs]);
      generateNewPair([...bugs]);
    }
  }, [bugs]);

  const generateNewPair = (available) => {
    if (available.length < 2) {
      setAvailableBugs([...bugs]);
      available = [...bugs];
      if (available.length < 2) {
        setCurrentPair(null);
        return;
      }
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const pair = [shuffled[0], shuffled[1]];
    const pairKey = [pair[0].id, pair[1].id].sort().join('-');
    
    if (votingHistory.has(pairKey)) {
      const remaining = available.filter(b => !pair.includes(b));
      if (remaining.length >= 2) {
        generateNewPair(remaining);
        return;
      }
    }
    
    setCurrentPair(pair);
  };

  const handleVote = async (winner, loser) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await BugPairwiseVote.create({
        voter_email: currentUser.email,
        winner_bug_id: winner.id,
        loser_bug_id: loser.id,
      });

      await awardStardust({
        user_email: currentUser.email,
        action_type: 'bug_pairwise_vote'
      });

      const pairKey = [winner.id, loser.id].sort().join('-');
      setVotingHistory(prev => new Set([...prev, pairKey]));

      onVoteComplete({ stardust_earned: 1 });
      generateNewPair(availableBugs);

    } catch (error) {
      console.error('Error submitting bug vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentPair) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Not enough bugs to compare, or you've seen them all!</p>
      </div>
    );
  }

  const [bug1, bug2] = currentPair;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which bug is more urgent to fix?</h2>
        <p className="text-gray-600">Help prioritize development by comparing bug urgency.</p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mb-8">
        {[bug1, bug2].map((bug, index) => (
          <button
            key={bug.id}
            onClick={() => handleVote(bug, index === 0 ? bug2 : bug1)}
            disabled={isSubmitting}
            className="group w-full md:w-96 p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col"
          >
            <div className="flex-grow">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">{bug.subject}</h3>
              <p className="text-gray-600 text-sm text-left line-clamp-4">{bug.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>Status: {bug.status}</span>
              <span>Votes: {bug.direct_vote_count || 0}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p className="flex items-center justify-center gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          Each vote earns you 1 Stardust and helps prioritize fixes.
        </p>
      </div>
    </div>
  );
}