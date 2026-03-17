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

// Jab, Jab, Jab, Hook pattern — repeating across 12 slots
const SLOT_LABELS = Array.from({ length: ROLLING_WINDOW }, (_, i) => {
  const pos = i % 4; // 0=Jab,1=Jab,2=Jab,3=Hook
  return pos === 3 ? "Hook" : "Jab";
});

// Group indices into sections of 4 (JJJH)
const SECTIONS = [
  { label: "Section 1", slots: [0, 1, 2, 3] },
  { label: "Section 2", slots: [4, 5, 6, 7] },
  { label: "Section 3", slots: [8, 9, 10, 11] },
];

const SLOT_LABEL_STYLES = {
  Jab:  "bg-blue-50 text-blue-500 border border-blue-100",
  Hook: "bg-amber-50 text-amber-600 border border-amber-200 font-bold",
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

  // Map platform -> posts (ordered by scheduled_at, then created_date)
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

    // Sort each platform's posts by scheduled_at asc, nulls last
    PLATFORMS.forEach(p => {
      map[p].sort((a, b) => {
        if (!a.scheduled_at && !b.scheduled_at) return 0;
        if (!a.scheduled_at) return 1;
        if (!b.scheduled_at) return -1;
        return new Date(a.scheduled_at) - new Date(b.scheduled_at);
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
  const [page, setPage] = useState(0); // page * ROLLING_WINDOW = offset
  const cfg = PLATFORM_CONFIG[platform];

  const offset = page * ROLLING_WINDOW;
  const totalPages = Math.max(1, Math.ceil(posts.length / ROLLING_WINDOW));

  // Always exactly 12 slots; fill with null for empties
  const slots = useMemo(() => {
    return Array.from({ length: ROLLING_WINDOW }, (_, i) => posts[offset + i] || null);
  }, [posts, offset]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Column Header */}
      <div className={`flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 ${cfg?.bg || "bg-slate-50"}`}>
        {cfg && <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />}
        <span className="font-semibold text-sm text-slate-800">{cfg?.label || platform}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Sections */}
      <div className="flex-1 divide-y divide-slate-100">
        {SECTIONS.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section label */}
            <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{section.label}</span>
            </div>
            {/* 4 slots */}
            {section.slots.map((slotIdx) => (
              <PostSlot
                key={slotIdx}
                slotIndex={slotIdx}
                slotLabel={SLOT_LABELS[slotIdx]}
                post={slots[slotIdx]}
                channels={channels}
                onEdit={slots[slotIdx] ? () => onEdit(slots[slotIdx]) : undefined}
                onDelete={slots[slotIdx] ? () => onDelete(slots[slotIdx].id) : undefined}
                onCancel={slots[slotIdx] ? () => onCancel(slots[slotIdx].id) : undefined}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/40">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-medium"
          >
            <ChevronUp className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-[10px] text-slate-400">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-xs text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 font-medium"
          >
            Next <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function PostSlot({ slotIndex, slotLabel, post, channels, onEdit, onDelete, onCancel, onRefresh }) {
  const [publishing, setPublishing] = useState(false);
  const labelStyle = SLOT_LABEL_STYLES[slotLabel];

  const handlePublishNow = async () => {
    setPublishing(true);
    await publishNow({ post_id: post.id });
    setPublishing(false);
    onRefresh?.();
  };

  const statusCfg = post ? (POST_STATUS_CONFIG[post.status] || POST_STATUS_CONFIG.draft) : null;

  const scheduledLabel = useMemo(() => {
    if (!post?.scheduled_at) return null;
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  }, [post?.scheduled_at]);

  return (
    <div className={`group flex items-start gap-2 px-3 py-2.5 border-b border-slate-50 transition-colors ${post ? "hover:bg-slate-50/60" : "bg-slate-50/30"}`}>
      {/* Slot label */}
      <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${labelStyle}`}>
        {slotLabel}
      </span>

      {/* Content or empty state */}
      {post ? (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              {scheduledLabel && post.status === "scheduled" && (
                <span className="flex items-center gap-0.5 text-[9px] text-indigo-500 font-medium">
                  <Clock className="w-2 h-2" /> {scheduledLabel}
                </span>
              )}
              {post.media_urls?.length > 0 && (
                <span className="text-[9px] text-slate-400">📎 {post.media_urls.length}</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 min-w-[24px] min-h-[24px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Post actions"
              >
                <MoreVertical className="w-3 h-3" />
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
        </>
      ) : (
        <p className="text-[10px] text-slate-300 italic mt-0.5">Empty slot</p>
      )}
    </div>
  );
}