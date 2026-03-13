import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Trophy, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { RankedChoiceVoting } from '@/components/epics/06-nomination-engine/voting';
import { Nominee } from '@/entities/Nominee';
import { Season } from '@/entities/Season';
import { User } from '@/entities/User';

export default function RankedChoice() {
  const [nominees, setNominees] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ballotSubmitted, setBallotSubmitted] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [user, seasons] = await Promise.all([
          User.me(),
          Season.list('-created_date'),
        ]);
        setCurrentUser(user);

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

  const handleBallotComplete = (results) => {
    setBallotSubmitted(true);
    toast({
      title: "Ballot Submitted!",
      description: `Your ranked choices for ${results.nominees_ranked || 0} nominees have been recorded.`,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No Active Voting</h3>
          <p className="text-[var(--muted)] mb-6">
            {!activeSeason ? "There is no active voting season right now." : "Not enough nominees to start voting."}
          </p>
          <Link to={createPageUrl('Arena')}>
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Arena
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)] rounded-full border border-[var(--border)] mb-4"
          >
            <List className="w-5 h-5 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text)]">Ranked Choice Voting</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-[var(--text)] mb-3"
          >
            Rank Your Favorites
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--muted)] text-lg mb-6"
          >
            Drag and drop to create your personal ranked ballot of nominees.
          </motion.p>

          {ballotSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <Badge className="px-4 py-2 bg-green-500 hover:bg-green-500">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Ballot Submitted!
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Link to={createPageUrl('Arena')}>
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Arena
            </Button>
          </Link>
        </div>

        {/* Voting Interface */}
        <AnimatePresence mode="wait">
          <motion.div
            key="ranked-voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RankedChoiceVoting
              nominees={nominees}
              season={activeSeason}
              currentUser={currentUser}
              onVoteComplete={handleBallotComplete}
              disabled={ballotSubmitted}
            />
          </motion.div>
        </AnimatePresence>

        {/* Success Actions */}
        {ballotSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <div className="space-y-4">
              <p className="text-[var(--muted)]">
                Want to do more voting? Try head-to-head comparisons!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to={createPageUrl('VotingWizard')}>
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Head-to-Head Voting
                  </Button>
                </Link>
                <Link to={createPageUrl('Arena')}>
                  <Button variant="outline" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    View Standings
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}