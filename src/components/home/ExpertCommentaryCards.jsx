import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpertCommentaryCards() {
  const [currentIndex, setCurrentSlide] = useState(0);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['expert-commentary'],
    queryFn: () => base44.entities.LiveExpertCommentary.list('-created_date', 10),
  });

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (comments.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % comments.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [comments.length]);

  // Reset flip state when comment changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  if (isLoading) return <div className="h-24 w-full bg-slate-900 animate-pulse rounded-xl border border-slate-800 mt-6"></div>;
  if (!comments.length) return null;

  const currentComment = comments[currentIndex];

  return (
    <div className="w-full bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 md:p-5 relative overflow-hidden shadow-inner backdrop-blur-md">
      <Quote className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 text-slate-800/30" />
      <div className="flex items-center justify-between mb-3 relative z-10">
         <div className="text-[10px] uppercase tracking-widest text-[#c9a87c] font-bold">Studio Commentary</div>
         {comments.length > 1 && (
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentSlide(prev => (prev - 1 + comments.length) % comments.length)} 
                  className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                   <ChevronLeft className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => (prev + 1) % comments.length)} 
                  className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                   <ChevronRight className="w-3 h-3" />
                </button>
             </div>
         )}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
           key={currentComment.id || currentIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
           className="relative z-10 h-[120px] md:h-auto"
        >
           {/* Desktop View (Standard) */}
           <div className="hidden md:flex flex-row gap-4 items-center">
             <div className="shrink-0">
               <img 
                 src={currentComment.expert_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentComment.expert_name)}&background=1e3a5a&color=c9a87c`} 
                 alt={currentComment.expert_name} 
                 className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-[#1e3a5a] object-cover shadow-lg"
               />
             </div>
             <div>
               <p className="text-slate-200 text-sm italic mb-1 leading-snug max-w-4xl">"{currentComment.comment}"</p>
               <div className="flex items-center gap-2">
                 <span className="text-[#c9a87c] text-xs font-bold">{currentComment.expert_name}</span>
                 {currentComment.expert_title && (
                   <>
                     <span className="text-slate-700 text-xs">•</span>
                     <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{currentComment.expert_title}</span>
                   </>
                 )}
               </div>
             </div>
           </div>

           {/* Mobile View (Flip Card) */}
           <div className="md:hidden card-flip-container w-full h-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
             <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Front */}
                <div className="card-flip-front bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 flex items-center gap-4">
                   <img 
                     src={currentComment.expert_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentComment.expert_name)}&background=1e3a5a&color=c9a87c`} 
                     alt={currentComment.expert_name} 
                     className="w-12 h-12 rounded-full border-2 border-[#1e3a5a] object-cover shadow-md shrink-0"
                   />
                   <div>
                     <span className="text-[#c9a87c] text-sm font-bold block">{currentComment.expert_name}</span>
                     <span className="text-slate-400 text-xs line-clamp-1">{currentComment.expert_title}</span>
                     <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">Tap to read comment <ChevronRight className="w-3 h-3" /></span>
                   </div>
                </div>
                {/* Back */}
                <div className="card-flip-back bg-[#1e3a5a]/80 border border-[#c9a87c]/30 rounded-lg p-4 flex flex-col justify-center">
                   <p className="text-slate-100 text-xs italic leading-relaxed line-clamp-4">"{currentComment.comment}"</p>
                </div>
             </div>
           </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}