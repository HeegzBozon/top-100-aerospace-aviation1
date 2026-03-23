import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Sparkles, Calendar, Vote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import VotingModal from '@/components/voting/VotingModal';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  festiveRed: '#c41e3a',
  festiveGreen: '#165b33',
  festiveGold: '#ffd700',
};

export default function NewYearCountdownBar() {
  const [timeLeft, setTimeLeft] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // December 24, 2025 midnight PT (end of voting)
      const targetDate = new Date('2025-12-24T00:00:00-08:00');
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      if (time) {
        setTimeLeft(time);
      } else {
        setIsVisible(false);
      }
    }, 1000);

    setTimeLeft(calculateTimeLeft() || {});

    return () => clearInterval(timer);
  }, []);

  const handleVoteClick = () => {
    if (isLoggedIn) {
      setShowVotingModal(true);
    } else {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    }
  };

  if (!isVisible || !timeLeft.days) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.navyDeep}, ${brandColors.festiveGreen})`,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Animated sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-300"
              style={{
                left: `${(i * 8.33)}%`,
                fontSize: '16px',
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        <div className="relative py-1.5 md:py-3 px-2 md:px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-3">
            {/* Left: Event Title */}
            <div className="flex items-center gap-1.5 md:gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="hidden md:block"
              >
                <PartyPopper className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-bold text-[11px] md:text-base flex items-center justify-center md:justify-start gap-1 md:gap-2">
                  Season 3: The Final Act
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                </h3>
                <p className="text-white/80 text-[9px] md:text-xs">Voting ends Dec 24</p>
              </div>
            </div>

            {/* Center: Countdown */}
            <div className="flex items-center gap-1.5 md:gap-4">
              {['days', 'hours', 'minutes', 'seconds'].map((unit, idx) => (
                <div key={unit} className="text-center">
                  <motion.div
                    key={unit !== 'seconds' ? timeLeft[unit] : undefined}
                    initial={unit !== 'seconds' ? { scale: 1.2, opacity: 0 } : false}
                    animate={unit !== 'seconds' ? { scale: 1, opacity: 1 } : {}}
                    className="bg-white/20 backdrop-blur-sm rounded-md md:rounded-lg px-1.5 md:px-3 py-0.5 md:py-2 border border-white/30"
                  >
                    <div className="text-white font-bold text-sm md:text-2xl tabular-nums leading-tight">
                      {String(timeLeft[unit] || 0).padStart(2, '0')}
                    </div>
                    <div className="text-white/70 text-[8px] md:text-xs uppercase font-medium">
                      {unit.slice(0, 3)}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Right: CTAs */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold text-white border border-white/30 hover:border-white/50 transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap"
                style={{ background: `${brandColors.festiveGold}40` }}
                onClick={() => window.open('https://www.linkedin.com/events/top100womeninaerospace-aviation7405268135823683584/', '_blank')}
              >
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                RSVP
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-bold border transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap"
                style={{ 
                  background: brandColors.goldPrestige,
                  borderColor: brandColors.goldPrestige,
                  color: 'white'
                }}
                onClick={handleVoteClick}
              >
                <Vote className="w-3 h-3 md:w-4 md:h-4" />
                Vote Now
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom festive border */}
        <div className="h-1 flex">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1"
              style={{ background: i % 2 === 0 ? brandColors.festiveGold : brandColors.festiveGreen }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </motion.div>

    {showVotingModal && (
      <VotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
      />
    )}
    </>
  );
}