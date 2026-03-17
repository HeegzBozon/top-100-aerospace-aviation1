import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Clock, Linkedin, Instagram } from "lucide-react";
import { PLATFORM_CONFIG, MAX_CHANNELS_PER_TYPE } from "./publisherConfig";

export default function ChannelManager({ channels, onRefresh, userEmail }) {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (channelId) => base44.entities.SocialChannel.delete(channelId),
    onSuccess: () => { onRefresh(); },
  });

  const connected = channels.filter(c => c.connection_status === "connected");
  const canAddMore = (platform) => {
    const count = channels.filter(c => c.platform === platform).length;
    return count < (MAX_CHANNELS_PER_TYPE[platform] || 2);
  };

  return (
    <div className="space-y-6">
      {/* Connected Channels */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900">Connected Channels</h2>
            <p className="text-sm text-slate-500 mt-0.5">{connected.length} of {channels.length} active</p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> Add Channel
          </Button>
        </div>

        {channels.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">No channels connected yet</p>
            <p className="text-sm text-slate-500 mt-1">Add your first LinkedIn, Instagram, or Threads account</p>
            <Button onClick={() => setShowAdd(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Add Your First Channel
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {channels.map(channel => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                onDelete={() => deleteMutation.mutate(channel.id)}
                onRefresh={onRefresh}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Platform Limits Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
          const count = channels.filter(c => c.platform === platform).length;
          const max = MAX_CHANNELS_PER_TYPE[platform];
          return (
            <div key={platform} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <config.Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <span className="font-medium text-slate-800 capitalize">{platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{count} / {max} channels</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${count >= max ? "bg-amber-400" : "bg-indigo-500"}`}
                    style={{ width: `${Math.min((count / max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddChannelModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        userEmail={userEmail}
        channels={channels}
        onAdded={() => { setShowAdd(false); onRefresh(); }}
        canAddMore={canAddMore}
      />
    </div>
  );
}

function ChannelRow({ channel, onDelete, onRefresh }) {
  const config = PLATFORM_CONFIG[channel.platform];
  const statusConfig = {
    connected: { icon: CheckCircle2, color: "text-emerald-500", label: "Connected" },
    expired: { icon: AlertCircle, color: "text-amber-500", label: "Token Expired" },
    error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
    pending: { icon: Clock, color: "text-slate-400", label: "Pending" },
  }[channel.connection_status] || { icon: Clock, color: "text-slate-400", label: "Unknown" };

  const StatusIcon = statusConfig.icon;

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config?.bg || "bg-slate-100"}`}>
        {channel.profile_image_url ? (
          <img src={channel.profile_image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          config && <config.Icon className={`w-5 h-5 ${config.color}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-900 truncate">{channel.channel_name}</span>
          <Badge variant="outline" className="text-xs capitalize">{channel.channel_type}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{channel.platform}</Badge>
        </div>
        {channel.profile_handle && (
          <p className="text-xs text-slate-500 mt-0.5">{channel.profile_handle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{statusConfig.label}</span>
        </div>
        {channel.post_count > 0 && (
          <span className="text-xs text-slate-400">{channel.post_count} posts</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-red-500 min-w-[44px] min-h-[44px]"
          onClick={onDelete}
          aria-label="Remove channel"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
}

function AddChannelModal({ open, onClose, userEmail, channels, onAdded, canAddMore }) {
  const [form, setForm] = useState({
    platform: "linkedin",
    channel_type: "personal",
    channel_name: "",
    profile_handle: "",
    platform_user_id: "",
    access_token: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialChannel.create(data),
    onSuccess: onAdded,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      user_email: userEmail,
      connection_status: form.access_token ? "connected" : "pending",
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Social Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key} disabled={!canAddMore(key)}>
                    <div className="flex items-center gap-2">
                      <cfg.Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className="capitalize">{key}</span>
                      {!canAddMore(key) && <span className="text-xs text-slate-400">(max reached)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel_type">Account Type</Label>
            <Select value={form.channel_type} onValueChange={v => setForm(f => ({ ...f, channel_type: v }))}>
              <SelectTrigger id="channel_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Business / Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel_name">Channel Label <span className="text-red-500">*</span></Label>
            <Input
              id="channel_name"
              placeholder="e.g. TOP 100 LinkedIn Page"
              value={form.channel_name}
              onChange={e => setForm(f => ({ ...f, channel_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_handle">Handle / Username</Label>
            <Input
              id="profile_handle"
              placeholder="@handle"
              value={form.profile_handle}
              onChange={e => setForm(f => ({ ...f, profile_handle: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform_user_id">Platform User / Page ID</Label>
            <Input
              id="platform_user_id"
              placeholder="Numeric ID from platform"
              value={form.platform_user_id}
              onChange={e => setForm(f => ({ ...f, platform_user_id: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="OAuth access token"
              value={form.access_token}
              onChange={e => setForm(f => ({ ...f, access_token: e.target.value }))}
            />
            <p className="text-xs text-slate-500">
              Token is stored securely. Full OAuth flow coming in Phase 3.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || !form.channel_name}>
              {createMutation.isPending ? "Adding..." : "Add Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}