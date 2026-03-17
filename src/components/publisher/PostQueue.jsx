import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Edit2, Trash2, MoreVertical, Send, PlusCircle, Clock, XCircle, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { PLATFORM_CONFIG, POST_STATUS_CONFIG } from "./publisherConfig";
import { publishNow } from "@/functions/publishNow";

const PLATFORMS = ["linkedin", "instagram", "threads"];
const ROLLING_WINDOW = 12;

export default function PostQueue({ posts, channels, onEdit, onRefresh, onNewPost }) {
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: onRefresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduledPost.update(id, data),
    onSuccess: onRefresh,
  });

  // Map platform -> posts that target at least one channel of that platform
  const platformPostMap = useMemo(() => {
    const map = {};
    PLATFORMS.forEach(p => { map[p] = []; });

    posts.forEach(post => {
      const postPlatforms = new Set(
        (post.channel_ids || [])
          .map(id => channels.find(c => c.id === id)?.platform)
          .filter(Boolean)
      );
      postPlatforms.forEach(platform => {
        if (map[platform]) map[platform].push(post);
      });
    });
    return map;
  }, [posts, channels]);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLATFORMS.map(platform => (
        <PlatformColumn
          key={platform}
          platform={platform}
          posts={platformPostMap[platform]}
          channels={channels}
          onEdit={onEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          onCancel={(id) => updateMutation.mutate({ id, data: { status: "cancelled" } })}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

function PlatformColumn({ platform, posts, channels, onEdit, onDelete, onCancel, onRefresh }) {
  const [visible, setVisible] = useState(ROLLING_WINDOW);
  const cfg = PLATFORM_CONFIG[platform];
  const shown = posts.slice(0, visible);
  const hasMore = posts.length > visible;
  const canCollapse = visible > ROLLING_WINDOW;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Column Header */}
      <div className={`flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 ${cfg?.bg || "bg-slate-50"}`}>
        {cfg && <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />}
        <span className="font-semibold text-sm text-slate-800 capitalize">{cfg?.label || platform}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Rows */}
      <div className="flex-1 divide-y divide-slate-50">
        {shown.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-10">No posts for {platform}</p>
        ) : (
          shown.map((post, idx) => (
            <PostRow
              key={post.id}
              post={post}
              index={idx + 1}
              platform={platform}
              channels={channels}
              onEdit={() => onEdit(post)}
              onDelete={() => onDelete(post.id)}
              onCancel={() => onCancel(post.id)}
              onPublishNow={onRefresh}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {(hasMore || canCollapse) && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50/40">
          {hasMore && (
            <button
              onClick={() => setVisible(v => v + ROLLING_WINDOW)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {Math.min(ROLLING_WINDOW, posts.length - visible)} more
            </button>
          )}
          {canCollapse && (
            <button
              onClick={() => setVisible(ROLLING_WINDOW)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto"
            >
              <ChevronUp className="w-3.5 h-3.5" /> Collapse
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PostRow({ post, index, channels, onEdit, onDelete, onCancel, onPublishNow }) {
  const [publishing, setPublishing] = useState(false);

  const handlePublishNow = async () => {
    setPublishing(true);
    await publishNow({ post_id: post.id });
    setPublishing(false);
    onPublishNow?.();
  };

  const statusCfg = POST_STATUS_CONFIG[post.status] || POST_STATUS_CONFIG.draft;

  const scheduledLabel = useMemo(() => {
    if (!post.scheduled_at) return null;
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  }, [post.scheduled_at]);

  return (
    <div className="group flex items-start gap-2 px-4 py-3 hover:bg-slate-50/60 transition-colors">
      {/* Index */}
      <span className="text-[10px] text-slate-300 font-mono mt-0.5 w-4 shrink-0">{index}</span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Status pill */}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </span>

          {/* Schedule time */}
          {scheduledLabel && post.status === "scheduled" && (
            <span className="flex items-center gap-0.5 text-[10px] text-indigo-500 font-medium">
              <Clock className="w-2.5 h-2.5" /> {scheduledLabel}
            </span>
          )}

          {/* Media count */}
          {post.media_urls?.length > 0 && (
            <span className="text-[10px] text-slate-400">📎 {post.media_urls.length}</span>
          )}
        </div>
      </div>

      {/* Action menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 min-w-[28px] min-h-[28px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Post actions"
          >
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
  );
}