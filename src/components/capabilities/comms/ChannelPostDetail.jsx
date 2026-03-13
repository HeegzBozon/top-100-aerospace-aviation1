import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowUp, MessageSquare, Eye, BookOpen, Edit2, Trash2, Archive, Pin, PinOff, MoreVertical, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const POST_TYPE_COLORS = {
  article: "bg-blue-50 text-blue-700",
  discussion: "bg-indigo-50 text-indigo-700",
  question: "bg-purple-50 text-purple-700",
  announcement: "bg-amber-50 text-amber-700",
};

function ReplyItem({ reply, currentUserEmail, onVote, depth = 0 }) {
  const hasUpvoted = reply.upvoted_by?.includes(currentUserEmail);
  const timeAgo = reply.created_date ? formatDistanceToNow(new Date(reply.created_date), { addSuffix: true }) : "";

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-8 border-l-2 border-gray-100 pl-4")}>
      <Avatar className="w-7 h-7 shrink-0 mt-1">
        <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
          {(reply.author_name || reply.author_email)?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-800">{reply.author_name || reply.author_email?.split("@")[0]}</span>
          <span className="text-[11px] text-gray-400">{timeAgo}</span>
        </div>
        <div
          className="mt-1 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: reply.content }}
        />
        <button
          onClick={() => onVote(reply.id)}
          className={cn(
            "mt-2 flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-lg transition-all min-h-[32px]",
            hasUpvoted ? "text-orange-500 bg-orange-50" : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
          )}
          aria-label={hasUpvoted ? "Remove upvote" : "Upvote reply"}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          {reply.upvoted_by?.length || 0}
        </button>
      </div>
    </div>
  );
}

