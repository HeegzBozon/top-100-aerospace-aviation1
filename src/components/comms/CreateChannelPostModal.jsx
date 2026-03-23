import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, MessageSquare, HelpCircle, Megaphone, ImagePlus, X } from "lucide-react";
import ReactQuill from "react-quill";

const POST_TYPES = [
  { value: "article",      label: "Article",       Icon: BookOpen,      desc: "Long-form content with rich formatting" },
  { value: "discussion",   label: "Discussion",    Icon: MessageSquare, desc: "Start a conversation with the community" },
  { value: "question",     label: "Question",      Icon: HelpCircle,    desc: "Ask the community for help or input" },
  { value: "announcement", label: "Announcement",  Icon: Megaphone,     desc: "Share important updates (admins)" },
];

const CATEGORIES = [
  "General", "Aerospace", "Leadership", "Technology", "Community",
  "Events", "Resources", "Career", "Innovation", "Research"
];

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function CreateChannelPostModal({ open, onClose, onSubmit, editPost, channelName, currentUser }) {
  const [postType, setPostType] = useState("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editPost) {
      setPostType(editPost.post_type || "discussion");
      setTitle(editPost.title || "");
      setContent(editPost.content || "");
      setExcerpt(editPost.excerpt || "");
      setCategory(editPost.category || "");
      setFeaturedImageUrl(editPost.featured_image_url || "");
    } else {
      setPostType("discussion");
      setTitle("");
      setContent("");
      setExcerpt("");
      setCategory("");
      setFeaturedImageUrl("");
    }
  }, [editPost, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.replace(/<[^>]*>/g, "").trim()) return;
    setIsSubmitting(true);
    await onSubmit({
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || content.replace(/<[^>]*>/g, "").slice(0, 200),
      post_type: postType,
      category: category || null,
      featured_image_url: featuredImageUrl.trim() || null,
    });
    setIsSubmitting(false);
  };

  const isArticle = postType === "article";
  const isValid = title.trim() && content.replace(/<[^>]*>/g, "").trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">
            {editPost ? "Edit Post" : `New Post in #${channelName || "general"}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Type Selector */}
          {!editPost && (
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-2 block">Post Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POST_TYPES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPostType(value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                      postType === value
                        ? "border-[#1e3a5a] bg-[#1e3a5a]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${postType === value ? "text-[#1e3a5a]" : "text-gray-400"}`} />
                    <span className={`text-[11px] font-semibold ${postType === value ? "text-[#1e3a5a]" : "text-gray-500"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="post-title" className="text-xs font-semibold text-gray-600 mb-1 block">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isArticle ? "Write a compelling headline…" : "What's on your mind?"}
              className="text-sm"
              maxLength={200}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue placeholder="Select a category…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Image URL (articles only) */}
          {isArticle && (
            <div>
              <Label htmlFor="image-url" className="text-xs font-semibold text-gray-600 mb-1 block">
                <span className="flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Featured Image URL</span>
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="image-url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="text-sm"
                />
                {featuredImageUrl && (
                  <button type="button" onClick={() => setFeaturedImageUrl("")} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {featuredImageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden aspect-[16/6] bg-gray-100">
                  <img src={featuredImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1 block">
              Content <span className="text-red-500">*</span>
            </Label>
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={["bold", "italic", "underline", "list", "bullet", "link"]}
              placeholder={isArticle ? "Write your article…" : "Share your thoughts…"}
              className="[&_.ql-editor]:min-h-[140px] [&_.ql-editor]:text-sm rounded-lg overflow-hidden"
            />
          </div>

          {/* Excerpt (articles only) */}
          {isArticle && (
            <div>
              <Label htmlFor="excerpt" className="text-xs font-semibold text-gray-600 mb-1 block">
                Excerpt <span className="text-gray-400 font-normal">(optional – auto-generated if blank)</span>
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A short summary shown in the feed…"
                className="text-sm resize-none min-h-[64px]"
                maxLength={300}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-9 text-sm px-5 bg-[#1e3a5a] hover:bg-[#2d5075] text-white"
            >
              {isSubmitting ? "Posting…" : editPost ? "Save Changes" : "Publish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}