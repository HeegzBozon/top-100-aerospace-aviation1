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

  if (isLoading) return <div className="w-full h-32 bg-[#061e47] rounded-xl border-2 border-[#4a90b8] shadow-2xl"></div>;
  if (!poll) return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 border-2 border-[#4a90b8] rounded-xl bg-[#061e47] shadow-2xl">
       <span className="text-[#4a90b8] text-[15px] font-black tracking-widest uppercase mb-3">Live Polling</span>
       <span className="text-white font-bold text-[13px]">Waiting for the next mission prompt...</span>
    </div>
  );

  const totalVotes = votes.length;

  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + activePolls.length) % activePolls.length);
  const handleNext = () => setCurrentIndex(prev => (prev + 1) % activePolls.length);

  return (
    <div 
      className="w-full bg-[#061e47] border border-[#4a90b8] rounded-xl p-5 shadow-2xl relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
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
            className="text-blue-300/50 hover:text-red-400 transition-colors flex items-center gap-1"
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
          <h4 className="text-blue-100 font-semibold mb-2 text-sm leading-tight">{poll.question}</h4>
          <div className={`grid gap-3 ${poll.poll_type === 'emoji' ? 'grid-cols-4' : 'grid-cols-1'}`}>
        {poll.options.map(option => {
          const optionVotes = votes.filter(v => v.selected_option === option).length;
          const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
          
          if (userVote) {
            const isSelected = userVote.selected_option === option;
            const isCorrect = poll.type === 'trivia' && poll.correct_answer === option;
            const isWrongSelection = poll.type === 'trivia' && isSelected && !isCorrect;

            let barColor = "bg-[#4a90b8]";
            let textColor = "text-white";
            let borderColor = "border-[#4a90b8]";
            if (isSelected) {
                barColor = "bg-[#c9a87c]";
                textColor = "text-slate-900 font-bold";
                borderColor = "border-[#c9a87c]";
            }
            if (poll.type === 'trivia') {
                if (isCorrect) {
                    barColor = "bg-green-500";
                    textColor = "text-white font-bold";
                    borderColor = "border-green-500";
                } else if (isWrongSelection) {
                    barColor = "bg-red-500";
                    textColor = "text-white font-bold";
                    borderColor = "border-red-500";
                }
            }

            if (poll.poll_type === 'emoji') {
                return (
                    <div key={option} className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 ${isSelected ? 'border-[#c9a87c] bg-[#c9a87c]' : 'border-[#4a90b8] bg-[#0b3d91]'}`}>
                        <span className="text-2xl mb-1">{option}</span>
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-slate-900' : 'text-white'}`}>{percentage}%</span>
                    </div>
                );
            }

            return (
              <div key={option} className={`relative h-10 flex items-center px-4 rounded-xl border-2 ${borderColor} bg-[#0b3d91] overflow-hidden`}>
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all ${barColor}`} 
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative z-10 w-full flex justify-between items-center text-[14px] font-bold">
                  <span className={`${textColor} flex items-center gap-2`}>
                    {option} 
                    {isSelected && poll.type !== 'trivia' && "✓"}
                    {poll.type === 'trivia' && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                    {poll.type === 'trivia' && isWrongSelection && <XCircle className="w-4 h-4 text-white" />}
                  </span>
                  <span className={textColor}>{percentage}%</span>
                </div>
              </div>
            );
          }

          if (poll.poll_type === 'emoji') {
            return (
              <Button 
                key={option}
                variant="outline" 
                className="h-16 rounded-xl border-2 border-[#4a90b8] bg-[#0b3d91] hover:bg-[#1e3a5a] transition-none text-3xl shadow-lg"
                onClick={() => handleVoteClick(option)}
                disabled={voteMutation.isPending}
              >
                {voteMutation.isPending && voteMutation.variables === option ? <Loader2 className="w-5 h-5 animate-spin absolute" /> : option}
              </Button>
            );
          }

          return (
            <Button 
              key={option}
              variant="outline" 
              size="lg"
              className="relative w-full h-10 justify-start px-4 text-[14px] font-bold border-2 border-[#4a90b8] bg-[#0b3d91] hover:bg-[#1e3a5a] text-white transition-none shadow-lg rounded-xl"
              onClick={() => handleVoteClick(option)}
              disabled={voteMutation.isPending}
            >
              <span className="relative z-10 flex items-center text-white">
                {voteMutation.isPending && voteMutation.variables === option ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" /> : null}
                {option}
              </span>
            </Button>
          );
        })}
      </div>

          {userVote && poll.type === 'trivia' && poll.explanation && (
              <div className="mt-3 p-3 bg-[#0b3d91]/40 border border-[#4a90b8]/40 rounded-md text-[13px] text-blue-50 shadow-inner">
                  <span className="font-bold text-[#c9a87c] block mb-1">Explanation:</span>
                  {poll.explanation}
              </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-between relative z-10">
        <div className="flex gap-2">
            {activePolls.length > 1 && (
                <>
                    <button onClick={handlePrev} className="p-1.5 rounded-md bg-[#0b3d91]/60 border border-[#4a90b8]/30 text-blue-100 hover:text-white hover:bg-[#0b3d91]/80 transition-colors shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNext} className="p-1.5 rounded-md bg-[#0b3d91]/60 border border-[#4a90b8]/30 text-blue-100 hover:text-white hover:bg-[#0b3d91]/80 transition-colors shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
        <div className="text-[10px] text-blue-100 text-right uppercase tracking-wider font-bold bg-[#0b3d91]/40 px-2 py-1 rounded-md border border-[#4a90b8]/20 shadow-sm">
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