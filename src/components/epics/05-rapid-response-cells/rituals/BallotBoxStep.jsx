
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

import { PairwiseVoting } from '@/components/epics/06-nomination-engine/voting';
import { Nominee } from '@/entities/Nominee';
import { Season } from '@/entities/Season';

export default function BallotBoxStep({ onVotingComplete, user }) {
  const [nominees, setNominees] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votesThisSession, setVotesThisSession] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { toast } = useToast();

  const TARGET_VOTES = 10; // Goal for a good voting session

  useEffect(() => {
    const loadData = async () => {
      try {
        const [seasons] = await Promise.all([
          Season.list('-created_date'),
        ]);

        const currentSeason = seasons.find(s => s.status === 'active');
        setActiveSeason(currentSeason);
        
        if (currentSeason) {
          const allNominees = await Nominee.filter({ 
            season_id: currentSeason.id, 
            status: { $in: ['active', 'approved'] } 
          });
          setNominees(allNominees);
        } else {
          toast({
            variant: "destructive",
            title: "Voting Closed",
            description: "There is no active voting season right now.",
          });
        }
      } catch (error) {
        console.error("Failed to load voting data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleVoteSubmitted = () => {
    const newCount = votesThisSession + 1;
    setVotesThisSession(newCount);
    
    if (newCount >= TARGET_VOTES && !sessionComplete) {
      setSessionComplete(true);
      // Small delay before triggering completion
      setTimeout(() => {
        onVotingComplete?.({
          votesSubmitted: newCount,
          mode: 'pairwise',
          completed: true
        });
      }, 1500);
    }
  };

  const handleFinishEarly = () => {
    setSessionComplete(true);
    onVotingComplete?.({
      votesSubmitted: votesThisSession,
      mode: 'pairwise',
      completed: true
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
        <p className="text-[var(--muted)]">Loading nominees...</p>
      </div>
    );
  }

  if (!activeSeason || nominees.length < 2) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
        <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No Active Voting</h3>
        <p className="text-[var(--muted)]">
          {!activeSeason ? "There is no active voting season right now." : "Not enough nominees to start voting."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Vote Counter */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
          <span className="text-sm text-[var(--muted)]">
            {votesThisSession} votes this session
          </span>
        </div>
      </div>

      {/* Voting Interface - This is the key part */}
      <AnimatePresence mode="wait">
        <motion.div
          key="pairwise-voting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PairwiseVoting
            nominees={nominees}
            season={activeSeason}
            currentUser={user}
            onVoteSubmitted={handleVoteSubmitted}
            sessionComplete={sessionComplete}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
