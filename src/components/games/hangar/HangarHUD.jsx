import { useState } from 'react';
import { useGame } from '../GameContext';
import { motion } from 'framer-motion';
import { User, Trophy, Star, MapPin, Package } from 'lucide-react';
import HangarMiniMap from './HangarMiniMap';
import InventoryPanel from './InventoryPanel';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const areaNames = {
  central_atrium: 'Central Holographic Atrium',
  observation_deck: 'Observation Deck',
  airside_exhibit: 'Airside Exhibit Wing',
  space_systems_north: 'Space Systems Exhibit',
  space_systems_south: 'Space Systems Exhibit',
  space_systems_east: 'Space Systems Exhibit',
  circulation_hallway: 'Primary Circulation Hallway',
  hall_of_fame: 'TOP 100 Hall of Fame',
  gallery_hall: 'Gallery Hall',
  archive_vault: 'Archive Vault',
  legends_ring: '360° Legends Array',
};

const rankColors = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  BlackBox: '#1a1a2e',
  Platinum: '#e5e4e2',
};

export default function HangarHUD({ currentArea, nearbyInteractable, onShowHelp }) {
  const { player, artifacts, badges } = useGame();
  const [showInventory, setShowInventory] = useState(false);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-24 flex justify-between items-start">
          {/* Player Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/60 backdrop-blur-sm rounded-xl p-4 pointer-events-auto"
            style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center relative"
                style={{ background: player?.avatar_config?.color || brandColors.skyBlue }}
              >
                <User className="w-6 h-6 text-white" />
                {/* Rank indicator */}
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ 
                    background: rankColors[player?.prestige_rank] || rankColors.Bronze,
                    color: player?.prestige_rank === 'BlackBox' ? 'white' : 'black'
                  }}
                >
                  {player?.prestige_rank?.charAt(0) || 'B'}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {player?.display_name || 'Pilot'}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: rankColors[player?.prestige_rank] || brandColors.goldPrestige }}>
                    {player?.prestige_rank || 'Bronze'}
                  </span>
                  <span className="text-white/50">•</span>
                  <span className="text-white/70 flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color: brandColors.goldPrestige }} />
                    {player?.insight_points || 0} IP
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((player?.insight_points || 0) % 500) / 5, 100)}%` }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
              />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <button 
              onClick={() => setShowInventory(true)}
              className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 pointer-events-auto hover:bg-black/80 transition-colors"
              style={{ border: `1px solid ${brandColors.skyBlue}40` }}
            >
              <Package className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
              <span className="text-white font-medium">{artifacts.length}</span>
            </button>
            <div 
              className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 pointer-events-auto"
              style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
            >
              <Trophy className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span className="text-white font-medium">{badges.length}</span>
            </div>
          </motion.div>
        </div>

        {/* Current Area */}
        <motion.div
          key={currentArea}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
        >
          <div 
            className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3"
            style={{ border: `1px solid ${brandColors.goldPrestige}60` }}
          >
            <MapPin className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            <span 
              className="text-white font-medium"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {areaNames[currentArea] || currentArea}
            </span>
          </div>
        </motion.div>

        {/* Controls Help */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-4">
            <span className="text-white/60 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="text-white/40">WASD</span> Move
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/60 text-sm">
              <span className="text-white/40">X</span> Interact
            </span>
            <span className="text-white/30">|</span>
            <span className="text-white/60 text-sm">
              <span className="text-white/40">I</span> Inventory
            </span>
          </div>
        </div>

        {/* Mini Map */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <HangarMiniMap 
            currentArea={currentArea} 
            unlockedAreas={player?.hangar_unlocked_areas || ['main_hall']}
          />
        </div>

        {/* Objectives/Quests indicator */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-32 right-4 pointer-events-auto"
        >
          <div 
            className="bg-black/60 backdrop-blur-sm rounded-xl p-3 max-w-xs"
            style={{ border: `1px solid ${brandColors.navyDeep}40` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60 uppercase tracking-wider">Current Objective</span>
            </div>
            <p className="text-white text-sm">
              Explore The Hangar and discover all 11 zones
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
              <span>{player?.hangar_unlocked_areas?.length || 1}/11 discovered</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Inventory Panel */}
      <InventoryPanel 
        isOpen={showInventory} 
        onClose={() => setShowInventory(false)} 
      />
    </>
  );
}