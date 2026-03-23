import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { GamePlayer } from '@/entities/GamePlayer';
import { GameArtifact } from '@/entities/GameArtifact';
import { GameBadge } from '@/entities/GameBadge';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlayerData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Load all data in a single parallel batch to minimize API calls
      const [players, playerArtifacts, playerBadges] = await Promise.all([
        GamePlayer.filter({ user_email: currentUser.email }),
        GameArtifact.filter({ owner_email: currentUser.email }),
        GameBadge.filter({ owner_email: currentUser.email })
      ]);

      let playerProfile = players[0];

      if (!playerProfile) {
        playerProfile = await GamePlayer.create({
          user_email: currentUser.email,
          display_name: currentUser.full_name || 'Pilot',
          avatar_config: { color: '#4a90b8', style: 'default' },
          hangar_unlocked_areas: ['main_hall'],
          intellectual_property: 0,
          equity_points: 0,
          prestige_rank: 'Bronze'
        });
      }
      
      setPlayer(playerProfile);
      setArtifacts(playerArtifacts);
      setBadges(playerBadges);

    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  const updatePlayer = async (updates) => {
    if (!player) return;
    const updated = await GamePlayer.update(player.id, updates);
    setPlayer({ ...player, ...updates });
    return updated;
  };

  const addArtifact = async (artifactData) => {
    if (!user) return;
    const newArtifact = await GameArtifact.create({
      ...artifactData,
      owner_email: user.email,
      earned_date: new Date().toISOString()
    });
    setArtifacts([...artifacts, newArtifact]);
    return newArtifact;
  };

  const addBadge = async (badgeData) => {
    if (!user) return;
    const newBadge = await GameBadge.create({
      ...badgeData,
      owner_email: user.email,
      earned_date: new Date().toISOString()
    });
    setBadges([...badges, newBadge]);
    return newBadge;
  };

  const awardInsightPoints = async (points, isEquity = false) => {
    if (!player) return;

    const field = isEquity ? 'equity_points' : 'intellectual_property';
    const currentValue = player[field] || player.insight_points || 0; // fallback to legacy field
    const newTotal = currentValue + points;
    await updatePlayer({ [field]: newTotal });

    // Check for rank upgrades based on combined IP + EP
    const totalPoints = (player.intellectual_property || player.insight_points || 0) + (player.equity_points || 0);
    let newRank = player.prestige_rank;
    if (totalPoints >= 10000) newRank = 'Platinum';
    else if (totalPoints >= 5000) newRank = 'BlackBox';
    else if (totalPoints >= 2000) newRank = 'Gold';
    else if (totalPoints >= 500) newRank = 'Silver';

    if (newRank !== player.prestige_rank) {
      await updatePlayer({ prestige_rank: newRank });
    }

    return newTotal;
  };

  const awardEquityPoints = async (points) => {
    return awardInsightPoints(points, true);
  };

  const value = {
    user,
    player,
    artifacts,
    badges,
    loading,
    updatePlayer,
    addArtifact,
    addBadge,
    awardInsightPoints,
    awardEquityPoints,
    refreshData: loadPlayerData
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}