import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, ThumbsUp, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function DiscussionPanel({ articleId }) {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: discussions = [], refetch } = useQuery({
    queryKey: ['article-discussions', articleId],
    queryFn: () => base44.entities.ArticleDiscussion.filter({ article_id: articleId }, '-created_date'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ArticleDiscussion.create({
        article_id: articleId,
        user_email: user.email,
        user_name: user.full_name,
        message: newMessage
      });
      setNewMessage('');
      refetch();
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (discussionId, upvotedBy) => {
    try {
      const user = await base44.auth.me();
      const hasUpvoted = upvotedBy?.includes(user.email);
      
      if (hasUpvoted) {
        await base44.entities.ArticleDiscussion.update(discussionId, {
          upvotes: (discussions.find(d => d.id === discussionId)?.upvotes || 1) - 1,
          upvoted_by: upvotedBy.filter(e => e !== user.email)
        });
      } else {
        await base44.entities.ArticleDiscussion.update(discussionId, {
          upvotes: (discussions.find(d => d.id === discussionId)?.upvotes || 0) + 1,
          upvoted_by: [...(upvotedBy || []), user.email]
        });
      }
      refetch();
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  return (
    <Card style={{ background: brandColors.cream }}>
      <CardHeader className="border-b" style={{ borderColor: `${brandColors.navyDeep}20` }}>
        <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
          <MessageCircle className="w-5 h-5" />
          Discussion ({discussions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* New Comment */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts or suggest improvements..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={loading || !newMessage.trim()}
            style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          {discussions.map(discussion => (
            <div key={discussion.id} className="flex gap-3 p-4 rounded-lg" style={{ background: 'white' }}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ background: `${brandColors.navyDeep}10` }}>
                  <User className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
                    {discussion.user_name}
                  </span>
                  <span className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>
                    {formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: `${brandColors.navyDeep}90` }}>
                  {discussion.message}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpvote(discussion.id, discussion.upvoted_by)}
                  className="text-xs"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {discussion.upvotes || 0}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}