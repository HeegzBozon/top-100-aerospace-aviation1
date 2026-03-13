import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';
import { X, Package, Trophy, Star, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const rarityColors = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const rarityGlow = {
  common: 'none',
  uncommon: '0 0 10px #22c55e40',
  rare: '0 0 15px #3b82f640',
  epic: '0 0 20px #a855f740',
  legendary: '0 0 25px #f59e0b60',
};

function ArtifactCard({ artifact, onClick }) {
  const rarity = artifact.rarity || 'common';
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-black/40 rounded-lg p-3 cursor-pointer border transition-all"
      style={{ 
        borderColor: rarityColors[rarity],
        boxShadow: rarityGlow[rarity]
      }}
    >
      <div className="w-full aspect-square rounded-md mb-2 flex items-center justify-center"
        style={{ background: `${rarityColors[rarity]}20` }}
      >
        {artifact.icon_url ? (
          <img src={artifact.icon_url} alt={artifact.name} className="w-12 h-12 object-contain" />
        ) : (
          <Package className="w-8 h-8" style={{ color: rarityColors[rarity] }} />
        )}
      </div>
      <p className="text-xs text-white font-medium truncate">{artifact.name}</p>
      <p className="text-[10px] capitalize" style={{ color: rarityColors[rarity] }}>{rarity}</p>
    </motion.div>
  );
}

function BadgeCard({ badge }) {
  const tierColors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative bg-black/40 rounded-lg p-3 border"
      style={{ borderColor: tierColors[badge.tier] || tierColors.bronze }}
    >
      <div className="w-full aspect-square rounded-full mb-2 flex items-center justify-center"
        style={{ background: `${tierColors[badge.tier]}30` }}
      >
        <Trophy className="w-8 h-8" style={{ color: tierColors[badge.tier] }} />
      </div>
      <p className="text-xs text-white font-medium truncate text-center">{badge.name}</p>
    </motion.div>
  );
}

export default function InventoryPanel({ isOpen, onClose }) {
  const { artifacts, badges, player } = useGame();
  const [activeTab, setActiveTab] = useState('artifacts');
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${brandColors.goldPrestige}40` }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Inventory
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('artifacts')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'artifacts' 
                    ? 'text-white border-b-2' 
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{ borderColor: activeTab === 'artifacts' ? brandColors.goldPrestige : 'transparent' }}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Artifacts ({artifacts.length})
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                  activeTab === 'badges' 
                    ? 'text-white border-b-2' 
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{ borderColor: activeTab === 'badges' ? brandColors.goldPrestige : 'transparent' }}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Badges ({badges.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {activeTab === 'artifacts' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {artifacts.length > 0 ? (
                    artifacts.map((artifact) => (
                      <ArtifactCard 
                        key={artifact.id} 
                        artifact={artifact}
                        onClick={() => setSelectedArtifact(artifact)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-12 h-12 mx-auto text-white/20 mb-3" />
                      <p className="text-white/40">No artifacts collected yet</p>
                      <p className="text-white/30 text-sm mt-1">Explore The Hangar to find artifacts</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'badges' && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {badges.length > 0 ? (
                    badges.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Trophy className="w-12 h-12 mx-auto text-white/20 mb-3" />
                      <p className="text-white/40">No badges earned yet</p>
                      <p className="text-white/30 text-sm mt-1">Complete achievements to earn badges</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Player Stats Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                  <span className="text-white">{player?.insight_points || 0} IP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
                  <span className="text-white">{player?.prestige_rank || 'Bronze'}</span>
                </div>
              </div>
              <span className="text-white/40 text-xs">
                {(player?.hangar_unlocked_areas?.length || 1)}/6 Areas Discovered
              </span>
            </div>
          </motion.div>

          {/* Artifact Detail Modal */}
          <AnimatePresence>
            {selectedArtifact && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-60 pointer-events-none"
              >
                <div 
                  className="bg-slate-900 rounded-2xl p-6 max-w-sm pointer-events-auto"
                  style={{ 
                    border: `2px solid ${rarityColors[selectedArtifact.rarity]}`,
                    boxShadow: rarityGlow[selectedArtifact.rarity]
                  }}
                >
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-xl mb-4 flex items-center justify-center"
                      style={{ background: `${rarityColors[selectedArtifact.rarity]}20` }}
                    >
                      <Package className="w-12 h-12" style={{ color: rarityColors[selectedArtifact.rarity] }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{selectedArtifact.name}</h3>
                    <p className="text-sm capitalize mb-3" style={{ color: rarityColors[selectedArtifact.rarity] }}>
                      {selectedArtifact.rarity} {selectedArtifact.category}
                    </p>
                    <p className="text-white/70 text-sm mb-4">{selectedArtifact.description}</p>
                    <Button onClick={() => setSelectedArtifact(null)} variant="outline" className="text-white border-white/20">
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}