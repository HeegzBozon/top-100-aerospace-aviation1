import React, { useState, useEffect } from "react";
import { User } from '@/entities/User';
import moment from 'moment';
import PwaInstallGuide from "@/components/PwaInstallGuide";
import { useWheelControls } from "@/components/ContinuumWheel";

export default function UserSprintOnboarding() {
  const [hasJoinedSprint, setHasJoinedSprint] = useState(false);
  const [sprintEndDate, setSprintEndDate] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const { setControls } = useWheelControls();

  // Set up wheel controls for Home page
  useEffect(() => {
    setControls({
      Home: {
        top: { label: 'Menu', action: () => alert('Quick Menu - Coming Soon!') },
        left: { label: 'Prev', action: () => console.log('Previous action') },
        right: { label: 'Next', action: () => console.log('Next action') },
        bottom: { 
          label: hasJoinedSprint ? 'Leave Sprint' : 'Join Sprint', 
          action: hasJoinedSprint ? handleLeaveSprint : handleJoinSprint 
        },
        center: { label: 'Install', action: () => setShowPwaGuide(true) }
      }
    });
  }, [hasJoinedSprint, setControls]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.sprint_joined_date) {
          setHasJoinedSprint(true);
          const joinDate = moment(currentUser.sprint_joined_date);
          const endDate = joinDate.add(14, 'days');
          setSprintEndDate(endDate);
        } else {
          setHasJoinedSprint(false);
          setSprintEndDate(null);
          setCountdown('');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (sprintEndDate) {
      const interval = setInterval(() => {
        const now = moment();
        const diff = moment.duration(sprintEndDate.diff(now));

        if (diff.asMilliseconds() <= 0) {
          setCountdown('Sprint Ended!');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff.asDays());
          const hours = diff.hours();
          const minutes = diff.minutes();
          const seconds = diff.seconds();
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown('');
    }
  }, [sprintEndDate]);

  const handleJoinSprint = async () => {
    try {
      await User.updateMyUserData({ sprint_joined_date: moment().toISOString() });
      setHasJoinedSprint(true);
      const joinDate = moment();
      const endDate = joinDate.add(14, 'days');
      setSprintEndDate(endDate);
    } catch (error) {
      console.error("Error joining sprint:", error);
    }
  };

  const handleLeaveSprint = async () => {
    try {
      await User.updateMyUserData({ sprint_joined_date: null });
      setHasJoinedSprint(false);
      setSprintEndDate(null);
      setCountdown('');
    } catch (error) {
      console.error("Error leaving sprint:", error);
    }
  };

  const handleInstallPWA = () => {
    setShowPwaGuide(true);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 min-h-screen text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-3xl">🚀</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to the Portal!
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Your hub for all things in the Continuum
            </p>

            {!hasJoinedSprint ? (
              <button
                onClick={handleJoinSprint}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Join Your Sprint Now!
              </button>
            ) : (
              <div>
                <p className="text-white text-lg font-medium mb-2">
                  Sprint Status:
                </p>
                <div className="text-white text-5xl font-extrabold mb-4 animate-pulse">
                  {countdown}
                </div>
                <p className="text-white/70">
                  Keep up the great work!
                </p>
                <button
                  onClick={handleLeaveSprint}
                  className="mt-6 px-5 py-2 bg-white/10 text-white font-semibold rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Leave Sprint
                </button>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Enhance Your Experience
            </h2>
            <p className="text-white/70 mb-6">
              Install our app for quick access and offline capabilities.
            </p>
            <button
              onClick={handleInstallPWA}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
            >
              Install App (PWA)
            </button>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-lg">
            <p className="text-white/60 text-sm">
              💡 Use the Continuum Wheel below to navigate and interact with this page. 
              Try tapping different zones or spinning to explore!
            </p>
          </div>
        </div>
      </div>

      {showPwaGuide && <PwaInstallGuide onClose={() => setShowPwaGuide(false)} />}
    </>
  );
}