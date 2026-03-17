import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Send, Clock, Linkedin, Instagram, MessageCircle, AlertTriangle, Image, CheckSquare, Square } from "lucide-react";
import { PLATFORM_CONFIG } from "./publisherConfig";
import { format } from "date-fns";

export default function PostComposer({ channels, editingPost, userEmail, onClose }) {
  const connectedChannels = channels.filter(c => c.connection_status === "connected" && c.is_active);

  const [content, setContent] = useState(editingPost?.content || "");
  const [selectedChannelIds, setSelectedChannelIds] = useState(editingPost?.channel_ids || []);
  const [scheduledAt, setScheduledAt] = useState(editingPost?.scheduled_at ? editingPost.scheduled_at.slice(0, 16) : "");
  const [mediaUrls, setMediaUrls] = useState((editingPost?.media_urls || []).join("\n"));

  const isEditing = !!editingPost;

  // Compute per-platform char limits based on selected channels
  const charWarnings = useMemo(() => {
    const warnings = [];
    selectedChannelIds.forEach(id => {
      const ch = channels.find(c => c.id === id);
      if (!ch) return;
      const limit = PLATFORM_CONFIG[ch.platform]?.maxChars;
      if (limit && content.length > limit) {
        warnings.push(`${ch.channel_name}: exceeds ${limit} char limit (${content.length - limit} over)`);
      }
    });
    return warnings;
  }, [content, selectedChannelIds, channels]);

  const saveMutation = useMutation({
    mutationFn: (data) => isEditing
      ? base44.entities.ScheduledPost.update(editingPost.id, data)
      : base44.entities.ScheduledPost.create(data),
    onSuccess: onClose,
  });

  const handleToggleChannel = (channelId) => {
    setSelectedChannelIds(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  };

  const handleSave = (asDraft = false) => {
    const urlList = mediaUrls.split("\n").map(u => u.trim()).filter(Boolean);
    saveMutation.mutate({
      user_email: userEmail,
      content,
      channel_ids: selectedChannelIds,
      media_urls: urlList,
      media_type: urlList.length === 0 ? "text" : urlList.length > 1 ? "carousel" : "image",
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      status: asDraft ? "draft" : scheduledAt ? "scheduled" : "draft",
    });
  };

  const canPublish = content.trim() && selectedChannelIds.length > 0 && charWarnings.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Post composer"
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-lg">
            {isEditing ? "Edit Post" : "New Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close composer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Channel Selection */}
          <div>
            <Label className="mb-2 block">Publish to <span className="text-red-500">*</span></Label>
            {connectedChannels.length === 0 ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                No connected channels. Add channels in the Channels tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {connectedChannels.map(channel => {
                  const cfg = PLATFORM_CONFIG[channel.platform];
                  const isSelected = selectedChannelIds.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleToggleChannel(channel.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left min-h-[56px] ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg?.bg}`}>
                        {cfg && <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{channel.channel_name}</p>
                        <p className="text-xs text-slate-500 capitalize">{channel.channel_type} · {channel.platform}</p>
                      </div>
                      {isSelected
                        ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                        : <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
              <span className={`text-xs font-mono ${content.length > 500 ? "text-amber-600" : "text-slate-400"}`}>
                {content.length} chars
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="What do you want to share?"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[140px] resize-none text-sm"
            />
            {charWarnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {charWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {w}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Media URLs */}
          <div>
            <Label htmlFor="media_urls" className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4" /> Media URLs
              <span className="text-xs text-slate-400 font-normal">(one per line, must be public)</span>
            </Label>
            <Textarea
              id="media_urls"
              placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
              value={mediaUrls}
              onChange={e => setMediaUrls(e.target.value)}
              className="min-h-[72px] resize-none text-sm font-mono text-xs"
            />
          </div>

          {/* Schedule */}
          <div>
            <Label htmlFor="scheduled_at" className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Schedule
              <span className="text-xs text-slate-400 font-normal">(leave blank to save as draft)</span>
            </Label>
            <input
              id="scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
            {scheduledAt && (
              <p className="text-xs text-slate-500 mt-1">
                Will publish on {format(new Date(scheduledAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {selectedChannelIds.length > 0 && (
              <span className="text-xs text-slate-500">
                Posting to <strong>{selectedChannelIds.length}</strong> channel{selectedChannelIds.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={!content.trim() || saveMutation.isPending}
              className="min-h-[44px]"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={!canPublish || saveMutation.isPending}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              {scheduledAt ? "Schedule" : "Queue Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}