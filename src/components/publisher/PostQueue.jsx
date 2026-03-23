import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Edit2, Trash2, MoreVertical, Clock, XCircle, Zap, ChevronDown, ChevronUp, Plus
} from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { PLATFORM_CONFIG } from "./publisherConfig";
import { publishNow } from "@/functions/publishNow";

const PLATFORMS = ["linkedin", "instagram", "threads"];
const ROLLING_WINDOW = 12;

const SLOT_LABELS = Array.from({ length: ROLLING_WINDOW }, (_, i) => (i % 4 === 3 ? "Hook" : "Jab"));

const HERO_STEPS = [
  "Ordinary World", "Call to Adventure", "Refusal of the Call", "Meeting the Mentor",
  "Crossing the Threshold", "Tests, Allies & Enemies", "Approach the Inmost Cave",
  "The Ordeal", "Reward", "The Road Back", "Resurrection", "Return with the Elixir",
];

const SECTIONS = [
  { label: "Act I — Departure", slots: [0, 1, 2, 3] },
  { label: "Act II — Initiation", slots: [4, 5, 6, 7] },
  { label: "Act III — Return", slots: [8, 9, 10, 11] },
];

// Rose gold for Hook, navy tint for Jab
const SLOT_STYLES = {
  Jab:  { bg: "rgba(123,159,212,0.12)", text: "#7b9fd4", border: "rgba(123,159,212,0.2)" },
  Hook: { bg: "rgba(201,168,124,0.15)", text: "#c9a87c", border: "rgba(201,168,124,0.3)" },
};

const STATUS_STYLES = {
  draft:      { bg: "rgba(255,255,255,0.06)", color: "rgba(232,220,200,0.4)", label: "Draft" },
  scheduled:  { bg: "rgba(123,159,212,0.15)", color: "#7b9fd4", label: "Scheduled" },
  publishing: { bg: "rgba(201,168,124,0.15)", color: "#c9a87c", label: "Publishing…" },
  published:  { bg: "rgba(109,191,138,0.15)", color: "#6dbf8a", label: "Published" },
  failed:     { bg: "rgba(220,80,80,0.12)", color: "#e07070", label: "Failed" },
  cancelled:  { bg: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", label: "Cancelled" },
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

  const platformPostMap = useMemo(() => {
    const map = {};
    PLATFORMS.forEach(p => { map[p] = []; });
    posts.forEach(post => {
      const platforms = new Set(
        (post.channel_ids || []).map(id => channels.find(c => c.id === id)?.platform).filter(Boolean)
      );
      platforms.forEach(platform => { if (map[platform]) map[platform].push(post); });
    });
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
          onNewPost={onNewPost}
        />
      ))}
    </div>
  );
}

