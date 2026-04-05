import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingReactions() {
  const [reactions, setReactions] = useState([]);
  const [quickChats, setQuickChats] = useState([]);

  useEffect(() => {
    const updateQuickChats = () => {
      // Get hour in Eastern Time
      const etDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
      const hour = etDate.getHours();

      let phrases = [];
      if (hour >= 5 && hour < 12) {
        phrases = [
          "🌅 Good morning, Houston!",
          "☕ Fueling up.",
          "🚀 Ready for launch.",
          "✨ Pre-flight checks nominal.",
          "☀️ Bright and early."
        ];
      } else if (hour >= 12 && hour < 17) {
        phrases = [
          "☀️ Clear skies ahead.",
          "🎯 Mid-flight update.",
          "🌍 Beautiful view.",
          "📡 Signal is strong.",
          "⚡ Thrust looking good."
        ];
      } else if (hour >= 17 && hour < 22) {
        phrases = [
          "🌇 Sunset orbit.",
          "🌌 Stars are coming out.",
          "🛰️ Evening pass.",
          "⭐ Godspeed!",
          "🚀 Evening launch."
        ];
      } else {
        phrases = [
          "🌙 Night operations.",
          "🌌 Deep space.",
          "✨ Stargazing.",
          "🛑 Holding for clearance.",
          "🦉 Night watch."
        ];
      }
      setQuickChats(phrases);
    };

    updateQuickChats();
    const interval = setInterval(updateQuickChats, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
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
    try {
      // Log phrase to chat only (do not float on video)
      const me = await base44.auth.me().catch(() => null);
      if (me) {
        await base44.entities.LiveStreamComment.create({
          text: phrase,
          user_name: me.full_name || 'Anonymous',
          user_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(me.full_name || 'A')}&background=1e3a5a&color=c9a87c`,
          user_email: me.email
        });
      }
    } catch (e) {
      console.error('Failed to log phrase', e);
    }
  };

  // Keyboard commands for phrases
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= quickChats.length) {
        handleReaction(quickChats[num - 1]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickChats]);

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
              className="absolute bottom-16 text-3xl sm:text-4xl"
              style={{ left: `${r.left}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl flex flex-wrap justify-center gap-2 pointer-events-none">
        {quickChats.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleReaction(phrase)}
            className="pointer-events-auto bg-[#0a1526]/90 backdrop-blur-md hover:bg-[#c9a87c]/20 text-[#c9a87c] text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-[#4a90b8]/40 hover:border-[#c9a87c] transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.5)] whitespace-nowrap"
            title={`Send ${phrase} (Press ${idx + 1})`}
          >
            <span className="opacity-50 mr-1.5 font-normal">{idx + 1}</span>
            {phrase}
          </button>
        ))}
      </div>
    </>
  );
}