import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { brandColors } from "@/components/core/brandTheme";

const FLAIRS = ["Discussion", "Question", "Announcement", "Resource", "Achievement"];

export default function CreatePostModal({ open, onClose, onSubmit, channelName, editPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [flair, setFlair] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (editPost) {
      setTitle(editPost.title || "");
      setBody(editPost.body || "");
      setFlair(editPost.flair || "");
    } else {
      setTitle(""); setBody(""); setFlair("");
    }
  }, [editPost, open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit({ title: title.trim(), body: body.trim(), flair });
    setTitle(""); setBody(""); setFlair("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg border"
        style={{
          backgroundColor: brandColors.cream,
          borderColor: brandColors.goldPrestige,
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: brandColors.navyDeep }}>
            {editPost ? "Edit Post" : "Create Post"} in #{channelName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Flair */}
          <div className="flex flex-wrap gap-2">
            {FLAIRS.map(f => (
              <button key={f} onClick={() => setFlair(flair === f ? "" : f)}>
                <Badge
                  className={`cursor-pointer text-xs px-2 py-1 transition-all ${
                    flair === f 
                      ? "text-white" 
                      : "text-gray-600 hover:opacity-70"
                  }`}
                  style={{
                    backgroundColor: flair === f ? brandColors.goldPrestige : brandColors.goldLight,
                  }}
                >
                  {f}
                </Badge>
              </button>
            ))}
          </div>

          <Input
            placeholder="Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-medium border"
            style={{
              borderColor: brandColors.goldLight,
              color: brandColors.navyDeep,
            }}
            maxLength={300}
          />

          <Textarea
            placeholder="Body (optional)"
            value={body}
            onChange={e => setBody(e.target.value)}
            className="min-h-[120px] resize-none border"
            style={{
              borderColor: brandColors.goldLight,
              color: brandColors.navyDeep,
            }}
          />

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              style={{ color: brandColors.navyDeep, borderColor: brandColors.goldLight }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || loading}
              style={{
                backgroundColor: brandColors.goldPrestige,
                color: 'white',
              }}
              className="hover:opacity-90"
            >
              {loading ? "Saving…" : editPost ? "Update" : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}