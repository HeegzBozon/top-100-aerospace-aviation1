import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Eye, MessageSquare, Package, Lock, Sparkles, Home } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const interactionIcons = {
  collect: Package,
  examine: Eye,
  talk: MessageSquare,
  interact: Hand,
  locked: Lock,
  special: Sparkles,
  building_entrance: Home,
  artifact: Package,
  terminal: Eye,
  nominee: MessageSquare,
};

export default function InteractionPrompt({ 
  isVisible, 
  type = 'interact', 
  label = 'Press X to interact',
  subLabel,
  isLocked = false 
}) {
  const Icon = isLocked ? interactionIcons.locked : (interactionIcons[type] || interactionIcons.interact);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div 
            className="bg-black/80 backdrop-blur-md rounded-xl px-6 py-4 flex items-center gap-4"
            style={{ border: `1px solid ${isLocked ? '#666' : brandColors.goldPrestige}60` }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ 
                background: isLocked ? '#44444440' : `${brandColors.goldPrestige}30`,
              }}
            >
              <Icon className="w-6 h-6" style={{ color: isLocked ? '#888' : brandColors.goldPrestige }} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ 
                    background: isLocked ? '#444' : brandColors.goldPrestige,
                    color: isLocked ? '#888' : 'white'
                  }}
                >
                  X
                </span>
                <span className="text-white font-medium">{label}</span>
              </div>
              {subLabel && (
                <p className="text-white/50 text-sm mt-1">{subLabel}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}