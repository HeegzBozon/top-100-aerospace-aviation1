import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Flame, Clock, TrendingUp, Search, Filter, ListChecks, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChannelPostCard from "./ChannelPostCard";
import ChannelPostDetail from "./ChannelPostDetail";
import CreateChannelPostModal from "./CreateChannelPostModal";
import MovePostModal from "./MovePostModal";

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", Icon: Flame },
  { key: "new", label: "New", Icon: Clock },
  { key: "top", label: "Top", Icon: TrendingUp },
];

const POST_TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "article", label: "Articles" },
  { key: "discussion", label: "Discussions" },
  { key: "question", label: "Questions" },
  { key: "announcement", label: "Announcements" },
];

function sortPosts(posts, sort) {
  if (sort === "new") return [...posts].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  if (sort === "top") return [...posts].sort((a, b) => (b.upvoted_by?.length || 0) - (a.upvoted_by?.length || 0));
  // hot: blend of votes + recency
  return [...posts].sort((a, b) => {
    const aScore = (a.upvoted_by?.length || 0) * 0.6 + new Date(a.created_date).getTime() / 1e12 * 0.4;
    const bScore = (b.upvoted_by?.length || 0) * 0.6 + new Date(b.created_date).getTime() / 1e12 * 0.4;
    return bScore - aScore;
  });
}

