import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Save, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function PostDetailModal({ post, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post?.title || '');
  const [editedContent, setEditedContent] = useState(post?.content || '');
  const [comment, setComment] = useState('');

  const updateMutation = useMutation({
    mutationFn: ({ postId, data }) =>
      base44.entities.ScheduledPost.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts-pipeline'] });
      setIsEditing(false);
      toast.success('Post updated');
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      postId: post.id,
      data: {
        title: editedTitle,
        content: editedContent,
      },
    });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    // TODO: Implement comment entity and save
    toast.info('Comments coming soon');
    setComment('');
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Article Preview</DialogTitle>
          <DialogDescription>{post.status} • {new Date(post.updated_date).toLocaleDateString()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Article title"
            />
          ) : (
            <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
          )}

          {/* Content */}
          {showPublicPreview ? (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                {post.content}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPublicPreview(false)}
                className="w-full"
              >
                Back to Edit View
              </Button>
            </div>
          ) : isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-96 font-mono text-sm"
              placeholder="Article content"
            />
          ) : (
            <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-slate-700">{post.content}</pre>
            </div>
          )}

          {/* Actions */}
          {!showPublicPreview && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" /> Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(post.title);
                      setEditedContent(post.content);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPublicPreview(true)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" /> Preview Public
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Comments Section */}
          {!isEditing && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <h3 className="font-medium text-slate-900">Comments</h3>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}