import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Edit2, Trash2, MoreVertical, Send, PlusCircle, Clock, XCircle, Zap
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { PLATFORM_CONFIG, POST_STATUS_CONFIG } from "./publisherConfig";
import { publishNow } from "@/functions/publishNow";

const STATUS_TABS = ["all", "scheduled", "draft", "published", "failed"];

export default function PostQueue({ posts, channels, onEdit, onRefresh, onNewPost }) {
  const [activeTab, setActiveTab] = useState("all");

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: onRefresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledPost.update(id, data),
    onSuccess: onRefresh,
  });

  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    return posts.filter(p => p.status === activeTab);
  }, [posts, activeTab]);

  const counts = useMemo(() => {
    return STATUS_TABS.reduce((acc, tab) => {
      acc[tab] = tab === "all" ? posts.length : posts.filter(p => p.status === tab).length;
      return acc;
    }, {});
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-indigo-400" />
        </div>
        <p className="font-semibold text-slate-700 text-lg">Your queue is empty</p>
        <p className="text-sm text-slate-500 mt-1">Create your first post to get started</p>
        <Button onClick={onNewPost} className="mt-5 gap-2 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
          <PlusCircle className="w-4 h-4" /> Create Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors min-h-[36px] ${
                activeTab === tab
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
              {counts[tab] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Post Cards */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-10 text-center">
            <p className="text-slate-500">No {activeTab} posts</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              channels={channels}
              onEdit={() => onEdit(post)}
              onDelete={() => deleteMutation.mutate(post.id)}
              onCancel={() => updateMutation.mutate({ id: post.id, data: { status: "cancelled" } })}
              onPublishNow={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostCard({ post, channels, onEdit, onDelete, onCancel, onPublishNow }) {
  const [publishing, setPublishing] = useState(false);

  const handlePublishNow = async () => {
    setPublishing(true);
    await publishNow({ post_id: post.id });
    setPublishing(false);
    onPublishNow?.();
  };

  const statusCfg = POST_STATUS_CONFIG[post.status] || POST_STATUS_CONFIG.draft;
  const postChannels = (post.channel_ids || [])
    .map(id => channels.find(c => c.id === id))
    .filter(Boolean);

  const scheduledLabel = useMemo(() => {
    if (!post.scheduled_at) return null;
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow at ${format(d, "h:mm a")}`;
    return format(d, "MMM d 'at' h:mm a");
  }, [post.scheduled_at]);

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {/* Channel Avatars */}
        <div className="flex -space-x-2 shrink-0 mt-0.5">
          {postChannels.slice(0, 3).map(ch => {
            const cfg = PLATFORM_CONFIG[ch.platform];
            return (
              <div
                key={ch.id}
                title={ch.channel_name}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${cfg?.bg || "bg-slate-100"}`}
              >
                {cfg && <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />}
              </div>
            );
          })}
          {postChannels.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              +{postChannels.length - 3}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 line-clamp-3 leading-relaxed">{post.content}</p>

          {post.media_urls?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              📎 {post.media_urls.length} media file{post.media_urls.length !== 1 ? "s" : ""}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>

            {scheduledLabel && post.status === "scheduled" && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {scheduledLabel}
              </span>
            )}

            {postChannels.length > 0 && (
              <span className="text-xs text-slate-400">
                {postChannels.map(c => c.channel_name).join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 min-w-[44px] min-h-[44px]" aria-label="Post actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(post.status === "draft" || post.status === "scheduled") && (
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </DropdownMenuItem>
            )}
            {post.status === "scheduled" && (
              <DropdownMenuItem onClick={onCancel} className="gap-2 text-amber-600">
                <XCircle className="w-4 h-4" /> Cancel
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600">
              <Trash2 className="w-4 h-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}