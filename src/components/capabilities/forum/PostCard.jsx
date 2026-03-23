import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const FLAIR_STYLES = {
  Discussion:   { bg: "#EEF2FF", color: "#4338CA", dot: "#6366F1" },
  Question:     { bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6" },
  Announcement: { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  Resource:     { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
  Achievement:  { bg: "#FFF1F2", color: "#9F1239", dot: "#F43F5E" },
};

export default function PostCard({ post, currentUserEmail, onVote, onClick, onEdit, onDelete }) {
  const voteScore = (post.upvoted_by?.length || 0) - (post.downvoted_by?.length || 0);
  const hasUpvoted = post.upvoted_by?.includes(currentUserEmail);
  const hasDownvoted = post.downvoted_by?.includes(currentUserEmail);

  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?(p|div|h[1-6]|li|ul|ol|blockquote)[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  };

  const title = post.post_title || stripHtml(post.content)?.slice(0, 80) || "Untitled";
  const body = post.post_title ? stripHtml(post.content) : null;
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";
  const flair = FLAIR_STYLES[post.post_flair];
  const authorInitial = (post.sender_name || post.sender_email)?.charAt(0)?.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex">
        {/* Vote Rail */}
        <div className="flex flex-col items-center gap-0.5 px-2.5 py-4 bg-gray-50/80 min-w-[52px]" style={{ borderRight: '1px solid #F3F4F6' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onVote(post.id, "up"); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              hasUpvoted
                ? "bg-orange-100 text-orange-500"
                : "text-gray-300 hover:bg-orange-50 hover:text-orange-400"
            }`}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={hasUpvoted ? 2.5 : 2} />
          </button>
          <span className={`text-[13px] font-bold tabular-nums ${
            voteScore > 0 ? "text-orange-500" : voteScore < 0 ? "text-blue-500" : "text-gray-400"
          }`}>
            {voteScore}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onVote(post.id, "down"); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              hasDownvoted
                ? "bg-blue-100 text-blue-500"
                : "text-gray-300 hover:bg-blue-50 hover:text-blue-400"
            }`}
          >
            <ArrowDown className="w-4 h-4" strokeWidth={hasDownvoted ? 2.5 : 2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 min-w-0" onClick={onClick}>
          {/* Author + meta row */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <Avatar className="w-6 h-6 ring-2 ring-white shadow-sm">
              <AvatarImage src={post.sender_avatar} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-gray-700">
              {post.sender_name || post.sender_email?.split("@")[0]}
            </span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {post.post_flair && flair && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: flair.bg, color: flair.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: flair.dot }} />
                {post.post_flair}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1.5 group-hover:text-[#1e3a5a] transition-colors">
            {title}
          </h3>

          {/* Body preview */}
          {body && (
            <p className="text-[13px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{body}</p>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-3 mt-2">
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-[#1e3a5a] hover:bg-[#1e3a5a]/5 px-2 py-1 rounded-lg transition-all">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.reply_count || 0} {post.reply_count === 1 ? 'comment' : 'comments'}</span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-[#1e3a5a] hover:bg-[#1e3a5a]/5 px-2 py-1 rounded-lg transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-amber-600 hover:bg-amber-50 px-2 py-1 rounded-lg transition-all ml-auto"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            {post.sender_email === currentUserEmail && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-red-600">
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}