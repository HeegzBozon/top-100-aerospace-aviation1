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

const LANE_ORDER = ["scheduled", "draft", "publishing", "published", "failed"];
const ROLLING_WINDOW = 12;

const LANE_ACCENT = {
  scheduled: "bg-indigo-500",
  draft:      "bg-slate-400",
  publishing: "bg-amber-500",
  published:  "bg-emerald-500",
  failed:     "bg-red-500",
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
    <div className="space-y-3">
      {LANE_ORDER.map(status => (
        laneMap[status].length > 0 && (
          <SwimLaneTable
            key={status}
            status={status}
            posts={laneMap[status]}
            channels={channels}
            onEdit={onEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            onCancel={(id) => updateMutation.mutate({ id, data: { status: "cancelled" } })}
            onRefresh={onRefresh}
          />
        )
      ))}
    </div>
  );
}

function SwimLaneTable({ status, posts, channels, onEdit, onDelete, onCancel, onRefresh }) {
  const [visible, setVisible] = useState(ROLLING_WINDOW);
  const cfg = POST_STATUS_CONFIG[status];
  const accent = LANE_ACCENT[status];
  const shown = posts.slice(0, visible);
  const hasMore = posts.length > visible;
  const canCollapse = visible > ROLLING_WINDOW;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Lane Header */}
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100`}>
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${accent}`} />
        <span className="font-semibold text-sm text-slate-800 capitalize">{cfg?.label || status}</span>
        <span className="text-xs text-slate-400 font-medium">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-4 py-2 font-medium text-slate-500 w-8">#</th>
              <th className="text-left px-4 py-2 font-medium text-slate-500">Content</th>
              <th className="text-left px-4 py-2 font-medium text-slate-500 w-28">Channels</th>
              <th className="text-left px-4 py-2 font-medium text-slate-500 w-32">Scheduled</th>
              <th className="text-left px-4 py-2 font-medium text-slate-500 w-20">Media</th>
              <th className="px-4 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {shown.map((post, idx) => (
              <PostRow
                key={post.id}
                post={post}
                index={idx + 1}
                channels={channels}
                onEdit={() => onEdit(post)}
                onDelete={() => onDelete(post.id)}
                onCancel={() => onCancel(post.id)}
                onPublishNow={onRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {(hasMore || canCollapse) && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50/40">
          {hasMore && (
            <button
              onClick={() => setVisible(v => v + ROLLING_WINDOW)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Show next {Math.min(ROLLING_WINDOW, posts.length - visible)}
            </button>
          )}
          {canCollapse && (
            <button
              onClick={() => setVisible(ROLLING_WINDOW)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse
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

  const postChannels = (post.channel_ids || [])
    .map(id => channels.find(c => c.id === id))
    .filter(Boolean);

  const scheduledLabel = useMemo(() => {
    if (!post.scheduled_at) return "—";
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  }, [post.scheduled_at]);

  return (
    <tr className="hover:bg-slate-50/60 transition-colors group">
      {/* Index */}
      <td className="px-4 py-2.5 text-slate-300 font-mono">{index}</td>

      {/* Content */}
      <td className="px-4 py-2.5 max-w-xs">
        <p className="text-slate-700 line-clamp-2 leading-relaxed">{post.content}</p>
      </td>

      {/* Channels */}
      <td className="px-4 py-2.5">
        <div className="flex -space-x-1.5">
          {postChannels.slice(0, 5).map(ch => {
            const cfg = PLATFORM_CONFIG[ch.platform];
            return (
              <div
                key={ch.id}
                title={ch.channel_name}
                className={`w-5 h-5 rounded-full border border-white flex items-center justify-center ${cfg?.bg || "bg-slate-100"}`}
              >
                {cfg && <cfg.Icon className={`w-2.5 h-2.5 ${cfg.color}`} />}
              </div>
            );
          })}
          {postChannels.length > 5 && (
            <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
              +{postChannels.length - 5}
            </div>
          )}
        </div>
      </td>

      {/* Scheduled */}
      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
        {post.status === "scheduled" && post.scheduled_at ? (
          <span className="flex items-center gap-1 text-indigo-500 font-medium">
            <Clock className="w-3 h-3 shrink-0" /> {scheduledLabel}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Media */}
      <td className="px-4 py-2.5 text-slate-400">
        {post.media_urls?.length > 0 ? `📎 ${post.media_urls.length}` : "—"}
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 min-w-[28px] min-h-[28px] opacity-0 group-hover:opacity-100 transition-opacity"
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
      </td>
    </tr>
  );
}