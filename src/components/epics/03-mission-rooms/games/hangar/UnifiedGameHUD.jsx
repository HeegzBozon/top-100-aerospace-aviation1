import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scroll, Maximize2, Volume2, VolumeX, Layers, Trophy, MapPin, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const rankColors = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  BlackBox: '#1a1a1a',
  Platinum: '#e5e4e2',
};

export default function UnifiedGameHUD({
  player,
  currentArea,
  areaName,
  showOutside,
  onToggleOutside,
  onToggleMissions,
  onToggleEvaluation,
  onToggleLayerNav,
  isMuted,
  onToggleMute,
  onToggleFullscreen,
  cameraMode = 'follow',
  onToggleCameraMode
}) {
  return (
    <>
      {/* Top Bar - Unified Glass Panel - Below Layout TopNav */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 left-4 right-4 z-40 flex items-center justify-between gap-4 pointer-events-none"
      >
        {/* Left Side - Exit + Player Card */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Exit Button */}
          <Link to={createPageUrl('GamesHub')}>
            <Button
              variant="ghost"
              className="bg-black/60 backdrop-blur-xl text-white hover:bg-black/70 border border-white/10 h-12 px-4 shadow-2xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-semibold">Exit Hangar</span>
            </Button>
          </Link>

          {/* Player Info Card */}
          <div 
            className="bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-2xl flex items-center gap-3"
          >
            {/* Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`,
                borderColor: brandColors.goldPrestige
              }}
            >
              {player?.display_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            
            {/* Player Details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">
                  {player?.display_name || 'Sky Cadet'}
                </span>
                <span 
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ 
                    background: rankColors[player?.prestige_rank] || rankColors.Bronze,
                    color: player?.prestige_rank === 'BlackBox' ? 'white' : 'black'
                  }}
                >
                  {player?.prestige_rank || 'Bronze'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">💡</span>
                  <span className="text-white/80 font-semibold">
                    {(player?.intellectual_property || player?.insight_points || 0)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-400">💼</span>
                  <span className="text-white/80 font-semibold">
                    {(player?.equity_points || 0)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div 
            className="bg-black/60 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/10 shadow-2xl flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
            <span className="text-white font-semibold text-sm">
              {areaName || 'Unknown Area'}
            </span>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Missions Button - Highlighted */}
          <button
            onClick={onToggleMissions}
            className="h-12 px-5 rounded-xl backdrop-blur-xl border-2 hover:scale-105 transition-all shadow-2xl flex items-center gap-2 font-bold"
            style={{
              background: `linear-gradient(135deg, ${brandColors.goldPrestige}40, ${brandColors.goldPrestige}20)`,
              borderColor: brandColors.goldPrestige
            }}
          >
            <Scroll className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            <span className="text-white text-sm">Missions</span>
          </button>

          {/* R&D Lab Button */}
          {onToggleEvaluation && (
            <button
              onClick={onToggleEvaluation}
              className="h-12 px-5 rounded-xl backdrop-blur-xl border-2 hover:scale-105 transition-all shadow-2xl flex items-center gap-2 font-bold"
              style={{
                background: `linear-gradient(135deg, ${brandColors.skyBlue}40, ${brandColors.skyBlue}20)`,
                borderColor: brandColors.skyBlue
              }}
            >
              <span className="text-xl">🔬</span>
              <span className="text-white text-sm">R&D Lab</span>
            </button>
          )}

          {/* Stats Display */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-xl px-4 h-12 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
              <span className="text-white font-bold text-sm">{player?.artifacts_collected || 0}</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
              <span className="text-white font-bold text-sm">{player?.hangar_unlocked_areas?.length || 1}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl rounded-xl p-1 border border-white/10 shadow-2xl">
            <button
              onClick={onToggleOutside}
              className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
              title="Toggle Outside View (O)"
            >
              <span className="text-xl">{showOutside ? '🏢' : '🌎'}</span>
            </button>
            
            <button
              onClick={onToggleLayerNav}
              className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              title="Layer Navigator (L)"
            >
              <Layers className="w-5 h-5" />
            </button>
            
            {onToggleCameraMode && (
              <button
                onClick={onToggleCameraMode}
                className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                  cameraMode === 'follow' 
                    ? 'bg-green-500/40 text-green-200 hover:bg-green-500/50' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={`Camera: ${cameraMode === 'follow' ? 'Auto Follow' : 'Manual'} (C)`}
              >
                <Video className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              title="Audio Toggle"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onToggleFullscreen}
              className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}