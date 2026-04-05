import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LiveReactionPoll from './LiveReactionPoll';

// Simple client-side profanity filter
const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'crap'];

export default function LiveStreamComments() {
  const [newComment, setNewComment] = useState('');
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['live-stream-comments'],
    queryFn: async () => {
      const res = await base44.entities.LiveStreamComment.list('-created_date', 100);
      return [...res].reverse();
    },
    refetchInterval: 2000,
  });

  // Auto scroll to bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LiveStreamComment.create(data),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['live-stream-comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveStreamComment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-stream-comments'] });
      toast({ title: 'Comment deleted', description: 'The comment was removed successfully.' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to participate in the chat.', variant: 'destructive' });
      return;
    }

    const hasProfanity = BAD_WORDS.some(word => newComment.toLowerCase().includes(word));
    if (hasProfanity) {
      toast({ title: 'Message blocked', description: 'Please keep the chat clean and professional.', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      text: newComment.trim(),
      user_name: user.full_name || 'Anonymous',
      user_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'A')}&background=1e3a5a&color=c9a87c`,
      user_email: user.email
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-full flex flex-col h-full bg-[#1e3a5a]/40 border border-[#4a90b8]/30 rounded-xl shadow-lg overflow-hidden backdrop-blur-md">
      <div className="p-2 px-3 border-b border-[#4a90b8]/30 bg-[#0a1526]/50 flex items-center justify-between">
        <h4 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          💬 Campfire
        </h4>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{comments.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">No comments yet. Be the first to start the conversation!</div>
        ) : (
          <>
          {comments.map((c, idx) => (
            <React.Fragment key={c.id}>
            {/* Inject a poll message every 15 comments to simulate automated messages throughout the day */}
            {idx > 0 && idx % 15 === 0 && (
               <div className="my-4">
                 <LiveReactionPoll />
               </div>
            )}
            <div className="flex items-start gap-3 group">
              <img src={c.user_avatar} alt={c.user_name} className="w-8 h-8 rounded-full border border-slate-800 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#c9a87c] text-xs font-bold truncate">{c.user_name}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(c.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-slate-200 text-sm break-words mt-0.5 leading-snug">{c.text}</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => deleteMutation.mutate(c.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 text-slate-500 hover:text-red-400 transition-opacity bg-slate-900 rounded-md"
                  title="Delete comment (Admin)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            </React.Fragment>
          ))}
          {/* If less than 15 comments, show one at the end to ensure it's visible */}
          {comments.length < 15 && (
            <div className="my-4">
              <LiveReactionPoll />
            </div>
          )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-[#4a90b8]/30 bg-[#0a1526]/50 flex gap-2">
        <Input 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Say something..." : "Log in to chat..."}
          disabled={!user || createMutation.isPending}
          className="flex-1 bg-[#1e3a5a]/60 border-[#4a90b8]/30 text-white placeholder:text-slate-400 h-10 text-sm focus-visible:ring-[#c9a87c]"
          maxLength={200}
        />
        <Button 
          type="submit" 
          disabled={!user || !newComment.trim() || createMutation.isPending}
          className="h-10 px-4 bg-[#c9a87c] text-slate-950 hover:bg-[#c9a87c]/90 font-semibold"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
        </Button>
      </form>
    </div>
  );
}