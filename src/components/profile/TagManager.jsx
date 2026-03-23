import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tag, Plus, ThumbsUp, ThumbsDown, X } from 'lucide-react';

const tagCategories = [
  { value: 'skill', label: 'Skill', color: 'bg-blue-100 text-blue-700' },
  { value: 'industry', label: 'Industry', color: 'bg-purple-100 text-purple-700' },
  { value: 'achievement', label: 'Achievement', color: 'bg-green-100 text-green-700' },
  { value: 'technology', label: 'Technology', color: 'bg-orange-100 text-orange-700' },
  { value: 'attribute', label: 'Attribute', color: 'bg-pink-100 text-pink-700' },
];

export default function TagManager({ nomineeId, user, isAdmin }) {
  const [tags, setTags] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('skill');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTags();
  }, [nomineeId]);

  const loadTags = async () => {
    try {
      const data = await base44.entities.NomineeTag.filter({ nominee_id: nomineeId, status: 'approved' });
      setTags(data.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)));
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    setLoading(true);
    try {
      await base44.entities.NomineeTag.create({
        nominee_id: nomineeId,
        tag_name: newTagName.trim(),
        category: newTagCategory,
        suggested_by: user.email,
        status: 'approved'
      });

      await base44.functions.invoke('awardStardust', {
        user_email: user.email,
        action_type: 'tag_suggestion'
      });

      toast.success('Tag added! +2 Stardust');
      setNewTagName('');
      setShowAddModal(false);
      await loadTags();
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (tag, isUpvote) => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const hasUpvoted = tag.upvoted_by?.includes(user.email);
      const hasDownvoted = tag.downvoted_by?.includes(user.email);

      let updateData = { ...tag };

      if (isUpvote) {
        if (hasUpvoted) {
          // Remove upvote
          updateData.upvotes = Math.max(0, tag.upvotes - 1);
          updateData.upvoted_by = tag.upvoted_by.filter(e => e !== user.email);
        } else {
          // Add upvote, remove downvote if exists
          updateData.upvotes = tag.upvotes + 1;
          updateData.upvoted_by = [...(tag.upvoted_by || []), user.email];
          if (hasDownvoted) {
            updateData.downvotes = Math.max(0, tag.downvotes - 1);
            updateData.downvoted_by = tag.downvoted_by.filter(e => e !== user.email);
          }
        }
      } else {
        if (hasDownvoted) {
          // Remove downvote
          updateData.downvotes = Math.max(0, tag.downvotes - 1);
          updateData.downvoted_by = tag.downvoted_by.filter(e => e !== user.email);
        } else {
          // Add downvote, remove upvote if exists
          updateData.downvotes = tag.downvotes + 1;
          updateData.downvoted_by = [...(tag.downvoted_by || []), user.email];
          if (hasUpvoted) {
            updateData.upvotes = Math.max(0, tag.upvotes - 1);
            updateData.upvoted_by = tag.upvoted_by.filter(e => e !== user.email);
          }
        }
      }

      await base44.entities.NomineeTag.update(tag.id, updateData);
      await loadTags();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      await base44.entities.NomineeTag.delete(tag.id);
      toast.success('Tag removed');
      await loadTags();
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const getCategoryColor = (category) => {
    return tagCategories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Community Tags
        </h4>
        {user && (
          <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add Tag
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No tags yet. Be the first to add one!</p>
        ) : (
          tags.map(tag => {
            const netScore = tag.upvotes - tag.downvotes;
            const hasUpvoted = tag.upvoted_by?.includes(user?.email);
            const hasDownvoted = tag.downvoted_by?.includes(user?.email);

            return (
              <div key={tag.id} className="flex items-center gap-1">
                <Badge className={`${getCategoryColor(tag.category)} flex items-center gap-2`}>
                  <span>{tag.tag_name}</span>
                  {netScore > 0 && <span className="text-xs">+{netScore}</span>}
                </Badge>
                {user && (
                  <div className="flex gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 w-6 p-0 ${hasUpvoted ? 'text-green-600' : 'text-gray-400'}`}
                      onClick={() => handleVote(tag, true)}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 w-6 p-0 ${hasDownvoted ? 'text-red-600' : 'text-gray-400'}`}
                      onClick={() => handleVote(tag, false)}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Community Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tag Name</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., AI/ML Expert, Propulsion Systems"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tagCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTag} disabled={loading || !newTagName.trim()}>
                Add Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}