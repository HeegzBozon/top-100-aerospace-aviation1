import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🔥', '❤️', '✨', '🌟', '🚀', '👽', '🛸'];

export default function FloatingReactions() {
  const [reactions, setReactions] = useState([]);
  
  useEffect(() => {
    const unsubscribe = base44.entities.LiveReaction.subscribe((event) => {
      if (event.type === 'create') {
        const id = event.data.id || Math.random().toString();
        const emoji = event.data.emoji;
        const left = 10 + Math.random() * 80;
        
        setReactions(prev => {
          if (prev.find(r => r.emoji === emoji && Date.now() - r.time < 500)) return prev;
          return [...prev, { id, emoji, left, time: Date.now() }];
        });
        
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
      }
    });
    
    return unsubscribe;
  }, []);

  const handleReaction = async (emoji) => {
    const localId = 'local_' + Math.random().toString();
    const left = 10 + Math.random() * 80;
    
    setReactions(prev => [...prev, { id: localId, emoji, left, time: Date.now() }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== localId));
    }, 3000);
    
    try {
      await base44.entities.LiveReaction.create({ emoji });
    } catch (e) {
      console.error('Failed to send reaction', e);
    }
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -300, 
                x: (Math.random() - 0.5) * 60, 
                scale: [0.5, 1.5, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute bottom-16 text-3xl sm:text-4xl"
              style={{ left: `${r.left}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-[#0a1526]/80 backdrop-blur-md p-2 rounded-full border border-[#4a90b8]/30 shadow-[0_0_20px_rgba(74,144,184,0.15)]">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl hover:bg-white/10 rounded-full transition-all hover:scale-125 active:scale-95"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}