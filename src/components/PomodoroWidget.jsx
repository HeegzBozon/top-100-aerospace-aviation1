import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { User } from '@/entities/User';
import { awardStardust } from '@/functions/awardStardust';

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

export default function PomodoroWidget() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [notification, setNotification] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in or error loading user
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(BREAK_DURATION);
        if (user) {
          awardStardust({ user_email: user.email, action_type: 'pairwise_vote' })
            .then(() => {
              setNotification('Focus Complete! +2 Stardust earned. Time for a break.');
            })
            .catch(() => {
              setNotification('Focus Complete! Time for a break.');
            });
        } else {
            setNotification('Focus Complete! Time for a break.');
        }
      } else {
        setMode('focus');
        setTimeLeft(FOCUS_DURATION);
        setNotification("Break's over! Ready for another focus session?");
      }
      triggerHaptic(mode === 'focus' ? 'strong' : 'medium');
      setIsActive(false); // Stop the timer after completion
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, timeLeft, mode, user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const triggerHaptic = useCallback((intensity = 'light') => {
    if (!user || !user.haptics_enabled) return;
    if (!('vibrate' in navigator)) return;
    
    const patterns = { 
      light: [50], 
      medium: [100, 50, 100],
      strong: [200, 100, 200]
    };
    navigator.vibrate(patterns[intensity] || patterns.light);
  }, [user]);

  const toggleTimer = useCallback(() => {
    triggerHaptic('light');
    setIsActive(prev => !prev);
  }, [triggerHaptic]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    triggerHaptic('medium');
    setIsActive(false);
    setMode('focus');
    setTimeLeft(FOCUS_DURATION);
    setNotification(null);
  }, [triggerHaptic]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const duration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] bg-[var(--glass)] border border-white/20 rounded-lg p-3 shadow-lg backdrop-blur-md">
          <div className="text-sm font-medium text-[var(--text)]">{notification}</div>
        </div>
      )}

      {/* Timer Widget */}
      <div 
        className="fixed bottom-24 md:bottom-6 right-6 z-[55] flex items-center gap-3 p-2 pr-4 rounded-full shadow-2xl transition-all duration-300 border border-white/20"
        style={{
          background: 'var(--glass)',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={() => console.log('Pomodoro: Widget container clicked')}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  className="stroke-current text-white/10"
                  strokeWidth="2"
              />
              <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  className="stroke-current text-[var(--accent)]"
                  strokeWidth="2"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
              />
          </svg>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleTimer();
            }}
            className="absolute inset-0 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            type="button"
          >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-left">
          <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-xs -mt-1 opacity-70 capitalize">{mode} Session</div>
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetTimer();
          }}
          className="ml-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1 hover:bg-white/10 rounded"
          type="button"
        >
            <RotateCcw className="w-4 h-4"/>
        </button>
      </div>
    </>
  );
}