import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_CHATS = [
  "🚀 Go for launch!",
  "✨ Mission nominal.",
  "📡 Copy that.",
  "🛑 Holding for clearance.",
  "⭐ Godspeed!",
  "🌍 Beautiful view.",
  "🎯 What a milestone!",
  "⚡ Engines looking good.",
  "🛰️ Signal is strong.",
  "🔥 Full thrust!",
  "🌌 Incredible."
];

export default function FloatingReactions() {
  const [reactions, setReactions] = useState([]);
  
  useEffect(() => {
    const unsubscribe = base44.entities.LiveReaction.subscribe((event) => {
      if (event.type === 'create') {
        const id = event.data.id || Math.random().toString();
        const phrase = event.data.emoji; // Use emoji field for phrase text
        const left = 10 + Math.random() * 80;
        
        setReactions(prev => {
          if (prev.find(r => r.emoji === phrase && Date.now() - r.time < 500)) return prev;
          return [...prev, { id, emoji: phrase, left, time: Date.now() }];
        });
        
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
      }
    });
    
    return unsubscribe;
  }, []);

  const handleReaction = async (phrase) => {
    const localId = 'local_' + Math.random().toString();
    const left = 10 + Math.random() * 80;
    
    setReactions(prev => [...prev, { id: localId, emoji: phrase, left, time: Date.now() }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== localId));
    }, 3000);
    
    try {
      await base44.entities.LiveReaction.create({ emoji: phrase });
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
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -250, 
                x: (Math.random() - 0.5) * 60, 
                scale: [0.8, 1.1, 1] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute bottom-24 text-sm sm:text-base font-bold text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/20 whitespace-nowrap backdrop-blur-md shadow-lg"
              style={{ left: `${r.left}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg flex flex-wrap justify-center gap-1.5 sm:gap-2 bg-[#0a1526]/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-[#4a90b8]/30 shadow-[0_0_20px_rgba(74,144,184,0.15)]">
        {QUICK_CHATS.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleReaction(phrase)}
            className="bg-[#1e3a5a]/60 hover:bg-[#c9a87c]/20 text-[#c9a87c] text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full border border-[#c9a87c]/30 hover:border-[#c9a87c] transition-all active:scale-95 shadow-sm whitespace-nowrap"
            title={`Send ${phrase}`}
          >
            {phrase}
          </button>
        ))}
      </div>
    </>
  );
}