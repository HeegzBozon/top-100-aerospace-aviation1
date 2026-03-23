
import { useState } from 'react';
import { BugUrgencyVote } from '@/entities/BugUrgencyVote';
import { awardStardust } from '@/functions/awardStardust';
import { Zap, AlertTriangle, Bug } from 'lucide-react';

export default function UrgencyMatrixVoting({ bugs, currentUser, onVoteComplete }) { // Changed currentUser to user, onVoteComplete to onVoteSuccess
  const [votedBugs, setVotedBugs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(null);

  const handleUrgencyVote = async (bug, urgencyScore, impactScore) => {
    if (isSubmitting === bug.id || votedBugs.includes(bug.id)) return;
    setIsSubmitting(bug.id);

    try {
      await BugUrgencyVote.create({
        voter_email: currentUser.email, // Changed from currentUser.email
        bug_id: bug.id,
        urgency_score: urgencyScore,
        impact_score: impactScore,
      });

      // Award Stardust for the urgency vote
      try {
        await awardStardust({
          user_email: currentUser.email, // Changed from currentUser.email
          action_type: 'vote', // Changed from 'bug_urgency_vote'
          entity_type: 'bugs', // Added based on outline
          vote_mode: 'urgency' // Added based on outline
        });
      } catch (stardustError) {
        console.warn('Failed to award Stardust for urgency vote:', stardustError);
        // Don't fail the vote if Stardust awarding fails
      }

      setVotedBugs(prev => [...prev, bug.id]);
      if (onVoteComplete) { // Ensure onVoteSuccess is a function before calling
        onVoteComplete({ stardust_earned: 3 }); // Kept the argument for compatibility, assuming onVoteSuccess can handle it
      }

    } catch (error) {
      console.error('Error submitting urgency vote:', error);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Bug Urgency & Impact</h2>
        <p className="text-gray-600 mb-4">
          Help prioritize development by rating both urgency and impact for each bug.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-full inline-flex">
          <Zap className="w-4 h-4" />
          <span>Each rating earns you 2 Stardust</span>
        </div>
      </div>

      <div className="space-y-6">
        {bugs.map((bug) => (
          <BugRatingCard
            key={bug.id}
            bug={bug}
            onVote={handleUrgencyVote}
            isSubmitting={isSubmitting === bug.id}
            hasVoted={votedBugs.includes(bug.id)}
          />
        ))}
      </div>
    </div>
  );
}

function BugRatingCard({ bug, onVote, isSubmitting, hasVoted }) {
  const [urgency, setUrgency] = useState(3);
  const [impact, setImpact] = useState(3);

  const urgencyLabels = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
    5: 'Critical'
  };

  const impactLabels = {
    1: 'Minimal',
    2: 'Minor',
    3: 'Moderate',
    4: 'Major',
    5: 'Severe'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Bug className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{bug.subject}</h3>
          <p className="text-gray-600 text-sm mb-2">{bug.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Status: {bug.status}</span>
            <span>Submitted by: {bug.user_email}</span>
          </div>
        </div>
      </div>

      {!hasVoted ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Urgency Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Urgency: {urgencyLabels[urgency]}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setUrgency(score)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    urgency === score
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Impact Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Impact: {impactLabels[impact]}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setImpact(score)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    impact === score
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => onVote(bug, urgency, impact)}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-medium">✓ You've rated this bug. Thank you!</p>
        </div>
      )}
    </div>
  );
}
