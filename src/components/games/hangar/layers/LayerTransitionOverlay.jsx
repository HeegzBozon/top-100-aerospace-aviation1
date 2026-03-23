import { motion, AnimatePresence } from 'framer-motion';
import { useLayer } from './LayerManager';
import { Sparkles } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
  holoCyan: '#00d4ff',
};

// Layer-specific visual themes
const layerThemes = {
  5: { bg: 'from-blue-400 to-cyan-300', icon: '🚁', particles: 'clouds' },
  6: { bg: 'from-cyan-400 to-blue-500', icon: '✈️', particles: 'clouds' },
  7: { bg: 'from-blue-500 to-indigo-600', icon: '🛫', particles: 'contrails' },
  8: { bg: 'from-indigo-600 to-purple-800', icon: '🚀', particles: 'stars_sparse' },
  9: { bg: 'from-purple-800 to-gray-900', icon: '🔥', particles: 'meteors' },
  10: { bg: 'from-gray-900 to-black', icon: '🛰️', particles: 'aurora' },
  11: { bg: 'from-black via-yellow-900/20 to-black', icon: '⭐', particles: 'stardust' },
  12: { bg: 'from-black to-blue-950', icon: '🌍', particles: 'satellites' },
  13: { bg: 'from-blue-950 to-indigo-950', icon: '📡', particles: 'gps_signals' },
  14: { bg: 'from-indigo-950 to-purple-950', icon: '🛸', particles: 'orbital_ring' },
  15: { bg: 'from-purple-950 to-gray-950', icon: '🌙', particles: 'lunar_dust' },
  16: { bg: 'from-gray-950 to-black', icon: '🔴', particles: 'cosmic_rays' },
};

function ParticleEffect({ type, progress }) {
  const particleCount = 20;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: particleCount }).map((_, i) => {
        const delay = i * 0.1;
        const xOffset = Math.sin(i * 0.5) * 100;
        
        return (
          <motion.div
            key={i}
            initial={{ y: '100%', x: xOffset, opacity: 0 }}
            animate={{ 
              y: '-100%', 
              x: xOffset + Math.sin(progress * 10 + i) * 50,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${(i / particleCount) * 100}%`,
              background: type === 'stardust' ? brandColors.goldPrestige : 
                         type === 'aurora' ? 'linear-gradient(to right, #00ff88, #00ffff)' :
                         type === 'meteors' ? '#ff6b35' : 
                         'rgba(255,255,255,0.6)',
              boxShadow: type === 'stardust' ? `0 0 10px ${brandColors.goldPrestige}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

function AltitudeCounter({ from, to, progress }) {
  const fromLayer = from ? layerThemes[from] : null;
  const toLayer = layerThemes[to];
  
  // Interpolate altitude display
  const fromAlt = from <= 2 ? 0 : from * 1000; // Simplified
  const toAlt = to * 10000;
  const currentAlt = Math.round(fromAlt + (toAlt - fromAlt) * progress);
  
  const formatAltitude = (alt) => {
    if (alt >= 1000000) return `${(alt / 1000000).toFixed(1)}M km`;
    if (alt >= 1000) return `${(alt / 1000).toFixed(1)} km`;
    return `${alt} m`;
  };
  
  return (
    <div className="text-center">
      <div className="text-6xl font-mono text-white mb-2">
        {formatAltitude(currentAlt)}
      </div>
      <div className="text-white/60 text-sm uppercase tracking-widest">
        Altitude
      </div>
    </div>
  );
}

export default function LayerTransitionOverlay() {
  const { isTransitioning, transitionProgress, transitionData } = useLayer();
  
  if (!isTransitioning || !transitionData) return null;
  
  const { from, to, method, duration, isEmergencyReturn } = transitionData;
  const theme = layerThemes[to] || layerThemes[5];
  const progress = transitionProgress;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b ${theme.bg}`}
      >
        {/* Particle effects */}
        <ParticleEffect type={theme.particles} progress={progress} />
        
        {/* Central content */}
        <div className="relative z-10 text-center">
          {/* Vehicle/Transition icon */}
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{ 
              scale: [1, 1.1, 1],
              y: [100, 0, -20, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-8xl mb-8"
          >
            {theme.icon}
          </motion.div>
          
          {/* Altitude counter */}
          <AltitudeCounter from={from} to={to} progress={progress} />
          
          {/* Transition name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div 
              className="text-xl font-semibold mb-2"
              style={{ color: brandColors.goldPrestige }}
            >
              {method?.name || 'Transitioning...'}
            </div>
            <div className="text-white/70 text-sm">
              {isEmergencyReturn ? 'Emergency Return to Hangar' : `Ascending to Layer ${to}`}
            </div>
          </motion.div>
          
          {/* Progress bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${brandColors.skyBlue}, ${brandColors.goldPrestige})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/50">
              <span>Layer {from}</span>
              <span>{Math.round(progress * 100)}%</span>
              <span>Layer {to}</span>
            </div>
          </div>
        </div>
        
        {/* Kármán Line special effect */}
        {to === 11 && progress > 0.8 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <Sparkles className="w-24 h-24 mx-auto mb-4" style={{ color: brandColors.goldPrestige }} />
              <div 
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: brandColors.goldPrestige,
                }}
              >
                WELCOME TO SPACE
              </div>
              <div className="text-white/80 mt-2">
                You have crossed the Kármán Line
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}