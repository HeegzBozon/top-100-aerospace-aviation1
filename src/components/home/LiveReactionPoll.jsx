import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailCaptureModal from './EmailCaptureModal';

export default function LiveReactionPoll() {
  const queryClient = useQueryClient();
  const [voterId, setVoterId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingOption, setPendingOption] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem('voter_id');
    if (!id) {
      id = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('voter_id', id);
    }
    setVoterId(id);
  }, []);

  const { data: activePolls = [], isLoading } = useQuery({
    queryKey: ['active-polls'],
    queryFn: () => base44.entities.LiveReactionPoll.filter({ is_active: true }, 'order', 50),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (activePolls.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePolls.length);
    }, 13000);
    return () => clearInterval(interval);
  }, [activePolls.length, isHovered]);

  const poll = activePolls[currentIndex];

  const { data: votes = [] } = useQuery({
    queryKey: ['poll-votes', poll?.id],
    queryFn: () => base44.entities.LiveReactionVote.filter({ poll_id: poll.id }, '', 5000),
    enabled: !!poll,
    refetchInterval: 3000,
  });

  const userVote = votes.find(v => v.voter_id === voterId);

  const voteMutation = useMutation({
    mutationFn: (option) => base44.entities.LiveReactionVote.create({
      poll_id: poll.id,
      voter_id: voterId,
      selected_option: option
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes', poll.id] });
      setTimeout(() => {
        handleNext();
      }, 2500);
    }
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const votesToDelete = await base44.entities.LiveReactionVote.filter({ poll_id: poll.id }, '', 5000);
      for (const v of votesToDelete) {
        await base44.entities.LiveReactionVote.delete(v.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-votes', poll.id] });
    }
  });

  const handleVoteClick = (option) => {
    if (!user && !localStorage.getItem('captured_email')) {
      setPendingOption(option);
      setShowEmailModal(true);
      return;
    }
    voteMutation.mutate(option);
  };

  if (isLoading) return <div className="animate-pulse w-full h-32 bg-slate-900 rounded-xl border border-slate-800"></div>;
  if (!poll) return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 border border-slate-800/50 rounded-xl bg-slate-900/30">
       <span className="text-slate-500 text-sm font-semibold tracking-widest uppercase mb-2">Live Polling</span>
       <span className="text-slate-400 text-xs">Waiting for the next mission prompt...</span>
    </div>
  );

  const totalVotes = votes.length;

  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + activePolls.length) % activePolls.length);
  const handleNext = () => setCurrentIndex(prev => (prev + 1) % activePolls.length);

  return (
    <div 
      className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {poll.type === 'trivia' ? 'Live Trivia' : 'Live Reaction Poll'}
          <span className="text-slate-500 ml-2">({currentIndex + 1}/{activePolls.length})</span>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all votes for this poll?')) {
                resetMutation.mutate();
              }
            }}
            disabled={resetMutation.isPending}
            className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            title="Reset Poll Votes"
          >
            <RefreshCw className={`w-3 h-3 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
            {resetMutation.isPending ? 'Resetting...' : 'Reset'}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={poll.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-slate-200 font-semibold mb-4 text-sm leading-snug">{poll.question}</h4>
          <div className={`grid gap-3 ${poll.poll_type === 'emoji' ? 'grid-cols-4' : 'grid-cols-1'}`}>
        {poll.options.map(option => {
          const optionVotes = votes.filter(v => v.selected_option === option).length;
          const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
          
          if (userVote) {
            const isSelected = userVote.selected_option === option;
            const isCorrect = poll.type === 'trivia' && poll.correct_answer === option;
            const isWrongSelection = poll.type === 'trivia' && isSelected && !isCorrect;

            let barColor = "bg-slate-600";
            let textColor = "text-slate-300";
            if (isSelected) {
                barColor = "bg-[#c9a87c]";
                textColor = "text-[#c9a87c] font-bold";
            }
            if (poll.type === 'trivia') {
                if (isCorrect) {
                    barColor = "bg-green-500";
                    textColor = "text-green-400 font-bold";
                } else if (isWrongSelection) {
                    barColor = "bg-red-500";
                    textColor = "text-red-400 font-bold";
                }
            }

            if (poll.poll_type === 'emoji') {
                return (
                    <div key={option} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${isSelected ? 'border-[#c9a87c] bg-[#c9a87c]/10' : 'border-slate-800 bg-slate-800/40'}`}>
                        <span className="text-2xl mb-1">{option}</span>
                        <span className="text-xs text-slate-400">{percentage}%</span>
                    </div>
                );
            }

            return (
              <div key={option} className="relative">
                <div className="flex justify-between text-xs mb-1 text-slate-400">
                  <span className={`${textColor} flex items-center gap-1`}>
                    {option} 
                    {isSelected && poll.type !== 'trivia' && "✓"}
                    {poll.type === 'trivia' && isCorrect && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    {poll.type === 'trivia' && isWrongSelection && <XCircle className="w-3 h-3 text-red-500" />}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          if (poll.poll_type === 'emoji') {
            return (
              <Button 
                key={option}
                variant="outline" 
                className="h-14 border-slate-700 bg-slate-800/40 hover:bg-slate-800 transition-colors text-2xl"
                onClick={() => handleVoteClick(option)}
                disabled={voteMutation.isPending}
              >
                {voteMutation.isPending && voteMutation.variables === option ? <Loader2 className="w-4 h-4 animate-spin absolute" /> : option}
              </Button>
            );
          }

          return (
            <Button 
              key={option}
              variant="outline" 
              size="sm"
              className="w-full justify-start text-xs border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              onClick={() => handleVoteClick(option)}
              disabled={voteMutation.isPending}
            >
              {voteMutation.isPending && voteMutation.variables === option ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
              {option}
            </Button>
          );
        })}
      </div>

          {userVote && poll.type === 'trivia' && poll.explanation && (
              <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-300">
                  <span className="font-bold text-white block mb-1">Explanation:</span>
                  {poll.explanation}
              </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between relative z-10">
        <div className="flex gap-2">
            {activePolls.length > 1 && (
                <>
                    <button onClick={handlePrev} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNext} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
        <div className="text-[10px] text-slate-500 text-right uppercase tracking-wider font-semibold">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </div>
      </div>
      <EmailCaptureModal 
        isOpen={showEmailModal} 
        onClose={() => {
          setShowEmailModal(false);
          setPendingOption(null);
        }}
        onSuccess={() => {
          setShowEmailModal(false);
          if (pendingOption) {
            voteMutation.mutate(pendingOption);
            setPendingOption(null);
          }
        }}
      />
    </div>
  );
}