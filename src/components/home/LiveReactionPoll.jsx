import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LiveReactionPoll() {
  const queryClient = useQueryClient();
  const [voterId, setVoterId] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem('voter_id');
    if (!id) {
      id = 'voter_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('voter_id', id);
    }
    setVoterId(id);
  }, []);

  const { data: activePolls = [], isLoading } = useQuery({
    queryKey: ['active-poll'],
    queryFn: () => base44.entities.LiveReactionPoll.filter({ is_active: true }, '-created_date', 1),
  });

  const poll = activePolls[0];

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
    }
  });

  if (isLoading) return <div className="animate-pulse w-full h-32 bg-slate-900 rounded-xl border border-slate-800"></div>;
  if (!poll) return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 border border-slate-800/50 rounded-xl bg-slate-900/30">
       <span className="text-slate-500 text-sm font-semibold tracking-widest uppercase mb-2">Live Polling</span>
       <span className="text-slate-400 text-xs">Waiting for the next mission prompt...</span>
    </div>
  );

  const totalVotes = votes.length;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-md">
      <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Live Reaction Poll
      </div>
      <h4 className="text-slate-200 font-semibold mb-4 text-sm leading-snug">{poll.question}</h4>
      <div className="space-y-3">
        {poll.options.map(option => {
          const optionVotes = votes.filter(v => v.selected_option === option).length;
          const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
          
          if (userVote) {
            const isSelected = userVote.selected_option === option;
            return (
              <div key={option} className="relative">
                <div className="flex justify-between text-xs mb-1 text-slate-400">
                  <span className={isSelected ? "text-[#c9a87c] font-bold" : "text-slate-300"}>
                    {option} {isSelected && "✓"}
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-[#c9a87c]" : "bg-slate-600"}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          return (
            <Button 
              key={option}
              variant="outline" 
              size="sm"
              className="w-full justify-start text-xs border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              onClick={() => voteMutation.mutate(option)}
              disabled={voteMutation.isPending}
            >
              {voteMutation.isPending && voteMutation.variables === option ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
              {option}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 text-[10px] text-slate-500 text-right uppercase tracking-wider font-semibold">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </div>
    </div>
  );
}