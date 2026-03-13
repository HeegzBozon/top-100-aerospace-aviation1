import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from '@/entities/User';
import { BallotBoxStep } from '@/components/epics/05-rapid-response-cells/rituals';
import { AuraRevealStep } from '@/components/epics/05-rapid-response-cells/rituals';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.95 },
};

const pageTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export default function VotingFlow() {
  const [step, setStep] = useState('loading'); // loading, vote, reveal
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionResults, setSessionResults] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setStep('vote');
      } catch (error) {
        console.error("Failed to fetch user for voting flow:", error);
        // Handle not logged in case if necessary
      }
    };
    fetchUser();
  }, []);

  const handleVotingComplete = (results) => {
    setSessionResults(results);
    setStep('reveal');
  };

  const handleAuraRevealComplete = () => {
    // Potentially navigate away or just reset the view
    // For now, let's send them to their passport
    window.location.href = createPageUrl('Passport');
  };

  const renderStep = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
            <p className="mt-4 text-[var(--muted)]">Preparing your ballot...</p>
          </div>
        );
      case 'vote':
        return (
          <motion.div
            key="vote"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <BallotBoxStep onVotingComplete={handleVotingComplete} user={currentUser} />
          </motion.div>
        );
      case 'reveal':
        return (
          <motion.div
            key="reveal"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AuraRevealStep results={sessionResults} user={currentUser} onComplete={handleAuraRevealComplete} />
          </motion.div>
        );
      default:
        return <div>Invalid step. Please <Link to={createPageUrl('Home')} className="underline">return home</Link>.</div>;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderStep()}
    </AnimatePresence>
  );
}