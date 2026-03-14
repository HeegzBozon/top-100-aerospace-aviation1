import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { motion } from 'framer-motion';
import { User, Trophy, Star, MapPin, Layers, Scroll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MissionsPanel from '../missions/MissionsPanel';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const areaNames = {
  entrance: 'Main Entrance',
  campus: 'Space Center Campus',
  hangar_entrance: 'Sky Cadet Hangar',
  stardust_gateway: 'Stardust Gateway - Rocket Garden',
  launch_complex_01a: 'Launch Complex 01A',
  launch_complex_01b: 'Launch Complex 01B',
  assembly_spire: 'Vehicle Assembly Building',
  mythos_theater_1: 'Mythos Theater 1',
  mythos_theater_2: 'Mythos Theater 2',
  aurora_hall: 'Aurora Hall',
};

const rankColors = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  BlackBox: '#1a1a2e',
  Platinum: '#e5e4e2',
};

export default function OutsideHUD({ currentArea }) {
  const { player } = useGame();
  const [showMissions, setShowMissions] = useState(false);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-Left: Player Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 bg-black/70 backdrop-blur-md rounded-2xl p-5 border-2"
          style={{ borderColor: `${brandColors.goldPrestige}60` }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center relative shadow-lg"
              style={{ background: player?.avatar_config?.color || brandColors.skyBlue }}
            >
              <User className="w-7 h-7 text-white" />
              {/* Rank Badge */}
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black"
                style={{ 
                  background: rankColors[player?.prestige_rank] || rankColors.Bronze,
                  color: player?.prestige_rank === 'BlackBox' ? 'white' : 'black'
                }}
              >
                {player?.prestige_rank?.charAt(0) || 'B'}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {player?.display_name || 'Pilot'}
              </h3>
              <div className="flex items-center gap-3 text-sm mt-1">
                <span className="font-semibold" style={{ color: rankColors[player?.prestige_rank] || brandColors.goldPrestige }}>
                  {player?.prestige_rank || 'Bronze'}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/80 flex items-center gap-1.5">
                  <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                  {player?.insight_points || 0} IP
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((player?.insight_points || 0) % 500) / 5, 100)}%` }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` }}
            />
          </div>
        </motion.div>

        {/* Top-Right: Quick Stats + Missions Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 flex gap-3"
        >
          <button
            onClick={() => setShowMissions(true)}
            className="bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 border-2 hover:bg-black/80 transition-all pointer-events-auto"
            style={{ borderColor: `${brandColors.goldPrestige}60` }}
          >
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span className="text-white font-bold text-lg">Missions</span>
            </div>
          </button>
          
          <div 
            className="bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 border-2"
            style={{ borderColor: `${brandColors.skyBlue}40` }}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
              <span className="text-white font-bold text-lg">{player?.artifacts_collected || 0}</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">Artifacts</p>
          </div>
          <div 
            className="bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 border-2"
            style={{ borderColor: `${brandColors.goldPrestige}40` }}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
              <span className="text-white font-bold text-lg">{player?.hangar_unlocked_areas?.length || 1}</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">Areas</p>
          </div>
        </motion.div>

        {/* Bottom-Center: Current Location */}
        <motion.div
          key={currentArea}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
        >
          <div 
            className="bg-black/80 backdrop-blur-md rounded-full px-8 py-4 flex items-center gap-4 border-2 shadow-2xl"
            style={{ borderColor: `${brandColors.goldPrestige}80` }}
          >
            <MapPin className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">Location</p>
              <span 
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {areaNames[currentArea] || currentArea}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left: Controls Guide */}
        <div className="absolute bottom-6 left-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/80">WASD</kbd>
                <span className="text-white/60">Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/80">X</kbd>
                <span className="text-white/60">Enter</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/80">LClick</kbd>
                <span className="text-white/60">Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-white/80">RClick</kbd>
                <span className="text-white/60">Waypoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Mission Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-6 right-6"
        >
          <div 
            className="bg-black/70 backdrop-blur-md rounded-xl p-4 max-w-xs border-2"
            style={{ borderColor: `${brandColors.navyDeep}60` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">Current Mission</span>
            </div>
            <p className="text-white text-sm font-medium">
              Explore the Space Center Campus
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
              <span>Progress: {player?.hangar_unlocked_areas?.length || 1}/9 locations</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Missions Panel */}
      <MissionsPanel 
        isOpen={showMissions} 
        onClose={() => setShowMissions(false)} 
      />
    </>
  );
}