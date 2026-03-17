import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { linkedInCommunity } from "@/functions/linkedInCommunity";
import { ChevronDown, ChevronUp, ThumbsUp, MessageSquare, Send, Loader2, Heart, Lightbulb, HandHeart, Laugh, Frown } from "lucide-react";
import { format } from "date-fns";

const REACTIONS = [
  { type: "LIKE",       icon: ThumbsUp,  label: "Like",      color: "#7b9fd4" },
  { type: "CELEBRATE",  icon: HandHeart, label: "Celebrate", color: "#6dbf8a" },
  { type: "SUPPORT",    icon: Heart,     label: "Support",   color: "#e07a5f" },
  { type: "LOVE",       icon: Heart,     label: "Love",      color: "#e07a5f" },
  { type: "INSIGHTFUL", icon: Lightbulb, label: "Insightful",color: "#c9a87c" },
  { type: "FUNNY",      icon: Laugh,     label: "Funny",     color: "#a78bfa" },
];

function extractPostText(post) {
  return post?.specificContent?.["com.linkedin.ugc.ShareContent"]
    ?.shareCommentary?.text
    || post?.specificContent?.["com.linkedin.ugc.ShareContent"]
    ?.shareMediaCategory
    || "(No text)";
}

function formatLiDate(timestamp) {
  if (!timestamp) return "";
  try { return format(new Date(timestamp), "MMM d, h:mm a"); } catch { return ""; }
}

export default function CommunityPostCard({ post, authorUrn }) {
  const [expanded, setExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // null = reply to post, or comment_urn
  const queryClient = useQueryClient();

  const postUrn = post.id;
  const text = extractPostText(post);
  const created = formatLiDate(post.created?.time);

  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ["linkedin-activity", postUrn],
    queryFn: () => linkedInCommunity({ action: "get_activity", post_urn: postUrn }),
    enabled: expanded,
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });

  const comments  = activity?.comments  || [];
  const reactions = activity?.reactions || [];

  const reactionCounts = reactions.reduce((acc, r) => {
    const t = r.reactionType || "LIKE";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const replyMutation = useMutation({
    mutationFn: () => linkedInCommunity({
      action: "reply_comment",
      post_urn: postUrn,
      author_urn: authorUrn,
      comment_urn: replyTarget || undefined,
      reply_text: replyText,
    }),
    onSuccess: () => {
      setReplyText("");
      setReplyTarget(null);
      queryClient.invalidateQueries({ queryKey: ["linkedin-activity", postUrn] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: (reactionType) => linkedInCommunity({
      action: "react",
      post_urn: postUrn,
      author_urn: authorUrn,
      reaction_type: reactionType,
    }),
    onSuccess: () => {
      setShowReactions(false);
      queryClient.invalidateQueries({ queryKey: ["linkedin-activity", postUrn] });
    },
  });

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Post header */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "rgba(232,220,200,0.75)" }}>
              {text}
            </p>
            {created && (
              <p className="text-[10px] mt-1.5" style={{ color: "rgba(232,220,200,0.25)" }}>{created}</p>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-xl shrink-0 transition-colors hover:bg-white/5 min-h-[36px]"
            style={{ color: "rgba(123,159,212,0.7)", border: "1px solid rgba(123,159,212,0.15)" }}
            aria-label={expanded ? "Collapse" : "View comments & reactions"}
          >
            <MessageSquare className="w-3 h-3" />
            {comments.length > 0 ? comments.length : ""}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Reaction summary bar */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {Object.entries(reactionCounts).map(([type, count]) => {
              const cfg = REACTIONS.find(r => r.type === type);
              const Icon = cfg?.icon || ThumbsUp;
              return (
                <span
                  key={type}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${cfg?.color}18`, color: cfg?.color || "#7b9fd4" }}
                >
                  <Icon className="w-2.5 h-2.5" /> {count}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded: activity */}
      {expanded && (
        <div
          className="border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {loadingActivity ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: "rgba(201,168,124,0.4)" }} />
            </div>
          ) : (
            <div className="px-4 py-3 space-y-3">
              {/* React button */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(r => !r)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5 min-h-[36px]"
                  style={{ color: "rgba(123,159,212,0.6)", border: "1px solid rgba(123,159,212,0.12)" }}
                >
                  <ThumbsUp className="w-3 h-3" />
                  React
                </button>
                {showReactions && (
                  <div
                    className="absolute left-0 top-10 z-10 flex items-center gap-1 p-2 rounded-2xl border shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #101828, #0f1a2e)",
                      borderColor: "rgba(255,255,255,0.1)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    {REACTIONS.map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        onClick={() => reactMutation.mutate(type)}
                        disabled={reactMutation.isPending}
                        title={label}
                        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 hover:bg-white/10"
                        aria-label={`React with ${label}`}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments list */}
              {comments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(201,168,124,0.5)" }}>
                    Comments ({comments.length})
                  </p>
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id || comment.$URN}
                      comment={comment}
                      onReply={() => {
                        setReplyTarget(comment.id || comment.$URN);
                        setReplyText(`@${comment.actor?.split(":").pop() || ""} `);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Reply box */}
              <div
                className="rounded-xl border p-3 space-y-2"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                {replyTarget && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "rgba(123,159,212,0.6)" }}>
                      Replying to comment
                    </span>
                    <button
                      onClick={() => { setReplyTarget(null); setReplyText(""); }}
                      className="text-[10px] hover:underline"
                      style={{ color: "rgba(224,122,95,0.6)" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={replyTarget ? "Write a reply…" : "Write a comment on this post…"}
                  rows={2}
                  className="w-full text-xs outline-none resize-none rounded-lg px-2.5 py-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(232,220,200,0.85)",
                  }}
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => replyMutation.mutate()}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-xl transition-all min-h-[36px] disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #c9a87c 0%, #b8935c 100%)",
                      color: "#0b1120",
                    }}
                    aria-label="Send reply"
                  >
                    {replyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    {replyMutation.isPending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, onReply }) {
  const text = comment.message?.text || "(empty comment)";
  const actor = comment.actor?.split(":").pop() || "Unknown";
  const time = formatLiDate(comment.created?.time);

  return (
    <div
      className="rounded-xl p-3 border"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: "rgba(123,159,212,0.2)", color: "#7b9fd4" }}
            >
              {actor.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "rgba(232,220,200,0.5)" }}>{actor}</span>
            {time && <span className="text-[9px]" style={{ color: "rgba(232,220,200,0.2)" }}>{time}</span>}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(232,220,200,0.7)" }}>{text}</p>
        </div>
        <button
          onClick={onReply}
          className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-white/5 min-h-[32px]"
          style={{ color: "rgba(201,168,124,0.5)" }}
          aria-label="Reply to comment"
        >
          Reply
        </button>
      </div>
    </div>
  );
}