import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Edit2, Trash2, MoreVertical, Send, PlusCircle, Clock, XCircle, Zap, ChevronDown
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { PLATFORM_CONFIG, POST_STATUS_CONFIG } from "./publisherConfig";
import { publishNow } from "@/functions/publishNow";

const LANE_ORDER = ["scheduled", "draft", "publishing", "published", "failed"];
const ROLLING_WINDOW = 12;

const LANE_COLORS = {
  scheduled: "border-indigo-300 bg-indigo-50/40",
  draft:      "border-slate-300 bg-slate-50/40",
  publishing: "border-amber-300 bg-amber-50/40",
  published:  "border-emerald-300 bg-emerald-50/40",
  failed:     "border-red-300 bg-red-50/40",
};

const LANE_HEADER_COLORS = {
  scheduled: "bg-indigo-100 text-indigo-700",
  draft:      "bg-slate-100 text-slate-600",
  publishing: "bg-amber-100 text-amber-700",
  published:  "bg-emerald-100 text-emerald-700",
  failed:     "bg-red-100 text-red-600",
};

export default function PostQueue({ posts, channels, onEdit, onRefresh, onNewPost }) {
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: onRefresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledPost.update(id, data),
    onSuccess: onRefresh,
  });

  const laneMap = useMemo(() => {
    const map = {};
    LANE_ORDER.forEach(s => { map[s] = []; });
    posts.forEach(p => {
      if (map[p.status]) map[p.status].push(p);
    });
    return map;
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
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {LANE_ORDER.map(status => (
          <SwimLane
            key={status}
            status={status}
            posts={laneMap[status]}
            channels={channels}
            onEdit={onEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            onCancel={(id) => updateMutation.mutate({ id, data: { status: "cancelled" } })}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}

function SwimLane({ status, posts, channels, onEdit, onDelete, onCancel, onRefresh }) {
  const [visible, setVisible] = useState(ROLLING_WINDOW);
  const cfg = POST_STATUS_CONFIG[status];
  const headerCls = LANE_HEADER_COLORS[status];
  const laneCls = LANE_COLORS[status];
  const shown = posts.slice(0, visible);
  const hasMore = posts.length > visible;

  return (
    <div className={`flex flex-col w-72 shrink-0 rounded-xl border-2 ${laneCls} overflow-hidden`}>
      {/* Lane Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 ${headerCls}`}>
        <span className="font-semibold text-sm capitalize">{cfg?.label || status}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">
          {posts.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto max-h-[70vh]">
        {shown.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No posts</p>
        ) : (
          shown.map(post => (
            <PostCard
              key={post.id}
              post={post}
              channels={channels}
              onEdit={() => onEdit(post)}
              onDelete={() => onDelete(post.id)}
              onCancel={() => onCancel(post.id)}
              onPublishNow={onRefresh}
            />
          ))
        )}

        {hasMore && (
          <button
            onClick={() => setVisible(v => v + ROLLING_WINDOW)}
            className="flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-700 py-2 border border-dashed border-slate-300 rounded-lg transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Show more ({posts.length - visible})
          </button>
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

  const postChannels = (post.channel_ids || [])
    .map(id => channels.find(c => c.id === id))
    .filter(Boolean);

  const scheduledLabel = useMemo(() => {
    if (!post.scheduled_at) return null;
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  }, [post.scheduled_at]);

  return (
    <article className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Channel Icons Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex -space-x-1.5">
          {postChannels.slice(0, 4).map(ch => {
            const cfg = PLATFORM_CONFIG[ch.platform];
            return (
              <div
                key={ch.id}
                title={ch.channel_name}
                className={`w-6 h-6 rounded-full border border-white flex items-center justify-center ${cfg?.bg || "bg-slate-100"}`}
              >
                {cfg && <cfg.Icon className={`w-3 h-3 ${cfg.color}`} />}
              </div>
            );
          })}
          {postChannels.length > 4 && (
            <div className="w-6 h-6 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
              +{postChannels.length - 4}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7 min-w-[28px] min-h-[28px]" aria-label="Post actions">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(post.status === "draft" || post.status === "scheduled" || post.status === "failed") && (
              <DropdownMenuItem onClick={handlePublishNow} disabled={publishing} className="gap-2 text-indigo-600 font-medium">
                <Zap className="w-4 h-4" /> {publishing ? "Publishing…" : "Publish Now"}
              </DropdownMenuItem>
            )}
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

      {/* Content */}
      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">{post.content}</p>

      {post.media_urls?.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-1.5">
          📎 {post.media_urls.length} media
        </p>
      )}

      {/* Footer */}
      {scheduledLabel && post.status === "scheduled" && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-500 font-medium">
          <Clock className="w-3 h-3" /> {scheduledLabel}
        </div>
      )}
    </article>
  );
}