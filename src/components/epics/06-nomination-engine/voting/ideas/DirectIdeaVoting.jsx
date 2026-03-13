import React, { useState } from 'react';
import { Feedback } from '@/entities/Feedback';
import { awardStardust } from '@/functions/awardStardust';
import { Zap, ThumbsUp, Lightbulb } from 'lucide-react';

export default function DirectIdeaVoting({ ideas, currentUser, onVoteComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(null);
  const [votedIdeas, setVotedIdeas] = useState([]);

  const handleVote = async (idea) => {
    if (isSubmitting === idea.id || votedIdeas.includes(idea.id)) return;
    setIsSubmitting(idea.id);

    try {
      const updatedVotes = (idea.direct_vote_count || 0) + 1;
      await Feedback.update(idea.id, { direct_vote_count: updatedVotes });
      
      await awardStardust({
        user_email: currentUser.email,
        action_type: 'idea_direct_vote',
      });

      setVotedIdeas(prev => [...prev, idea.id]);
      onVoteComplete({ stardust_earned: 2 });

    } catch (error) {
      console.error('Error submitting direct idea vote:', error);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Your Favorite Ideas</h2>
        <p className="text-gray-600 mb-4">
          Give a thumbs up to the ideas you believe in.
        </p>
         <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-flex">
          <Zap className="w-4 h-4" />
          <span>Each upvote earns you 2 Stardust</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
          >
            <div className="flex-grow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                 <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.subject}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">{idea.description}</p>
              <p className="text-xs text-gray-400">By: {idea.user_email}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-bold text-lg">{idea.direct_vote_count || 0}</span>
              </div>
              <button
                onClick={() => handleVote(idea)}
                disabled={isSubmitting === idea.id || votedIdeas.includes(idea.id)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting === idea.id ? 'Voting...' : votedIdeas.includes(idea.id) ? 'Voted' : 'Upvote'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}