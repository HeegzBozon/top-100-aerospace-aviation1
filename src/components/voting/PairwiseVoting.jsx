import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitPairwiseVote } from '@/functions/submitPairwiseVote';
import { awardStardust } from '@/functions/awardStardust';
import { progressQuest } from '@/functions/progressQuest';
import NomineeCard from './NomineeCard';
import { Loader2, Zap, CheckCircle, Info, Target, TrendingUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export default function PairwiseVoting({ nominees = [], season, currentUser, onVoteSubmitted, sessionComplete }) {
  const [pairs, setPairs] = useState([]); // New state for all generated pairs
  const [currentIndex, setCurrentIndex] = useState(0); // New state to track current pair index
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [votingFor, setVotingFor] = useState(null); // Track which nominee is being voted for
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const generatePairs = useCallback((nomineeList) => {
    const pairs = [];
    for (let i = 0; i < nomineeList.length; i++) {
      for (let j = i + 1; j < nomineeList.length; j++) {
        pairs.push([nomineeList[i], nomineeList[j]]);
      }
    }
    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
  }, []);

  useEffect(() => {
    if (nominees.length >= 2) {
      setIsLoading(true);
      const allPairs = generatePairs(nominees);
      setPairs(allPairs); // Set all generated pairs
      setCurrentIndex(0); // Start from the first pair
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setPairs([]); // No pairs if less than 2 nominees
      setCurrentIndex(0);
    }
  }, [nominees, generatePairs]);

  const selectNewPair = useCallback(() => {
    setCurrentIndex(prevIndex => prevIndex + 1); // Simply move to the next index
  }, []); // Dependency removed as it uses functional update of state

  const handleVote = async (winner, loser) => {
    if (isVoting || sessionComplete) return;

    setIsVoting(true);
    setVotingFor(winner.id);

    try {
      // First, submit the critical vote and wait for it to complete.
      const voteResult = await submitPairwiseVote({
        winner_nominee_id: winner.id,
        loser_nominee_id: loser.id,
        season_id: season.id,
      });

      // Check if the main vote submission was successful before proceeding.
      if (!voteResult.data || !voteResult.data.success) {
        throw new Error(voteResult.data?.error || "Vote submission failed on the backend.");
      }

      // After the vote is successfully recorded, fire off the reward functions.
      // These can still run in parallel with each other.
      const stardustPromise = awardStardust({ action_type: 'vote' });
      const questPromise = progressQuest({ action: 'pairwise_vote' });
      
      // Wait for reward functions to complete, but don't block the UI flow.
      Promise.all([stardustPromise, questPromise]).catch(err => {
        // Log reward errors silently without disturbing the user
        console.error("Error processing vote rewards:", err);
      });
      
      // Visual feedback and transition after success
      setShowSuccess(true);
      setTimeout(() => {
          selectNewPair();
          setShowSuccess(false);
          setVotingFor(null);
          setIsVoting(false); // Unlock voting only after success
          onVoteSubmitted?.();
      }, 600); // Give user time to see success checkmark

    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: error.message || "Your vote could not be recorded. Please try again.", // Show error message from backend if available
      });
      // Unlock voting on failure so user can retry
      setIsVoting(false);
      setVotingFor(null);
    }
  };

  const cardVariants = {
    // Variants for Nominee Cards (used with custom props)
    enter: ({ direction }) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: ({ isSelected, isOtherSelected }) => ({
      x: 0,
      opacity: 1,
      scale: isSelected ? 1.05 : (isOtherSelected ? 0.95 : 1), // Scale up if selected, slightly down if other is selected
      transition: { type: 'spring', stiffness: 300, damping: 30 },
      zIndex: isSelected ? 10 : 1, // Bring selected card to front
      boxShadow: isSelected ? "0px 0px 30px rgba(76, 175, 80, 0.5)" : (isOtherSelected ? "0px 0px 15px rgba(244, 67, 54, 0.3)" : "none"),
    }),
    exit: ({ direction }) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.8,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    }),
    // General variants for other animated components (like "session complete" or "no more pairs")
    initial: { scale: 0.9, opacity: 0, y: 20 },
    in: { scale: 1, opacity: 1, y: 0 },
    out: { scale: 0.9, opacity: 0, y: -20 },
  };

  const transition = { type: 'spring', stiffness: 300, damping: 30 };

  // Early exit for initial loading or insufficient nominees
  if (isLoading) {
    return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]"/></div>;
  }

  if (nominees.length < 2) {
    return <div className="h-96 flex items-center justify-center text-[var(--text)]">Not enough nominees to start voting.</div>;
  }

  const currentPair = pairs[currentIndex];
  const [nomineeA, nomineeB] = currentPair || [null, null];

  // Progress calculations
  const totalPairs = pairs.length;
  const votedCount = currentIndex;
  const progressPercent = totalPairs > 0 ? (votedCount / totalPairs) * 100 : 0;
  
  // Level system (every 50 votes = 1 level)
  const currentLevel = Math.floor(votedCount / 50) + 1;
  const votesInCurrentLevel = votedCount % 50;
  const nextLevelAt = currentLevel * 50;
  const levelProgress = (votesInCurrentLevel / 50) * 100;

  return (
    <div className="relative h-auto min-h-[400px]">
      {/* Header with Info */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[var(--text)]">Perception</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Learn More</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Perception (Pairwise Voting)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm text-[var(--text)]">
              <p>
                Pairwise voting measures <strong>immediate perception</strong>.
              </p>
              <p>
                When voters compare two nominees side-by-side, they choose the one who feels stronger in that moment.
              </p>
              <p className="font-semibold">This reveals:</p>
              <ul className="space-y-2 ml-4">
                <li><strong>Instinctive preference</strong> — who stands out at first glance</li>
                <li><strong>Snapshot judgment</strong> — how nominees compare in direct competition</li>
                <li><strong>Community intuition</strong> — perceived impact, leadership, and momentum</li>
              </ul>
              <p>
                Perception captures the industry's <strong>real-time pulse</strong>.
              </p>
              <p>
                It's fast, intuitive, and reflects how nominees are seen in motion.
              </p>
              <div className="pt-4 mt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted)] italic">
                  Together, Perception and Reputation create a balanced, data-driven view of nominee standing — 
                  blending the community's instincts with its evaluated respect.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Bar with Leveling */}
      {totalPairs > 0 && !sessionComplete && (
        <div className="mb-6 px-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
            {/* Level Badge and Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] rounded-full px-3 py-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">Level {currentLevel}</span>
                </div>
                <span className="text-sm text-[var(--muted)]">
                  {votesInCurrentLevel}/50 votes this level
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--muted)]">Total Progress</div>
                <div className="text-sm font-bold text-[var(--text)]">
                  {votedCount.toLocaleString()} / {totalPairs.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Next level at {nextLevelAt} votes</span>
                <span>{50 - votesInCurrentLevel} to go</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>

            {/* Milestone Badge */}
            {votedCount > 0 && votedCount % 100 === 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-[var(--accent)]"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Milestone: {votedCount} votes! 🎯</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Success overlay (always on top, separate AnimatePresence) */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 bg-[var(--accent)]/30 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl"
          >
            <CheckCircle className="w-24 h-24 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content animation */}
      <AnimatePresence mode="wait">
        {sessionComplete ? (
          <motion.div
            key="complete"
            variants={cardVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={transition}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-6">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Great Session!</h2>
            <p className="text-[var(--muted)] mt-2">Calculating your results...</p>
          </motion.div>
        ) : nomineeA && nomineeB ? (
          <div key="voting-pair-container" className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 h-full relative">
            <motion.div
              key={`${currentIndex}-a`} // Unique key per card per pair
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={{ direction: -1, isSelected: votingFor === nomineeA.id, isOtherSelected: votingFor === nomineeB.id }}
              transition={transition}
              className="w-full md:w-1/2"
            >
              <NomineeCard
                nominee={nomineeA}
                onVote={() => handleVote(nomineeA, nomineeB)}
                isVoting={isVoting && votingFor === nomineeA.id}
                isDisabled={isVoting}
              />
            </motion.div>
            
            <div className="text-2xl font-bold text-[var(--muted)] my-4 md:my-0">VS</div>

            <motion.div
              key={`${currentIndex}-b`} // Unique key per card per pair
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={{ direction: 1, isSelected: votingFor === nomineeB.id, isOtherSelected: votingFor === nomineeA.id }}
              transition={transition}
              className="w-full md:w-1/2"
            >
              <NomineeCard
                nominee={nomineeB}
                onVote={() => handleVote(nomineeB, nomineeA)}
                isVoting={isVoting && votingFor === nomineeB.id}
                isDisabled={isVoting}
              />
            </motion.div>
          </div>
        ) : (currentIndex >= pairs.length && pairs.length > 0) ? ( // All pairs seen
          <motion.div
            key="no-more-pairs"
            variants={cardVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={transition}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)]">You've seen all pairs!</h2>
            <p className="text-[var(--muted)] mt-2">Great job voting. Check back later for more nominees.</p>
          </motion.div>
        ) : ( // Fallback loading state (e.g., if a pair isn't immediately available after transition)
          <motion.div
            key="transition-loading"
            variants={cardVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={transition}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}