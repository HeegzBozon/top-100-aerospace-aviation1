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
    <div className="w-full flex flex-col h-full bg-[#020B1A] border-2 border-[#4a90b8] rounded-xl shadow-[0_0_30px_rgba(11,61,145,0.4)] overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#4a90b8] bg-[#061e47] flex items-center justify-between shrink-0">
        <h4 className="text-white font-black text-xl flex items-center gap-2 tracking-widest uppercase">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          Campfire
        </h4>
        <span className="text-xs text-blue-100 uppercase tracking-widest font-bold bg-[#0b3d91] px-3 py-1.5 rounded-md border-2 border-[#4a90b8]">
          {comments.length} messages
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-[#020B1A] to-[#061e47]" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[#4a90b8]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-200/60">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <span className="text-[15px] font-bold">No comments yet. Be the first to spark the fire!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group">
                <img src={c.user_avatar} alt={c.user_name} className="w-10 h-10 rounded-full border-2 border-[#4a90b8] shrink-0 shadow-lg" />
                <div className="flex-1 min-w-0 bg-[#0b3d91] border-2 border-[#4a90b8] rounded-2xl rounded-tl-sm p-3.5 relative hover:bg-[#1e3a5a] transition-colors shadow-md">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-[#c9a87c] text-[15px] font-black truncate">{c.user_name}</span>
                    <span className="text-blue-200 text-[11px] font-bold tracking-widest uppercase shrink-0">
                      {new Date(c.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-white text-[15px] break-words leading-relaxed font-medium">{c.text}</p>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl transition-all transform hover:scale-110"
                      title="Delete comment (Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t-2 border-[#4a90b8] bg-[#061e47] shrink-0">
        <div className="flex gap-3">
          <Input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Join the conversation..." : "Log in to chat..."}
            disabled={!user || createMutation.isPending}
            className="flex-1 bg-[#020B1A] border-2 border-[#4a90b8] text-white placeholder:text-blue-200/60 h-12 text-[15px] focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#c9a87c] transition-colors rounded-xl px-4 font-medium"
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={!user || !newComment.trim() || createMutation.isPending}
            className="h-12 px-6 bg-[#c9a87c] hover:bg-[#b09269] text-[#020B1A] font-black text-[15px] tracking-widest uppercase rounded-xl border-none shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}