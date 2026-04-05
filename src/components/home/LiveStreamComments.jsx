import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, MessageSquare, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
    <div className="w-full flex flex-col h-full bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1e3a5a] border border-[#c9a87c]/20 rounded-2xl shadow-[0_8px_32px_rgba(10,22,40,0.6)] overflow-hidden relative">
      {/* Subtle Constellation/Space Animations */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#c9a87c] rounded-full mix-blend-screen filter blur-[60px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#d4a090] rounded-full mix-blend-screen filter blur-[70px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_white] animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 right-1/3 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_5px_1px_white] animate-[ping_4s_ease-in-out_infinite_0.5s]" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-[#c9a87c] rounded-full shadow-[0_0_12px_2px_#c9a87c] animate-[ping_5s_ease-in-out_infinite_1s]" />
      </div>

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#c9a87c]/10 bg-white/5 backdrop-blur-sm flex items-center justify-between shrink-0 relative z-10">
        <h4 className="text-[#faf8f5] font-bold text-lg flex items-center gap-2 tracking-wide">
          <Flame className="w-5 h-5 text-[#d4a090] animate-pulse" />
          Campfire
        </h4>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide relative z-10 flex flex-col justify-end" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#c9a87c]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#c9a87c]/50">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">Be the first to spark the fire!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {comments.slice(-3).map((c) => (
              <div key={c.id} className="flex items-center gap-3 group px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-sm">
                <img src={c.user_avatar} alt={c.user_name} className="w-7 h-7 rounded-full border border-[#c9a87c]/50 shrink-0 shadow-lg" />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-[#c9a87c] text-sm font-bold shrink-0 truncate max-w-[120px]">{c.user_name}</span>
                  <span className="text-[#faf8f5] text-sm truncate opacity-90 font-medium">{c.text}</span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => deleteMutation.mutate(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400 rounded-full transition-all shrink-0"
                    title="Delete comment (Admin)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#c9a87c]/10 bg-white/5 backdrop-blur-sm shrink-0 relative z-10">
        <div className="flex gap-2">
          <Input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Tap in..." : "Log in to tap in..."}
            disabled={!user || createMutation.isPending}
            className="flex-1 bg-black/20 border border-[#c9a87c]/20 text-[#faf8f5] placeholder:text-[#faf8f5]/40 h-10 text-sm focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#c9a87c]/50 transition-all rounded-lg px-4"
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={!user || !newComment.trim() || createMutation.isPending}
            className="h-10 px-5 bg-gradient-to-r from-[#c9a87c] to-[#d4a090] hover:from-[#e8d4b8] hover:to-[#c9a87c] text-[#0a1628] font-bold text-sm rounded-lg border-none shadow-[0_0_15px_rgba(201,168,124,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}