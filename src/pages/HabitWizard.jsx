
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import BallotBoxStep from '@/components/rituals/BallotBoxStep';

export default function HabitWizard() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        // User not logged in, they will be prompted by the login button in the layout
        console.error('Failed to load user:', error);
      }
    };
    
    loadUser();
  }, []);

  const handleVoteComplete = () => {
    // When voting is done, navigate to the Arena
    navigate(createPageUrl('Arena'));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Simplified Header - Hidden on mobile */}
      <div className="max-w-2xl mx-auto mb-4 sm:mb-8 text-center hidden sm:block">
        <h2 className="text-3xl font-bold text-[var(--text)]">
          Cast Your Vote
        </h2>
      </div>

      {/* Voting Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <BallotBoxStep
          onComplete={handleVoteComplete}
        />
      </motion.div>
    </div>
  );
}
