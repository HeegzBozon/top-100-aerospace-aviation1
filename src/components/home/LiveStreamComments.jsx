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
    <div className="w-full flex flex-col h-full bg-[#0b3d91]/10 border border-[#4a90b8]/30 rounded-xl shadow-[0_0_30px_rgba(11,61,145,0.15)] overflow-hidden backdrop-blur-md relative">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0b3d91]/20 to-transparent pointer-events-none" />
      <div className="p-3 px-4 border-b border-[#4a90b8]/30 bg-[#020B1A]/80 backdrop-blur-md flex items-center justify-between relative z-10">
        <h4 className="text-blue-50 font-bold text-sm flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="tracking-wide">💬 Campfire</span>
        </h4>
        <span className="text-[10px] text-blue-200/50 uppercase tracking-widest font-bold">{comments.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-hide" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#4a90b8]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-blue-200/50 text-sm mt-10 font-medium">No comments yet. Be the first to start the conversation!</div>
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
            <div className="flex items-start gap-3 group hover:bg-white/[0.02] p-1.5 -mx-1.5 rounded-lg transition-colors">
              <img src={c.user_avatar} alt={c.user_name} className="w-8 h-8 rounded-full border-2 border-[#0b3d91]/50 shadow-[0_0_10px_rgba(11,61,145,0.3)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#c9a87c] text-xs font-bold truncate drop-shadow-[0_0_8px_rgba(201,168,124,0.3)]">{c.user_name}</span>
                  <span className="text-blue-300/40 text-[9px] font-medium tracking-wide">{new Date(c.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-blue-50/90 text-[13px] break-words mt-0.5 leading-relaxed">{c.text}</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => deleteMutation.mutate(c.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 text-blue-300/40 hover:text-red-400 transition-all bg-[#0b3d91]/20 hover:bg-[#0b3d91]/40 rounded-md"
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

      <form onSubmit={handleSubmit} className="p-3 border-t border-[#4a90b8]/20 bg-[#020B1A]/80 backdrop-blur-md flex gap-2 relative z-10 shadow-[0_-10px_30px_rgba(2,11,26,0.5)]">
        <Input 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Say something..." : "Log in to chat..."}
          disabled={!user || createMutation.isPending}
          className="flex-1 bg-[#0b3d91]/20 border-[#4a90b8]/30 text-white placeholder:text-blue-200/40 h-10 text-sm focus-visible:ring-[#4a90b8] focus-visible:border-[#4a90b8] transition-all rounded-lg"
          maxLength={200}
        />
        <Button 
          type="submit" 
          disabled={!user || !newComment.trim() || createMutation.isPending}
          className="h-10 px-5 bg-gradient-to-r from-[#4a90b8] to-[#0b3d91] hover:from-[#5ba5d0] hover:to-[#0d4ea6] text-white border border-[#4a90b8]/50 font-semibold rounded-lg shadow-[0_0_15px_rgba(74,144,184,0.3)] transition-all hover:shadow-[0_0_20px_rgba(74,144,184,0.5)]"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
        </Button>
      </form>
    </div>
  );
}