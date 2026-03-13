import React from "react";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import { BarChart3, Clock, Lock, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function PollCard({ poll, currentUserEmail, onVote, onClose }) {
  const isCreator = poll.creator_email === currentUserEmail;
  const isClosed = poll.is_closed || (poll.ends_at && isPast(new Date(poll.ends_at)));
  
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
  
  const hasVoted = poll.options.some(opt => opt.votes?.includes(currentUserEmail));
  const showResults = hasVoted || isClosed;
  
  const handleVote = (optionId) => {
    if (isClosed || (!poll.allow_multiple && hasVoted)) return;
    
    const updatedOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        const alreadyVoted = opt.votes?.includes(currentUserEmail);
        return {
          ...opt,
          votes: alreadyVoted 
            ? opt.votes.filter(e => e !== currentUserEmail)
            : [...(opt.votes || []), currentUserEmail]
        };
      }
      // If not allowing multiple, remove vote from other options
      if (!poll.allow_multiple) {
        return {
          ...opt,
          votes: (opt.votes || []).filter(e => e !== currentUserEmail)
        };
      }
      return opt;
    });
    
    onVote(poll.id, updatedOptions);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 my-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text)]">Poll</span>
          {poll.is_anonymous && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3" /> Anonymous
            </span>
          )}
          {poll.allow_multiple && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
              Multi-select
            </span>
          )}
        </div>
        {isClosed ? (
          <span className="text-xs text-red-500 font-medium">Closed</span>
        ) : poll.ends_at ? (
          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ends {format(new Date(poll.ends_at), "MMM d, h:mm a")}
          </span>
        ) : null}
      </div>
      
      {/* Question */}
      <h4 className="font-medium text-[var(--text)] mb-3">{poll.question}</h4>
      
      {/* Options */}
      <div className="space-y-2">
        {poll.options.map(option => {
          const voteCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = option.votes?.includes(currentUserEmail);
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isClosed}
              className={cn(
                "w-full text-left rounded-lg border transition-all relative overflow-hidden",
                isSelected 
                  ? "border-[var(--accent)] bg-[var(--accent)]/5" 
                  : "border-[var(--border)] hover:border-[var(--accent)]/50",
                isClosed && "cursor-default"
              )}
            >
              {showResults && (
                <div 
                  className="absolute inset-0 bg-[var(--accent)]/10 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    isSelected 
                      ? "border-[var(--accent)] bg-[var(--accent)]" 
                      : "border-[var(--border)]"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-[var(--text)]">{option.text}</span>
                </div>
                {showResults && (
                  <span className="text-xs font-medium text-[var(--muted)]">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--muted)] flex items-center gap-1">
          <Users className="w-3 h-3" />
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        {isCreator && !isClosed && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs h-7"
            onClick={() => onClose(poll.id)}
          >
            End Poll
          </Button>
        )}
      </div>
    </div>
  );
}