function PlatformColumn({ platform, posts, channels, onEdit, onDelete, onCancel, onRefresh, onNewPost }) {
  const [page, setPage] = useState(0);
  const cfg = PLATFORM_CONFIG[platform];
  const offset = page * ROLLING_WINDOW;
  const totalPages = Math.max(1, Math.ceil(posts.length / ROLLING_WINDOW));

  const slots = useMemo(() => (
    Array.from({ length: ROLLING_WINDOW }, (_, i) => posts[offset + i] || null)
  ), [posts, offset]);

  const platformAccents = {
    linkedin:  { glow: "rgba(123,159,212,0.06)", border: "rgba(123,159,212,0.15)", iconColor: "#7b9fd4" },
    instagram: { glow: "rgba(201,168,124,0.06)", border: "rgba(201,168,124,0.15)", iconColor: "#c9a87c" },
    threads:   { glow: "rgba(232,220,200,0.04)", border: "rgba(232,220,200,0.1)",  iconColor: "rgba(232,220,200,0.6)" },
  };
  const accent = platformAccents[platform] || platformAccents.threads;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col border"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)", borderColor: accent.border }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ background: accent.glow, borderColor: accent.border }}>
        {cfg && <cfg.Icon className="w-4 h-4" style={{ color: accent.iconColor }} />}
        <span className="font-semibold text-sm" style={{ color: "rgba(232,220,200,0.85)" }}>{cfg?.label || platform}</span>
        <span className="ml-auto text-xs font-medium" style={{ color: "rgba(232,220,200,0.3)" }}>
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sections */}
      <div className="flex-1 divide-y divide-white/[0.04]">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-4 py-1.5 border-b border-white/[0.04]" style={{ background: "rgba(255,255,255,0.015)" }}>
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "rgba(201,168,124,0.5)" }}>
                {section.label}
              </span>
            </div>
            {section.slots.map((slotIdx) => (
              <PostSlot
                key={slotIdx}
                slotIndex={slotIdx}
                slotLabel={SLOT_LABELS[slotIdx]}
                heroStep={HERO_STEPS[slotIdx]}
                post={slots[slotIdx]}
                channels={channels}
                onEdit={slots[slotIdx] ? () => onEdit(slots[slotIdx]) : undefined}
                onDelete={slots[slotIdx] ? () => onDelete(slots[slotIdx].id) : undefined}
                onCancel={slots[slotIdx] ? () => onCancel(slots[slotIdx].id) : undefined}
                onRefresh={onRefresh}
                onCreatePost={!slots[slotIdx] ? onNewPost : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-opacity"
            style={{ color: "#c9a87c" }}
          >
            <ChevronUp className="w-3 h-3" /> Prev
          </button>
          <span className="text-[10px]" style={{ color: "rgba(232,220,200,0.25)" }}>{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-xs disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-opacity"
            style={{ color: "#c9a87c" }}
          >
            Next <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function PostSlot({ slotIndex, slotLabel, heroStep, post, channels, onEdit, onDelete, onCancel, onRefresh, onCreatePost }) {
  const [publishing, setPublishing] = useState(false);
  const slotStyle = SLOT_STYLES[slotLabel];
  const statusStyle = post ? (STATUS_STYLES[post.status] || STATUS_STYLES.draft) : null;

  const handlePublishNow = async () => {
    setPublishing(true);
    await publishNow({ post_id: post.id });
    setPublishing(false);
    onRefresh?.();
  };

  const scheduledLabel = useMemo(() => {
    if (!post?.scheduled_at) return null;
    const d = new Date(post.scheduled_at);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  }, [post?.scheduled_at]);

  return (
    <div
      className="group flex items-start gap-2 px-3 py-2.5 border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
    >
      {/* Slot label */}
      <div className="flex flex-col items-start gap-0.5 shrink-0 mt-0.5 w-[58px]">
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
          style={{ background: slotStyle.bg, color: slotStyle.text, border: `1px solid ${slotStyle.border}` }}
        >
          {slotLabel}
        </span>
        <span className="text-[8px] leading-tight" style={{ color: "rgba(232,220,200,0.25)" }}>{heroStep}</span>
      </div>

      {post ? (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "rgba(232,220,200,0.7)" }}>
              {post.content}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
              {scheduledLabel && post.status === "scheduled" && (
                <span className="flex items-center gap-0.5 text-[9px] font-medium" style={{ color: "#7b9fd4" }}>
                  <Clock className="w-2 h-2" /> {scheduledLabel}
                </span>
              )}
              {post.media_urls?.length > 0 && (
                <span className="text-[9px]" style={{ color: "rgba(232,220,200,0.3)" }}>📎 {post.media_urls.length}</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 min-w-[24px] min-h-[24px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                style={{ color: "rgba(232,220,200,0.5)" }}
                aria-label="Post actions"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {(post.status === "draft" || post.status === "scheduled" || post.status === "failed") && (
                <DropdownMenuItem onClick={handlePublishNow} disabled={publishing} className="gap-2 font-medium text-blue-600">
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
        <button
          onClick={onCreatePost}
          className="flex-1 text-left text-[10px] italic flex items-center gap-1 mt-0.5 min-h-[20px] transition-colors group/add"
          style={{ color: "rgba(232,220,200,0.2)" }}
          aria-label="Create post for this slot"
        >
          <Plus className="w-2.5 h-2.5 group-hover/add:text-[#c9a87c] transition-colors" />
          <span className="group-hover/add:text-[#c9a87c] transition-colors">Create post</span>
        </button>
      )}
    </div>
  );
}