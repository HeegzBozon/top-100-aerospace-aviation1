import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, Zap, CheckCircle } from 'lucide-react';

import DirectVoting from './DirectVoting';
import PairwiseVoting from './PairwiseVoting';
import RankedChoiceVoting from './RankedChoiceVoting';

const VOTING_MODES = [
  {
    id: 'direct',
    name: 'Direct Vote',
    description: 'Choose your single favorite nominee',
    icon: Vote,
    reward: '+5 Stardust, +1 Clout',
    component: DirectVoting
  },
  {
    id: 'pairwise',
    name: 'Pairwise Battle',
    description: 'Compare nominees head-to-head',
    icon: Zap,
    reward: '+3 Stardust, +1 Clout',
    component: PairwiseVoting
  },
  {
    id: 'ranked',
    name: 'Ranked Choice',
    description: 'Build a ranked ballot of your preferences',
    icon: Users,
    reward: '+8 Stardust, +2 Clout',
    component: RankedChoiceVoting
  }
];

export default function BallotBoxStep({ onComplete, isCompleted }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [votingComplete, setVotingComplete] = useState(isCompleted);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleVotingComplete = () => {
    setVotingComplete(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
  };

  if (votingComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-green-500 mb-4">
            Vote Cast Successfully! 🗳️
          </h2>
          
          <p className="text-[var(--muted)] leading-relaxed">
            Your voice has been heard. Every vote shapes the future of the rankings.
          </p>
        </motion.div>
      </div>
    );
  }

  if (selectedMode) {
    const ModeComponent = selectedMode.component;
    return (
      <div>
        <div className="text-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToModes}
            className="mb-4 text-[var(--muted)] hover:text-[var(--text)]"
          >
            ← Back to Voting Modes
          </Button>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            {selectedMode.name}
          </h2>
          <p className="text-[var(--muted)]">{selectedMode.description}</p>
        </div>
        
        <ModeComponent onComplete={handleVotingComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
          Ballot Box
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          Choose your voting method. Each approach rewards you differently while contributing 
          to the democratic ranking system.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {VOTING_MODES.map((mode) => {
          const IconComponent = mode.icon;
          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => handleModeSelect(mode)}
            >
              <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                    {mode.name}
                  </h3>
                  
                  <p className="text-[var(--muted)] mb-4 leading-relaxed">
                    {mode.description}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className="border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                  >
                    {mode.reward}
                  </Badge>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-[var(--muted)] italic">
          💡 Pro tip: Try different voting methods across sessions to maximize your rewards and influence
        </p>
      </div>
    </div>
  );
}