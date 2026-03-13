import React, { useState, useEffect } from 'react';
import { Star, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StardustNotification({ 
  show, 
  pointsAwarded, 
  basePoints, 
  engagementMultiplier, 
  vibeWeight, 
  cloutFactor, 
  newTotal, 
  actionType, 
  onClose 
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto-close after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const hasMultipliers = engagementMultiplier > 1 || vibeWeight !== 1 || cloutFactor !== 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl border border-yellow-300 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">
                    +{pointsAwarded} Stardust!
                  </h3>
                  <p className="text-yellow-100 text-sm">
                    {actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center justify-between text-yellow-100 text-sm">
                <span>Total: {newTotal} Stardust</span>
                {hasMultipliers && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 text-yellow-100 hover:text-white"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-yellow-300/30"
                  >
                    <div className="space-y-1 text-xs text-yellow-100">
                      <div className="flex justify-between">
                        <span>Base Points:</span>
                        <span>{basePoints}</span>
                      </div>
                      {engagementMultiplier !== 1 && (
                        <div className="flex justify-between">
                          <span>Engagement Bonus:</span>
                          <span>×{engagementMultiplier.toFixed(2)}</span>
                        </div>
                      )}
                      {vibeWeight !== 1 && (
                        <div className="flex justify-between">
                          <span>Vibe Multiplier:</span>
                          <span>×{vibeWeight.toFixed(2)}</span>
                        </div>
                      )}
                      {cloutFactor !== 1 && (
                        <div className="flex justify-between">
                          <span>Clout Factor:</span>
                          <span>×{cloutFactor.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t border-yellow-300/30 pt-1">
                        <span>Final Award:</span>
                        <span>{pointsAwarded}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Animated sparkle effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" 
                   style={{ animationDelay: '0s' }} />
              <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-ping" 
                   style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-3 right-8 w-1 h-1 bg-white rounded-full animate-ping" 
                   style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}