function ReplyComposer({ onSubmit, isLoading }) {
  const [text, setText] = useState("");
  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onSubmit(text.trim());
    setText("");
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-600">Add a comment</p>
      <Textarea
        placeholder="What are your thoughts?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[80px] resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="h-8 text-xs bg-[#1e3a5a] hover:bg-[#2d5075] text-white gap-1.5"
        >
          <Send className="w-3 h-3" />
          {isLoading ? "Posting…" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

export default function ChannelPostDetail({ post, currentUserEmail, currentUserRole, onBack, onVote, onEdit, onDelete, onArchive, onPin, channelId, isReadonly }) {
  const qc = useQueryClient();
  const [replyLoading, setReplyLoading] = useState(false);

  const hasUpvoted = post.upvoted_by?.includes(currentUserEmail);
  const typeLabel = post.post_type?.charAt(0).toUpperCase() + post.post_type?.slice(1);
  const typeColor = POST_TYPE_COLORS[post.post_type] || POST_TYPE_COLORS.discussion;
  const publishedDate = post.published_date || post.created_date;
  const isOwn = post.author_email === currentUserEmail;
  const isAdmin = currentUserRole === "admin";

  // Fetch replies
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ["post-replies", post.id],
    queryFn: () => base44.entities.Post.filter({ channel_id: channelId, parent_id: post.id }, "created_date", 200),
    enabled: !!post.id && !!channelId,
    refetchInterval: 8000,
  });

  // Track view
  useEffect(() => {
    if (post.id) {
      base44.entities.Post.update(post.id, { view_count: (post.view_count || 0) + 1 }).catch(() => { });
    }
  }, [post.id]);

  const addReplyMutation = useMutation({
    mutationFn: async (text) => {
      await base44.entities.Post.create({
        title: `Re: ${post.title}`,
        content: text,
        post_type: "discussion",
        channel_id: channelId,
        author_email: currentUserEmail,
        parent_id: post.id,
      });
      await base44.entities.Post.update(post.id, { reply_count: (post.reply_count || 0) + 1 });
    },
    onSuccess: () => qc.invalidateQueries(["post-replies", post.id]),
  });

  const handleReply = async (text) => {
    setReplyLoading(true);
    await addReplyMutation.mutateAsync(text);
    setReplyLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1e3a5a] transition-colors min-h-[44px] px-1"
          aria-label="Back to posts"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to posts</span>
        </button>
        {(isOwn || isAdmin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isOwn && (
                <DropdownMenuItem onClick={() => onEdit(post)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Post
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <DropdownMenuItem onClick={() => onPin(post.id, post.is_pinned)}>
                  {post.is_pinned ? <PinOff className="w-3.5 h-3.5 mr-2" /> : <Pin className="w-3.5 h-3.5 mr-2" />}
                  {post.is_pinned ? "Unpin Post" : "Pin to top"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onArchive(post.id)} className="text-amber-600">
                <Archive className="w-3.5 h-3.5 mr-2" /> Archive Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-600">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Post Content */}
        <div className={cn("bg-white border border-gray-200 rounded-2xl overflow-hidden", post.post_type === "article" && "shadow-md")}>
          {/* Article accent bar */}
          {post.post_type === "article" && (
            <div className="h-1 w-full bg-gradient-to-r from-[#1e3a5a] via-blue-400 to-indigo-300" />
          )}
          {post.featured_image_url && (
            <div className="w-full aspect-[16/7] overflow-hidden">
              <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className={cn("p-5 sm:p-8", post.post_type === "article" && !post.featured_image_url && "pt-6")}>
            {/* Meta */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {post.post_type === "article" ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1e3a5a] text-white tracking-wide uppercase">
                  <BookOpen className="w-3 h-3" />
                  {typeLabel}
                </span>
              ) : (
                <Badge className={cn("text-[11px] px-2 py-0.5 font-semibold border-0", typeColor)}>
                  <BookOpen className="w-3 h-3 mr-1" />
                  {typeLabel}
                </Badge>
              )}
              {post.category && (
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {post.category}
                </span>
              )}
            </div>

            <h1 className={cn(
              "font-extrabold text-gray-900 leading-tight mb-4 tracking-tight",
              post.post_type === "article" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            )}>
              {post.title}
            </h1>

            {/* Divider for articles */}
            {post.post_type === "article" && <div className="h-px bg-gray-100 mb-4" />}

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Avatar className="w-8 h-8">
                <AvatarFallback className={cn(
                  "text-[11px] font-bold",
                  post.post_type === "article"
                    ? "bg-gradient-to-br from-[#1e3a5a] to-blue-400 text-white"
                    : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700"
                )}>
                  {(post.author_name || post.author_email)?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{post.author_name || post.author_email?.split("@")[0]}</span>
                <span className="text-[11px] text-gray-400">
                  {publishedDate ? format(new Date(publishedDate), "MMM d, yyyy") : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 ml-auto text-xs text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.view_count || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{post.reply_count || 0}</span>
              </div>
            </div>

            {/* Body */}
            <div
              className={cn(
                "max-w-none text-gray-800",
                post.post_type === "article"
                  ? "prose prose-base sm:prose-lg prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-blue-600 prose-strong:text-gray-900"
                  : "prose prose-sm sm:prose"
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Vote row */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => onVote(post.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all min-h-[44px]",
                  hasUpvoted ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                )}
                aria-pressed={hasUpvoted}
                aria-label={hasUpvoted ? "Remove upvote" : "Upvote post"}
              >
                <ArrowUp className="w-4 h-4" />
                {post.upvoted_by?.length || 0} {(post.upvoted_by?.length || 0) === 1 ? "upvote" : "upvotes"}
              </button>
            </div>
          </div>
        </div>

        {/* Reply Composer */}
        {!post.is_locked && !isReadonly && <ReplyComposer onSubmit={handleReply} isLoading={replyLoading} />}
        {(post.is_locked || isReadonly) && (
          <div className="text-center py-4 text-sm text-gray-400 bg-white border border-gray-100 rounded-xl">
            🔒 Comments are disabled on this post
          </div>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{replies.length} Comment{replies.length !== 1 ? "s" : ""}</p>
            {repliesLoading ? (
              <div className="text-sm text-gray-400 text-center py-4">Loading comments…</div>
            ) : (
              replies.map(reply => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserEmail={currentUserEmail}
                  onVote={onVote}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}