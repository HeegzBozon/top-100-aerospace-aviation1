import React, { useState, useEffect } from 'react';
import { IdeaPairwiseVote } from '@/entities/IdeaPairwiseVote';
import { awardStardust } from '@/functions/awardStardust';
import { Zap, ThumbsUp, Lightbulb } from 'lucide-react';

export default function PairwiseIdeaVoting({ ideas, currentUser, onVoteComplete }) {
  const [currentPair, setCurrentPair] = useState(null);
  const [availableIdeas, setAvailableIdeas] = useState([]);
  const [votingHistory, setVotingHistory] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ideas.length >= 2) {
      setAvailableIdeas([...ideas]);
      generateNewPair([...ideas]);
    }
  }, [ideas]);

  const generateNewPair = (available) => {
    if (available.length < 2) {
      setAvailableIdeas([...ideas]);
      available = [...ideas];
      if (available.length < 2) {
        setCurrentPair(null);
        return;
      }
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const pair = [shuffled[0], shuffled[1]];
    const pairKey = [pair[0].id, pair[1].id].sort().join('-');
    
    if (votingHistory.has(pairKey)) {
      const remaining = available.filter(i => !pair.includes(i));
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
      await IdeaPairwiseVote.create({
        voter_email: currentUser.email,
        winner_idea_id: winner.id,
        loser_idea_id: loser.id,
      });

      await awardStardust({
        user_email: currentUser.email,
        action_type: 'idea_pairwise_vote'
      });

      const pairKey = [winner.id, loser.id].sort().join('-');
      setVotingHistory(prev => new Set([...prev, pairKey]));

      onVoteComplete({ stardust_earned: 1 });
      generateNewPair(availableIdeas);

    } catch (error) {
      console.error('Error submitting idea vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentPair) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Not enough ideas to compare, or you've seen them all!</p>
      </div>
    );
  }

  const [idea1, idea2] = currentPair;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Which idea is more valuable?</h2>
        <p className="text-gray-600">Choose the feature or enhancement you'd rather see first.</p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mb-8">
        {[idea1, idea2].map((idea, index) => (
          <button
            key={idea.id}
            onClick={() => handleVote(idea, index === 0 ? idea2 : idea1)}
            disabled={isSubmitting}
            className="group w-full md:w-96 p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col"
          >
            <div className="flex-grow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                 <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">{idea.subject}</h3>
              <p className="text-gray-600 text-sm text-left line-clamp-4">{idea.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                <span>Votes: {idea.direct_vote_count || 0}</span>
                <span>WSJF: {idea.wsjf_score || 'N/A'}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p className="flex items-center justify-center gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          Each vote earns you 1 Stardust.
        </p>
      </div>
    </div>
  );
}