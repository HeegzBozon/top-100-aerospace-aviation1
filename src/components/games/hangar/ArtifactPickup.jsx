import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, X } from 'lucide-react';
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

const rarityLabels = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export default function ArtifactPickup({ artifact, onDismiss }) {
  const rarity = artifact?.rarity || 'common';

  useEffect(() => {
    // Vibrate on pickup
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  return (
    <AnimatePresence>
      {artifact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Particle effects */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: 0, 
                scale: 1,
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
              }}
              transition={{ duration: 1.5, delay: i * 0.05 }}
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                background: rarityColors[rarity],
                left: '50%',
                top: '50%'
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-3xl blur-3xl opacity-50"
              style={{ background: rarityColors[rarity] }}
            />
            
            <div 
              className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md text-center"
              style={{ border: `3px solid ${rarityColors[rarity]}` }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onDismiss}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>

              <motion.div
                initial={{ y: 20 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 mx-auto rounded-2xl mb-6 flex items-center justify-center relative"
                style={{ background: `${rarityColors[rarity]}20` }}
              >
                {artifact.icon_url ? (
                  <img src={artifact.icon_url} alt={artifact.name} className="w-20 h-20 object-contain" />
                ) : (
                  <Package className="w-16 h-16" style={{ color: rarityColors[rarity] }} />
                )}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                    border: `2px dashed ${rarityColors[rarity]}40`,
                  }}
                />
              </motion.div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" style={{ color: rarityColors[rarity] }} />
                <span 
                  className="text-sm uppercase tracking-widest font-bold"
                  style={{ color: rarityColors[rarity] }}
                >
                  {rarityLabels[rarity]} Artifact
                </span>
                <Sparkles className="w-5 h-5" style={{ color: rarityColors[rarity] }} />
              </div>

              <h2 
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {artifact.name}
              </h2>

              <p className="text-white/70 mb-6 leading-relaxed">
                {artifact.description}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm">
                <span className="text-white/50">Category:</span>
                <span className="text-white capitalize">{artifact.category}</span>
                <span className="text-white/30 mx-2">•</span>
                <span className="text-white/50">Source:</span>
                <span className="text-white capitalize">{artifact.source_game?.replace('_', ' ')}</span>
              </div>

              <Button
                onClick={onDismiss}
                className="w-full py-6 text-lg font-semibold"
                style={{ 
                  background: `linear-gradient(135deg, ${rarityColors[rarity]}, ${rarityColors[rarity]}cc)`,
                  color: 'white'
                }}
              >
                Add to Collection
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}