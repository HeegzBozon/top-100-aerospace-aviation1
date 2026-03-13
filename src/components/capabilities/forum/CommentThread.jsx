import React, { useState } from "react";
import { ArrowUp, ArrowDown, ChevronDown, ChevronRight, Reply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MAX_VISUAL_INDENT = 5; // cap visual nesting at 5 levels

function Comment({ comment, allComments, currentUserEmail, onVote, onReply, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const children = allComments.filter(c => c.parent_id === comment.id);
  const voteScore = (comment.upvoted_by?.length || 0) - (comment.downvoted_by?.length || 0);
  const hasUpvoted = comment.upvoted_by?.includes(currentUserEmail);
  const hasDownvoted = comment.downvoted_by?.includes(currentUserEmail);
  const visualDepth = Math.min(depth, MAX_VISUAL_INDENT);
  const timeAgo = comment.created_date ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true }) : "";

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await onReply(comment.id, replyText.trim(), depth + 1);
    setReplyText("");
    setReplying(false);
  };

  return (
    <div className={`${visualDepth > 0 ? "ml-4 border-l-2 border-gray-100 pl-3" : ""}`}>
      <div className="py-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-300 hover:text-gray-500 transition-colors">
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <Avatar className="w-5 h-5">
            <AvatarImage src={comment.sender_avatar} />
            <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">
              {(comment.sender_name || comment.sender_email)?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-gray-700">
            {comment.sender_name || comment.sender_email?.split("@")[0]}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {/* Inline vote score */}
          <span className={`text-xs font-medium ml-1 ${voteScore > 0 ? "text-orange-500" : voteScore < 0 ? "text-blue-500" : "text-gray-400"}`}>
            {voteScore > 0 ? `+${voteScore}` : voteScore}
          </span>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              {/* Body */}
              <div
                className="text-sm text-gray-700 leading-relaxed mb-2 pl-5"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />

              {/* Actions */}
              <div className="flex items-center gap-3 pl-5">
                <button
                  onClick={() => onVote(comment.id, "up")}
                  className={`flex items-center gap-0.5 text-xs transition-colors ${hasUpvoted ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onVote(comment.id, "down")}
                  className={`flex items-center gap-0.5 text-xs transition-colors ${hasDownvoted ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setReplying(!replying)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              </div>

              {/* Reply box */}
              {replying && (
                <div className="pl-5 mt-2 space-y-2">
                  <Textarea
                    placeholder="Write a reply…"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="min-h-[72px] text-sm resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReply} disabled={!replyText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs">
                      Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplying(false)} className="h-7 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Nested children */}
              {children.length > 0 && (
                <div className="mt-1">
                  {children.map(child => (
                    <Comment
                      key={child.id}
                      comment={child}
                      allComments={allComments}
                      currentUserEmail={currentUserEmail}
                      onVote={onVote}
                      onReply={onReply}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CommentThread({ comments, currentUserEmail, onVote, onReply }) {
  // Only top-level comments (direct children of the post, depth=1)
  const topLevel = comments.filter(c => !c.parent_id || c.depth === 1);

  if (topLevel.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {topLevel.map(comment => (
        <Comment
          key={comment.id}
          comment={comment}
          allComments={comments}
          currentUserEmail={currentUserEmail}
          onVote={onVote}
          onReply={onReply}
          depth={1}
        />
      ))}
    </div>
  );
}