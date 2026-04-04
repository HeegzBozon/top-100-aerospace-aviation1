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

  useEffect(() => {
    if (comments.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % comments.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [comments.length]);

  if (isLoading) return <div className="h-24 w-full bg-slate-900 animate-pulse rounded-xl border border-slate-800 mt-6"></div>;
  if (!comments.length) return null;

  const currentComment = comments[currentIndex];

  return (
    <div className="w-full mt-4 bg-slate-900/60 rounded-xl border border-slate-800/80 p-6 relative overflow-hidden shadow-inner">
      <Quote className="absolute top-6 right-6 w-16 h-16 text-slate-800/40" />
      <div className="flex items-center justify-between mb-4">
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
           className="flex flex-col md:flex-row gap-5 items-start md:items-center relative z-10"
        >
           <div className="shrink-0">
             <img 
               src={currentComment.expert_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentComment.expert_name)}&background=1e3a5a&color=c9a87c`} 
               alt={currentComment.expert_name} 
               className="w-14 h-14 rounded-full border-2 border-[#1e3a5a] object-cover shadow-lg"
             />
           </div>
           <div>
             <p className="text-slate-200 text-sm md:text-base italic mb-2 leading-relaxed max-w-4xl">"{currentComment.comment}"</p>
             <div className="flex items-center gap-2">
               <span className="text-[#c9a87c] text-xs font-bold">{currentComment.expert_name}</span>
               {currentComment.expert_title && (
                 <>
                   <span className="text-slate-700 text-xs">•</span>
                   <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{currentComment.expert_title}</span>
                 </>
               )}
             </div>
           </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}