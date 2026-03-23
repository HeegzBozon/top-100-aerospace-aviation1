import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "@/entities/Message";
import { Conversation } from "@/entities/Conversation";
import { Plus, Flame, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
];

function sortPosts(posts, sort) {
  const scored = posts.map(p => ({
    ...p,
    _score: (p.upvoted_by?.length || 0) - (p.downvoted_by?.length || 0),
    _ts: new Date(p.created_date || 0).getTime(),
  }));
  if (sort === "new") return scored.sort((a, b) => b._ts - a._ts);
  if (sort === "top") return scored.sort((a, b) => b._score - a._score);
  // hot: wilson-like blend
  return scored.sort((a, b) => (b._score * 0.6 + b._ts / 1e10 * 0.4) - (a._score * 0.6 + a._ts / 1e10 * 0.4));
}

export default function PostFeed({ conversation, currentUser }) {
  const qc = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedEditPost, setSelectedEditPost] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sort, setSort] = useState("hot");

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ["messages", conversation?.id],
    queryFn: () => Message.filter({ conversation_id: conversation.id }, "created_date", 500),
    enabled: !!conversation?.id,
    refetchInterval: 8000,
  });

  // Top-level posts (is_post=true OR no parent_id and legacy messages)
  const posts = allMessages.filter(m => m.is_post || (!m.parent_id && !m.is_post && !m.depth));
  // Comments are non-posts with a parent_id
  const comments = allMessages.filter(m => m.parent_id);

  // Comments for selected post (all descendants)
  const postComments = selectedPost
    ? allMessages.filter(m => m.parent_id && m.id !== selectedPost.id && getAllDescendantIds(selectedPost.id, allMessages).includes(m.id) || m.parent_id === selectedPost.id)
    : [];

  const voteMutation = useMutation({
    mutationFn: async ({ msgId, dir }) => {
      const msg = allMessages.find(m => m.id === msgId);
      if (!msg) return;
      const email = currentUser.email;
      let upvoted_by = [...(msg.upvoted_by || [])];
      let downvoted_by = [...(msg.downvoted_by || [])];

      if (dir === "up") {
        if (upvoted_by.includes(email)) {
          upvoted_by = upvoted_by.filter(e => e !== email);
        } else {
          upvoted_by = [...upvoted_by.filter(e => e !== email), email];
          downvoted_by = downvoted_by.filter(e => e !== email);
        }
      } else {
        if (downvoted_by.includes(email)) {
          downvoted_by = downvoted_by.filter(e => e !== email);
        } else {
          downvoted_by = [...downvoted_by.filter(e => e !== email), email];
          upvoted_by = upvoted_by.filter(e => e !== email);
        }
      }
      await Message.update(msgId, { upvoted_by, downvoted_by });
    },
    onSuccess: () => qc.invalidateQueries(["messages", conversation?.id]),
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ title, body, flair }) => {
      const msg = await Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_avatar: currentUser.avatar_url,
        content: body || title,
        post_title: title,
        post_flair: flair || null,
        message_type: "text",
        is_post: true,
        depth: 0,
        upvoted_by: [],
        downvoted_by: [],
        read_by: [currentUser.email],
      });
      await Conversation.update(conversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: title,
      });
      return msg;
    },
    onSuccess: () => qc.invalidateQueries(["messages", conversation?.id]),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ text, parentId, depth }) => {
      // Update reply_count on parent
      const parent = allMessages.find(m => m.id === parentId);
      if (parent) await Message.update(parentId, { reply_count: (parent.reply_count || 0) + 1 });
      await Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        sender_avatar: currentUser.avatar_url,
        content: text,
        message_type: "text",
        parent_id: parentId,
        depth: depth || 1,
        is_post: false,
        upvoted_by: [],
        downvoted_by: [],
        read_by: [currentUser.email],
      });
    },
    onSuccess: () => qc.invalidateQueries(["messages", conversation?.id]),
  });

  const editPostMutation = useMutation({
    mutationFn: async ({ postId, title, body, flair }) => {
      await Message.update(postId, {
        post_title: title,
        content: body || title,
        post_flair: flair || null,
      });
    },
    onSuccess: () => qc.invalidateQueries(["messages", conversation?.id]),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      // Mark as deleted or soft-delete by clearing content
      await Message.update(postId, {
        content: "[deleted]",
        post_title: "[deleted]",
      });
    },
    onSuccess: () => qc.invalidateQueries(["messages", conversation?.id]),
  });

  const handleVote = (msgId, dir) => voteMutation.mutate({ msgId, dir });
  const handleComment = (text, parentId, depth) => addCommentMutation.mutateAsync({ text, parentId, depth });
  const handleEditPost = (post) => {
    // Pass to CreatePostModal in edit mode
    const editData = { id: post.id, title: post.post_title, body: post.content, flair: post.post_flair };
    setSelectedEditPost(editData);
    setCreateOpen(true);
  };
  const handleDeletePost = (postId) => {
    if (window.confirm("Delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  // Refresh selected post data from latest allMessages
  const livePost = selectedPost ? allMessages.find(m => m.id === selectedPost.id) : null;

  if (selectedPost && livePost) {
    const liveComments = buildDescendants(livePost.id, allMessages);
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PostDetail
          post={livePost}
          comments={liveComments}
          currentUserEmail={currentUser?.email}
          onVote={handleVote}
          onComment={handleComment}
          onBack={() => setSelectedPost(null)}
        />
      </div>
    );
  }

  const sorted = sortPosts(posts, sort);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F7F8FA' }}>
      {/* Forum header */}
      <div className="bg-white px-5 py-3 flex items-center justify-between gap-3 shrink-0" style={{ borderBottom: '1px solid #EAECF0' }}>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = sort === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-orange-500" : ""}`} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-8 text-xs gap-1.5 rounded-xl font-semibold"
          style={{ background: 'linear-gradient(135deg, #1e3a5a, #4a90b8)', color: 'white', border: 'none' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
        </Button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl w-full mx-auto">
        {isLoading && (
          <div className="text-center py-12 text-sm text-gray-400">Loading posts…</div>
        )}
        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No posts yet</p>
            <p className="text-gray-400 text-xs">Be the first to start the conversation</p>
            <Button onClick={() => setCreateOpen(true)} className="text-xs h-8 rounded-xl mt-2" style={{ background: 'linear-gradient(135deg, #1e3a5a, #4a90b8)', color: 'white' }}>
              Create First Post
            </Button>
          </div>
        )}
        {sorted.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserEmail={currentUser?.email}
            onVote={handleVote}
            onClick={() => setSelectedPost(post)}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        ))}
      </div>

      <CreatePostModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setSelectedEditPost(null);
        }}
        channelName={conversation?.name}
        editPost={selectedEditPost}
        onSubmit={({ title, body, flair }) => {
          if (selectedEditPost?.id) {
            editPostMutation.mutateAsync({ postId: selectedEditPost.id, title, body, flair });
            setSelectedEditPost(null);
          } else {
            createPostMutation.mutateAsync({ title, body, flair });
          }
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

// Helper: get all descendant messages of a post
function buildDescendants(postId, allMessages) {
  const result = [];
  const queue = [postId];
  while (queue.length) {
    const pid = queue.shift();
    const children = allMessages.filter(m => m.parent_id === pid);
    for (const c of children) {
      result.push(c);
      queue.push(c.id);
    }
  }
  return result;
}

function getAllDescendantIds(postId, allMessages) {
  return buildDescendants(postId, allMessages).map(m => m.id);
}