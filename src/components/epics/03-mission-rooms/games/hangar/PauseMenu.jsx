import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  Play, HelpCircle, LogOut, Volume2, VolumeX, 
  Monitor, Package, Trophy, Star 
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

export default function PauseMenu({ 
  isOpen, 
  onResume, 
  onSettings, 
  onHelp,
  isMuted,
  onToggleMute 
}) {
  const { player, artifacts, badges } = useGame();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 
                className="text-4xl text-white mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Paused
              </h1>
              <p className="text-white/50 text-sm uppercase tracking-widest">The Hangar</p>
            </div>

            {/* Player Stats Card */}
            <div 
              className="bg-white/5 rounded-xl p-4 mb-6"
              style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: player?.avatar_config?.color || brandColors.skyBlue }}
                  >
                    {player?.display_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{player?.display_name || 'Pilot'}</p>
                    <p className="text-sm" style={{ color: brandColors.goldPrestige }}>
                      {player?.prestige_rank || 'Bronze'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    <span className="text-white font-bold">{player?.insight_points || 0}</span>
                  </div>
                  <p className="text-white/50 text-xs">Insight Points</p>
                </div>
              </div>
              
              <div className="flex justify-around pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                    <span className="text-white font-bold">{artifacts.length}</span>
                  </div>
                  <p className="text-white/40 text-xs">Artifacts</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    <span className="text-white font-bold">{badges.length}</span>
                  </div>
                  <p className="text-white/40 text-xs">Badges</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Monitor className="w-4 h-4 text-green-400" />
                    <span className="text-white font-bold">{player?.hangar_unlocked_areas?.length || 1}/6</span>
                  </div>
                  <p className="text-white/40 text-xs">Areas</p>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-3">
              <Button
                onClick={onResume}
                className="w-full py-6 text-lg font-semibold"
                style={{ background: brandColors.goldPrestige, color: 'white' }}
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>

              <Button
                onClick={onToggleMute}
                variant="outline"
                className="w-full py-5 text-white border-white/20 hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-5 h-5 mr-2" /> : <Volume2 className="w-5 h-5 mr-2" />}
                {isMuted ? 'Unmute Audio' : 'Mute Audio'}
              </Button>

              <Button
                onClick={onHelp}
                variant="outline"
                className="w-full py-5 text-white border-white/20 hover:bg-white/10"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Controls & Help
              </Button>

              <Link to={createPageUrl('GamesHub')} className="block">
                <Button
                  variant="outline"
                  className="w-full py-5 text-red-400 border-red-400/30 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Exit to Games Hub
                </Button>
              </Link>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-white/30 text-sm mt-6">
              Press <span className="bg-white/10 px-2 py-0.5 rounded font-mono">ESC</span> to resume
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}