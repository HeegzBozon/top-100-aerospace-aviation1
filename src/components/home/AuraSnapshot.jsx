import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Star, Shield } from 'lucide-react';
import { User } from '@/entities/User';
import { Skeleton } from '@/components/ui/skeleton';
// Removed the updateUserScores function import as it's no longer needed here.

export default function AuraSnapshot() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simplified the logic to only fetch and display the user's current data.
        // Score updates should be handled by functions that directly cause a score change,
        // not on every view of this component.
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("AuraSnapshot: Failed to fetch user", error);
        // Handle case where user is not logged in, user will be null
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Calculate progress for the circular bar
  // Assuming max Aura score is 1000 for progress calculation
  const auraProgress = user ? ((user.aura_score || 0) / 1000) * 100 : 0;

  if (loading) {
    return <AuraSnapshotSkeleton />;
  }

  // Only render for admins
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-[var(--glass)] border border-white/10 shadow-xl rounded-2xl p-6 text-center flex flex-col items-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-current text-white/10"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-current text-[var(--accent)] transition-all duration-500"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${auraProgress}, 100`}
            strokeLinecap="round"
            transform="rotate(90 18 18)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">{user?.aura_score || 0}</div>
          <div className="text-sm text-[var(--muted)]">Aura</div>
        </div>
      </div>
      
      <p className="text-sm text-[var(--muted)] mb-4">
        Your combined score. Tap to see your full profile.
      </p>

      <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-[var(--muted)]"><Sparkles className="w-4 h-4 text-[var(--accent-2)]" /> Stardust</span>
          <span className="font-semibold">{user?.stardust_points || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-[var(--muted)]"><Shield className="w-4 h-4 text-[var(--accent-2)]" /> Clout</span>
          <span className="font-semibold">{user?.clout || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-[var(--muted)]"><Star className="w-4 h-4 text-[var(--accent-2)]" /> Star Power</span>
          <span className="font-semibold">{user?.star_power || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader component
const AuraSnapshotSkeleton = () => (
  <div className="bg-[var(--glass)] border border-white/10 shadow-xl rounded-2xl p-6 text-center flex flex-col items-center">
    <div className="relative w-32 h-32 mb-4">
      <Skeleton className="w-full h-full rounded-full bg-white/10" />
    </div>
    <Skeleton className="h-4 w-48 mb-4 bg-white/10" />
    <div className="w-full space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-4 w-12 bg-white/10" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20 bg-white/10" />
        <Skeleton className="h-4 w-10 bg-white/10" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-4 w-12 bg-white/10" />
      </div>
    </div>
  </div>
);