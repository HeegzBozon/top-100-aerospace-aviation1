import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { User } from '@/entities/User';
import { Skeleton } from '@/components/ui/skeleton';
import UserProfileModal from '@/components/UserProfileModal';

export default function VibePipelineCapsule() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("VibePipelineCapsule: Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUserUpdate = () => {
    // Refetch user data when profile is updated
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("VibePipelineCapsule: Failed to fetch user", error);
      }
    };
    fetchUser();
  };

  if (loading) {
    return <VibePipelineSkeleton />;
  }

  // Use aura_score as a proxy for overall health. Let's say a score > 700 is "green".
  const overallHealth = user ? ((user.aura_score || 0) / 1000) * 100 : 0;
  const isAllSystemsGreen = user && (user.aura_score || 0) > 700;
  const vibeText = isAllSystemsGreen ? "All Systems Green" : "Momentum is Building";
  const momentumText = isAllSystemsGreen ? "Momentum is strong" : "Keep up the good work";

  return (
    <>
      <div 
        onClick={() => setShowProfileModal(true)}
        className="
          flex items-center gap-3 p-3 rounded-full 
          bg-[var(--glass)] border border-white/10 shadow-lg
          hover:bg-white/5 transition-all cursor-pointer
        "
      >
        <div 
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            bg-gradient-to-br ${isAllSystemsGreen ? 'from-green-400 to-emerald-500' : 'from-yellow-400 to-orange-500'}
          `}
        >
          {isAllSystemsGreen ? (
            <CheckCircle className="w-5 h-5 text-white/80" />
          ) : (
            <TrendingUp className="w-5 h-5 text-white/80" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm leading-tight">
            Vibe: {vibeText}
          </div>
          <div className="text-xs text-[var(--muted)] leading-tight">
            {momentumText}
          </div>
        </div>
        <div className="font-bold text-lg">
          {Math.round(overallHealth)}%
        </div>
      </div>

      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </>
  );
}

const VibePipelineSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-full bg-[var(--glass)] border border-white/10 shadow-lg">
    <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-3 w-1/2 bg-white/10" />
    </div>
    <Skeleton className="h-6 w-12 rounded-md bg-white/10" />
  </div>
);