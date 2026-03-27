import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Check, Calendar, Send, ExternalLink, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import PostDetailModal from './PostDetailModal';

const STAGES = [
  { key: 'draft', label: 'Draft', icon: null, color: 'bg-slate-100 text-slate-700' },
  { key: 'reviewing', label: 'Reviewing', icon: Eye, color: 'bg-blue-100 text-blue-700' },
  { key: 'approved', label: 'Approved', icon: Check, color: 'bg-green-100 text-green-700' },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  { key: 'published', label: 'Published', icon: Send, color: 'bg-emerald-100 text-emerald-700' },
];

export default function EditorialPipeline({ userEmail }) {
  const queryClient = useQueryClient();
  const [expandedPost, setExpandedPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['scheduled-posts-pipeline', userEmail],
    queryFn: () => base44.entities.ScheduledPost.filter({ user_email: userEmail }, '-updated_date', 200),
    enabled: !!userEmail,
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, newStatus }) =>
      base44.entities.ScheduledPost.update(postId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts-pipeline'] });
      toast.success('Post status updated');
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  const getPostsForStage = (stageKey) => {
    return posts.filter(p => p.status === stageKey);
  };

  const movePost = async (postId, toStage, post) => {
    updateMutation.mutate({ postId, newStatus: toStage });

    // When moving to 'approved', publish the nominee's article on their profile page
    if (toStage === 'approved' && post?.nominee_id) {
      try {
        await base44.entities.Nominee.update(post.nominee_id, { article_status: 'published' });
        toast.success('Article published on nominee profile page');
      } catch (err) {
        toast.error(`Failed to publish profile: ${err.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAGES.map(stage => (
          <div
            key={stage.key}
            className="text-center p-3 rounded-lg border border-slate-200 bg-slate-50"
          >
            <p className="text-sm font-medium text-slate-700">{stage.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {getPostsForStage(stage.key).length}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max pr-4">
          {STAGES.map(stage => {
            const stageKey = stage.key;
            const stagePosts = getPostsForStage(stageKey);
            const Icon = stage.icon;

            return (
              <div
                key={stageKey}
                className="flex-shrink-0 w-80 bg-slate-50 rounded-xl border border-slate-200 p-4"
              >
                {/* Stage Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                  {Icon && <Icon className="w-4 h-4 text-slate-600" />}
                  <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                  <span className="ml-auto text-sm font-medium text-slate-600">
                    {stagePosts.length}
                  </span>
                </div>

                {/* Posts */}
                <div className="space-y-3 min-h-96">
                  {stagePosts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No posts
                    </div>
                  ) : (
                    stagePosts.map(post => (
                      <Card
                        key={post.id}
                        className="p-3 hover:shadow-md transition-shadow bg-white"
                        onClick={() => setSelectedPost(post)}
                      >
                        <div className="space-y-2">
                          <p className="font-medium text-slate-900 line-clamp-2 text-sm">
                            {post.title || 'Untitled'}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {post.channels?.slice(0, 2).map((ch, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {ch}
                              </Badge>
                            ))}
                            {post.channels?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.channels.length - 2}
                              </Badge>
                            )}
                          </div>
                          {post.scheduled_time && (
                            <p className="text-xs text-slate-500">
                              {new Date(post.scheduled_time).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {/* Move Actions & View Link */}
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 flex gap-1 flex-wrap">
                          {post.nominee_id && stageKey === 'approved' && (
                            <Link
                              to={`/Top100Women2025/${post.nominee_id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="w-full"
                            >
                              <Button
                                size="sm"
                                className="text-xs w-full gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Rocket className="w-3 h-3" /> Live Profile
                              </Button>
                            </Link>
                          )}
                          {post.nominee_id && stageKey !== 'approved' && (
                            <Link
                              to={`/Top100Women2025/${post.nominee_id}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs w-full gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </Button>
                            </Link>
                          )}
                          {STAGES.filter(s => s.key !== stageKey).slice(0, 2).map(nextStage => (
                            <Button
                              key={nextStage.key}
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                movePost(post.id, nextStage.key, post);
                              }}
                              disabled={updateMutation.isPending}
                              className="text-xs flex-1"
                            >
                              → {nextStage.label}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PostDetailModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}