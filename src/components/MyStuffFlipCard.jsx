import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Bookmark,
  Calendar,
  FileText,
  Clock,
  Rocket,
  History,
  ChevronRight,
  RotateCw,
  Users
} from 'lucide-react';
import { brandColors } from '@/components/core/brandTheme';

const myStuffItems = [
  { icon: CheckSquare, label: 'Nominations', href: 'VotingHub' },
  { icon: Bookmark, label: 'Bookmarks', href: 'Arena' },
  { icon: Calendar, label: 'Schedule', href: 'Calendar' },
  { icon: FileText, label: 'Drafts', href: 'Submit' },
  { icon: Clock, label: 'Activity', href: 'Home' },
  { icon: Rocket, label: 'Boosts', href: 'Endorse' },
];

const recentItems = [
  { label: 'Arena', href: 'Arena' },
  { label: 'Calendar', href: 'Calendar' },
  { label: 'Home', href: 'Home' },
];

export default function MyStuffFlipCard({ onNavigate }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="relative w-full" style={{ perspective: '1000px' }}>
      {/* Flip hint indicator */}
      <button
        onClick={handleFlip}
        className="absolute -top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
        style={{ 
          background: brandColors.goldPrestige,
          color: 'white',
          boxShadow: '0 2px 8px rgba(201, 168, 124, 0.4)'
        }}
      >
        <RotateCw className="w-3 h-3" />
        Tap to flip
      </button>

      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onClick={handleFlip}
      >
        {/* Front - My Stuff Grid */}
        <div
          className="w-full rounded-xl p-4"
          style={{ 
            backfaceVisibility: 'hidden',
            background: 'white',
            border: `1px solid ${brandColors.navyDeep}15`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" style={{ color: brandColors.navyDeep }} />
            <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>My Stuff</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {myStuffItems.map((item) => (
              <Link
                key={item.label}
                to={createPageUrl(item.href)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick();
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${brandColors.goldPrestige}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                </div>
                <span className="text-[10px] font-medium text-center" style={{ color: brandColors.navyDeep }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Back - Recently Visited */}
        <div
          className="absolute inset-0 w-full rounded-xl p-4"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${brandColors.navyDeep}, #2a4a6a)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold text-white">Recently Visited</span>
          </div>
          
          <div className="space-y-2">
            {recentItems.map((item) => (
              <Link
                key={item.label}
                to={createPageUrl(item.href)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick();
                }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors"
              >
                <span className="text-sm text-white font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </Link>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-white/50">
            Tap card to flip back
          </p>
        </div>
      </motion.div>
    </div>
  );
}