export default function ChannelPostFeed({ conversation, currentUser }) {
  const qc = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sort, setSort] = useState("hot");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [postToMove, setPostToMove] = useState(null);

  const canMove = currentUser?.role === 'admin' && (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_post_moving_enabled') !== 'false' : true);

  const channelId = conversation?.id;
  const isAnnouncementsChannel = conversation?.name?.toLowerCase() === 'announcements';
  const isAdmin = currentUser?.role === 'admin';
  const isReadOnlyFeed = isAnnouncementsChannel && !isAdmin;

  // Only fetch top-level posts (no parent_id)
  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ["channel-posts", channelId],
    queryFn: () => base44.entities.Post.filter({ channel_id: channelId }, "-created_date", 200),
    enabled: !!channelId,
    refetchInterval: 10000,
  });

  // Separate root posts from replies
  const rootPosts = useMemo(
    () => allPosts.filter(p => !p.parent_id),
    [allPosts]
  );

  const filtered = useMemo(() => {
    let list = rootPosts;
    if (typeFilter !== "all") list = list.filter(p => p.post_type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q)
      );
    }
    return sortPosts(list, sort);
  }, [rootPosts, typeFilter, search, sort]);

  const voteMutation = useMutation({
    mutationFn: async (postId) => {
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;
      const email = currentUser.email;
      const upvoted_by = post.upvoted_by?.includes(email)
        ? post.upvoted_by.filter(e => e !== email)
        : [...(post.upvoted_by || []), email];
      await base44.entities.Post.update(postId, { upvoted_by, upvotes: upvoted_by.length });
    },
    onSuccess: () => qc.invalidateQueries(["channel-posts", channelId]),
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ title, content, excerpt, post_type, category, featured_image_url }) => {
      await base44.entities.Post.create({
        title,
        content,
        excerpt,
        post_type,
        category,
        featured_image_url,
        channel_id: channelId,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        published_date: new Date().toISOString(),
        upvoted_by: [],
        upvotes: 0,
        reply_count: 0,
        view_count: 0,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(["channel-posts", channelId]);
      setCreateOpen(false);
    },
  });

  const editPostMutation = useMutation({
    mutationFn: async ({ id, title, content, excerpt, post_type, category, featured_image_url }) => {
      await base44.entities.Post.update(id, { title, content, excerpt, post_type, category, featured_image_url });
    },
    onSuccess: () => {
      qc.invalidateQueries(["channel-posts", channelId]);
      setCreateOpen(false);
      setEditPost(null);
      // Refresh selected post if we just edited it
      if (selectedPost?.id === editPost?.id) {
        const updated = allPosts.find(p => p.id === editPost?.id);
        if (updated) setSelectedPost(updated);
      }
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => base44.entities.Post.delete(postId),
    onSuccess: () => {
      qc.invalidateQueries(["channel-posts", channelId]);
      if (selectedPost) setSelectedPost(null);
    },
  });

  const movePostMutation = useMutation({
    mutationFn: async (targetChannelId) => {
      const ids = postToMove ? [postToMove.id] : Array.from(selectedPosts);
      await Promise.all(ids.map(id => base44.entities.Post.update(id, { channel_id: targetChannelId })));
    },
    onSuccess: () => {
      qc.invalidateQueries(["channel-posts", channelId]);
      setMoveModalOpen(false);
      setPostToMove(null);
      setSelectedPosts(new Set());
      setIsBulkMode(false);
    },
  });

  const handleSubmit = (data) => {
    if (editPost?.id) {
      editPostMutation.mutate({ id: editPost.id, ...data });
    } else {
      createPostMutation.mutate(data);
    }
  };

  const handleEdit = (post) => {
    setEditPost(post);
    setCreateOpen(true);
    setSelectedPost(null);
  };

  const handleDelete = (postId) => {
    if (window.confirm("Delete this post? This cannot be undone.")) {
      deletePostMutation.mutate(postId);
    }
  };

  // Live post data for detail view
  const livePost = selectedPost ? allPosts.find(p => p.id === selectedPost.id) || selectedPost : null;

  if (selectedPost && livePost) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChannelPostDetail
          post={livePost}
          channelId={channelId}
          currentUserEmail={currentUser?.email}
          currentUserRole={currentUser?.role}
          onBack={() => setSelectedPost(null)}
          onVote={(id) => voteMutation.mutate(id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isReadonly={isReadOnlyFeed}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Feed Header */}
      <div className="bg-white px-4 py-3 shrink-0 border-b border-gray-100 space-y-3">
        {/* Sort + New Post Row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {SORT_OPTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${sort === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${sort === key ? "text-orange-500" : ""}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          {canMove && (
            <Button
              onClick={() => { setIsBulkMode(!isBulkMode); setSelectedPosts(new Set()); }}
              variant="outline"
              className={`h-9 text-xs gap-1.5 rounded-xl ml-auto border-gray-200 transition-colors ${isBulkMode ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isBulkMode ? "Cancel" : "Bulk Edit"}</span>
            </Button>
          )}
          {!isReadOnlyFeed && (
            <Button
              onClick={() => { setEditPost(null); setCreateOpen(true); }}
              className={`h-9 text-xs gap-1.5 rounded-xl font-semibold bg-[#1e3a5a] hover:bg-[#2d5075] text-white border-0 ${!canMove ? "ml-auto" : "ml-2"}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
            </Button>
          )}
        </div>

        {/* Search + Type Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <div className="relative shrink-0 flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {POST_TYPE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[32px] ${typeFilter === key
                  ? "bg-[#1e3a5a] text-white"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3 max-w-2xl w-full mx-auto">
        {isLoading && (
          <div className="text-center py-12 text-sm text-gray-400">Loading posts…</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <Plus className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">
              {search || typeFilter !== "all" ? "No matching posts found" : "No posts yet"}
            </p>
            {!search && typeFilter === "all" && !isReadOnlyFeed && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="text-xs h-8 rounded-xl mt-2 bg-[#1e3a5a] hover:bg-[#2d5075] text-white"
              >
                Create First Post
              </Button>
            )}
          </div>
        )}
        {
          filtered.map(post => (
            <ChannelPostCard
              key={post.id}
              post={post}
              currentUserEmail={currentUser?.email}
              onVote={(id) => voteMutation.mutate(id)}
              onClick={() => !isBulkMode && setSelectedPost(post)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canMove={canMove}
              onMove={(p) => { setPostToMove(p); setMoveModalOpen(true); }}
              isBulkMode={isBulkMode}
              isChecked={selectedPosts.has(post.id)}
              onToggleCheck={(id) => {
                const s = new Set(selectedPosts);
                if (s.has(id)) s.delete(id); else s.add(id);
                setSelectedPosts(s);
              }}
            />
          ))
        }

        {
          isBulkMode && selectedPosts.size > 0 && (
            <div className="sticky bottom-4 mt-8 mx-auto w-fit bg-white border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-5 py-3 flex items-center gap-5 z-20 animate-in slide-in-from-bottom-5">
              <span className="text-[13px] font-bold text-[#1e3a5a]">{selectedPosts.size} {selectedPosts.size === 1 ? "Post" : "Posts"} Selected</span>
              <Button size="sm" onClick={() => { setPostToMove(null); setMoveModalOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5 h-8 rounded-xl font-semibold">
                <MoveRight className="w-3.5 h-3.5" /> Move
              </Button>
            </div>
          )
        }
      </div >

      <CreateChannelPostModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditPost(null); }}
        onSubmit={handleSubmit}
        editPost={editPost}
        channelName={conversation?.name}
        currentUser={currentUser}
      />

      <MovePostModal
        open={moveModalOpen}
        onClose={() => { setMoveModalOpen(false); setPostToMove(null); }}
        onConfirm={(cid) => movePostMutation.mutate(cid)}
        postCount={postToMove ? 1 : selectedPosts.size}
      />
    </div >
  );
}