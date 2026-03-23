import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentThread from "./CommentThread";
import { formatDistanceToNow } from "date-fns";

const FLAIR_COLORS = {
  Discussion: "bg-blue-100 text-blue-700",
  Question: "bg-purple-100 text-purple-700",
  Announcement: "bg-amber-100 text-amber-700",
  Resource: "bg-green-100 text-green-700",
  Achievement: "bg-rose-100 text-rose-700",
};

export default function PostDetail({ post, comments, currentUserEmail, onVote, onComment, onBack }) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const voteScore = (post.upvoted_by?.length || 0) - (post.downvoted_by?.length || 0);
  const hasUpvoted = post.upvoted_by?.includes(currentUserEmail);
  const hasDownvoted = post.downvoted_by?.includes(currentUserEmail);
  const title = post.post_title || post.content?.replace(/<[^>]*>/g, "").slice(0, 80) || "Untitled";
  const body = post.post_title ? post.content : null;
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    await onComment(commentText.trim(), post.id, 1);
    setCommentText("");
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-2.5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to posts
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Post card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex">
            {/* Vote rail */}
            <div className="flex flex-col items-center gap-1 px-3 py-4 bg-gray-50 border-r border-gray-100 min-w-[48px]">
              <button
                onClick={() => onVote(post.id, "up")}
                className={`p-1 rounded transition-colors ${hasUpvoted ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className={`text-sm font-bold ${voteScore > 0 ? "text-orange-500" : voteScore < 0 ? "text-blue-500" : "text-gray-500"}`}>
                {voteScore}
              </span>
              <button
                onClick={() => onVote(post.id, "down")}
                className={`p-1 rounded transition-colors ${hasDownvoted ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.sender_avatar} />
                  <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                    {(post.sender_name || post.sender_email)?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-600">
                  {post.sender_name || post.sender_email?.split("@")[0]}
                </span>
                <span className="text-xs text-gray-400">· {timeAgo}</span>
                {post.post_flair && (
                  <Badge className={`text-[10px] px-2 py-0 h-4 ${FLAIR_COLORS[post.post_flair] || "bg-gray-100 text-gray-600"}`}>
                    {post.post_flair}
                  </Badge>
                )}
              </div>

              <h1 className="text-lg font-bold text-gray-900 mb-3">{title}</h1>

              {body && (
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              )}

              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{comments.length} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment box */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500">Add a comment</p>
          <Textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="min-h-[96px] resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleComment}
              disabled={!commentText.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
            >
              {loading ? "Posting…" : "Comment"}
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <CommentThread
            comments={comments}
            currentUserEmail={currentUserEmail}
            onVote={onVote}
            onReply={async (parentId, text, depth) => {
              await onComment(text, parentId, depth);
            }}
          />
        </div>
      </div>
    </div>
  );
}