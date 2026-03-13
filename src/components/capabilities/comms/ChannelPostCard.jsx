import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquare, Eye, BookOpen, HelpCircle, Megaphone, MoreVertical, Edit2, Trash2, Clock, MoveRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const POST_TYPE_CONFIG = {
  article: { label: "Article", Icon: BookOpen, bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  discussion: { label: "Discussion", Icon: MessageSquare, bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
  question: { label: "Question", Icon: HelpCircle, bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  announcement: { label: "Announcement", Icon: Megaphone, bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
};

const stripHtml = (html) => html
  ? html.replace(/<br\s*\/?>/gi, " ").replace(/<\/?(p|div|h[1-6]|li|ul|ol|blockquote)[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim()
  : "";

function ArticleCard({ post, currentUserEmail, onVote, onClick, onEdit, onDelete, canMove, onMove }) {
  const hasUpvoted = post.upvoted_by?.includes(currentUserEmail);
  const timeAgo = post.published_date
    ? formatDistanceToNow(new Date(post.published_date), { addSuffix: true })
    : post.created_date
      ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
      : "";
  const excerpt = stripHtml(post.excerpt || post.content)?.slice(0, 200);
  const wordCount = (post.content?.replace(/<[^>]*>/g, "") || "").trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const isOwn = post.author_email === currentUserEmail;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <article
          onClick={onClick}
          className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-gray-200"
          aria-label={`Article: ${post.title}`}
        >
          {/* Hero image — taller for articles */}
          {post.featured_image_url && (
            <div className="w-full aspect-[21/9] overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          )}
          {/* Blue top accent strip if no image */}
          {!post.featured_image_url && (
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />
          )}

          <div className="p-5">
            {/* Type + category + reading time */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                <BookOpen className="w-3 h-3" /> Article
              </span>
              {post.category && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 border-gray-200 text-gray-500">
                  {post.category}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                <Clock className="w-3 h-3" /> {readingTime} min read
              </span>
              <span className="text-[11px] text-gray-400">{timeAgo}</span>
            </div>

            <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-[#1e3a5a] transition-colors line-clamp-2">
              {post.title}
            </h3>

            {excerpt && (
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">{excerpt}</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 font-bold">
                  {(post.author_name || post.author_email)?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-gray-700">{post.author_name || post.author_email?.split("@")[0]}</span>

              <div className="flex items-center gap-3 ml-auto">
                <button
                     onClick={(e) => { e.stopPropagation(); onVote(post.id); }}
                     className={cn(
                       "flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200 min-h-[36px] relative overflow-hidden group",
                       hasUpvoted 
                         ? "text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md hover:shadow-lg hover:scale-105" 
                         : "text-gray-500 bg-gray-100/80 hover:bg-orange-100/60 hover:text-orange-600 hover:shadow-sm"
                     )}
                     aria-label={hasUpvoted ? "Remove upvote" : "Upvote"}
                   >
                     <ArrowUp className={cn("w-4 h-4 transition-transform", hasUpvoted && "group-hover:scale-125")} strokeWidth={hasUpvoted ? 2.5 : 2} />
                     <span className="tabular-nums">{post.upvoted_by?.length || 0}</span>
                   </button>
                <span className="flex items-center gap-1 text-[12px] text-gray-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.reply_count || 0}
                </span>
                <span className="flex items-center gap-1 text-[12px] text-gray-400">
                  <Eye className="w-3.5 h-3.5" />
                  {post.view_count || 0}
                </span>
                {(isOwn || canMove) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-white z-[100]">
                      {isOwn && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      {canMove && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(post); }}>
                          <MoveRight className="w-3.5 h-3.5 mr-2" /> Move
                        </DropdownMenuItem>
                      )}
                      {(isOwn || canMove) && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-red-600">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </article>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 bg-white z-[100]">
        {isOwn && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
          </ContextMenuItem>
        )}
        {canMove && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onMove(post); }}>
            <MoveRight className="w-3.5 h-3.5 mr-2" /> Move
          </ContextMenuItem>
        )}
        {(isOwn || canMove) && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-red-600">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DiscussionCard({ post, currentUserEmail, onVote, onClick, onEdit, onDelete, canMove, onMove }) {
  const hasUpvoted = post.upvoted_by?.includes(currentUserEmail);
  const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.discussion;
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";
  const bodyPreview = stripHtml(post.content)?.slice(0, 120);
  const isOwn = post.author_email === currentUserEmail;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <article
          className="group bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer border border-gray-200 shadow-sm"
          aria-label={`Post: ${post.title}`}
        >
          <div className="flex">
            {/* Vote Rail */}
            <div className="flex flex-col items-center gap-1 px-3 py-4 bg-gradient-to-b from-gray-50/50 to-white min-w-[60px] border-r border-gray-100/80">
              <button
                onClick={(e) => { e.stopPropagation(); onVote(post.id); }}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group relative",
                  hasUpvoted 
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:scale-110" 
                    : "bg-gray-100/60 text-gray-400 hover:bg-orange-100/60 hover:text-orange-600 hover:shadow-sm"
                )}
                aria-label={hasUpvoted ? "Remove upvote" : "Upvote"}
              >
                <ArrowUp className={cn("w-4 h-4 transition-transform duration-200", hasUpvoted && "group-hover:scale-125")} strokeWidth={hasUpvoted ? 2.5 : 2} />
              </button>
              <span className={cn("text-[12px] font-bold tabular-nums transition-colors", (post.upvoted_by?.length || 0) > 0 ? "text-orange-600" : "text-gray-400")}>
                {post.upvoted_by?.length || 0}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-4 min-w-0" onClick={onClick}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Avatar className="w-6 h-6 ring-2 ring-white shadow-sm">
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                    {(post.author_name || post.author_email)?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-gray-700">{post.author_name || post.author_email?.split("@")[0]}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">{timeAgo}</span>
                <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ml-auto", typeConfig.bg, typeConfig.text)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", typeConfig.dot)} />
                  {typeConfig.label}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1.5 group-hover:text-[#1e3a5a] transition-colors">
                {post.title}
              </h3>
              {bodyPreview && (
                <p className="text-[13px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{bodyPreview}</p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 px-2 py-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.reply_count || 0} {post.reply_count === 1 ? "comment" : "comments"}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-gray-400">
                  <Eye className="w-3.5 h-3.5" />
                  {post.view_count || 0}
                </span>
                {(isOwn || canMove) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-white z-[100]">
                      {isOwn && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      {canMove && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(post); }}>
                          <MoveRight className="w-3.5 h-3.5 mr-2" /> Move
                        </DropdownMenuItem>
                      )}
                      {(isOwn || canMove) && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-red-600">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </article>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40 bg-white z-[100]">
        {isOwn && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
          </ContextMenuItem>
        )}
        {canMove && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onMove(post); }}>
            <MoveRight className="w-3.5 h-3.5 mr-2" /> Move
          </ContextMenuItem>
        )}
        {(isOwn || canMove) && (
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="text-red-600">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function ChannelPostCard({ post, currentUserEmail, onVote, onClick, onEdit, onDelete, canMove, onMove, isBulkMode, isChecked, onToggleCheck }) {
  const isArticle = post.post_type === "article";
  const CardComponent = isArticle ? ArticleCard : DiscussionCard;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={isBulkMode ? "flex items-start gap-3" : ""}>
      {isBulkMode && (
        <div className="pt-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCheck(post.id);
            }}
            className="w-5 h-5 rounded border-gray-300 text-[#1e3a5a] cursor-pointer shadow-sm focus:ring-[#1e3a5a]"
          />
        </div>
      )}
      <div className={isBulkMode ? "flex-1 min-w-0" : ""}>
        <CardComponent
          post={post}
          currentUserEmail={currentUserEmail}
          onVote={onVote}
          onClick={onClick}
          onEdit={onEdit}
          onDelete={onDelete}
          canMove={canMove}
          onMove={onMove}
        />
      </div>
    </motion.div>
  );
}