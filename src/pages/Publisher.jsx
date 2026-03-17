import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pen, Layers, CalendarDays, Radio, Zap, TrendingUp, Clock } from "lucide-react";
import PostComposer from "@/components/publisher/PostComposer.jsx";
import PostQueue from "@/components/publisher/PostQueue";
import ChannelManager from "@/components/publisher/ChannelManager";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { POST_STATUS_CONFIG } from "@/components/publisher/publisherConfig";

export default function Publisher() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-5 h-5 text-white/30" />
          </div>
          <p className="text-white/40 text-sm font-medium tracking-wide">RESTRICTED ACCESS</p>
        </div>
      </div>
    );
  }

  const { data: channels = [], refetch: refetchChannels } = useQuery({
    queryKey: ["social-channels", user?.email],
    queryFn: () => base44.entities.SocialChannel.filter({ user_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
  });

  const { data: posts = [], refetch: refetchPosts } = useQuery({
    queryKey: ["scheduled-posts", user?.email],
    queryFn: () => base44.entities.ScheduledPost.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const handleCompose = (post = null) => {
    setEditingPost(post);
    setComposerOpen(true);
  };

  const handleComposerClose = () => {
    setComposerOpen(false);
    setEditingPost(null);
    refetchPosts();
  };

  // Derived stats
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const drafts = posts.filter(p => p.status === "draft").length;
  const published = posts.filter(p => p.status === "published").length;
  const connected = channels.filter(c => c.connection_status === "connected").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight leading-none">Signal Publisher</h1>
              <p className="text-xs text-white/35 mt-0.5 tracking-wide">BROADCAST CONTROL</p>
            </div>
          </div>

          <Button
            onClick={() => handleCompose()}
            className="gap-2 bg-indigo-500 hover:bg-indigo-400 text-white border-0 min-h-[44px] rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Pen className="w-3.5 h-3.5" />
            Compose
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-b border-white/[0.04] bg-[#0d0d14]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <StatPill icon={Clock} label="Scheduled" value={scheduled} color="text-indigo-400" />
          <StatPill icon={Layers} label="Drafts" value={drafts} color="text-white/50" />
          <StatPill icon={TrendingUp} label="Published" value={published} color="text-emerald-400" />
          <StatPill icon={Zap} label="Channels" value={connected} color="text-amber-400" />
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="queue">
          <TabsList className="mb-6 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 h-auto gap-1">
            <TabsTrigger
              value="queue"
              className="gap-2 rounded-lg px-4 py-2 text-sm text-white/50 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              Queue
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="gap-2 rounded-lg px-4 py-2 text-sm text-white/50 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="gap-2 rounded-lg px-4 py-2 text-sm text-white/50 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              Channels
              {channels.length > 0 && (
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {channels.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <DarkPostQueue posts={posts} channels={channels} onEdit={handleCompose} onRefresh={refetchPosts} onNewPost={() => handleCompose()} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarPlaceholder count={scheduled} />
          </TabsContent>

          <TabsContent value="channels">
            <div className="[&_*]:!bg-transparent [&_.bg-white]:!bg-white/[0.04] [&_.bg-slate-50]:!bg-white/[0.02] [&_.border-slate-200]:!border-white/10 [&_.text-slate-900]:!text-white [&_.text-slate-800]:!text-white/90 [&_.text-slate-700]:!text-white/75 [&_.text-slate-600]:!text-white/60 [&_.text-slate-500]:!text-white/40 [&_.text-slate-400]:!text-white/30">
              <ChannelManager channels={channels} onRefresh={refetchChannels} userEmail={user?.email} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {composerOpen && (
        <PostComposer
          channels={channels}
          editingPost={editingPost}
          userEmail={user?.email}
          onClose={handleComposerClose}
        />
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
      <span className="text-xs text-white/25 font-medium tracking-wide">{label.toUpperCase()}</span>
    </div>
  );
}

function CalendarPlaceholder({ count }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
        <CalendarDays className="w-6 h-6 text-white/20" />
      </div>
      <p className="text-white/40 font-medium text-sm">Calendar view — coming soon</p>
      {count > 0 && <p className="text-white/20 text-xs mt-1.5">{count} post{count !== 1 ? "s" : ""} in the queue</p>}
    </div>
  );
}

// Dark-themed PostQueue wrapper — passes through with dark overrides via className cascade
function DarkPostQueue({ posts, channels, onEdit, onRefresh, onNewPost }) {
  return (
    <div className="
      [&_.bg-white]:!bg-[#111118]
      [&_.bg-slate-50]:!bg-[#0f0f15]
      [&_.bg-slate-50\/80]:!bg-white/[0.02]
      [&_.bg-white\/80]:!bg-[#111118]
      [&_.border-slate-200]:!border-white/[0.07]
      [&_.border-slate-100]:!border-white/[0.05]
      [&_.border-b]:border-b
      [&_.text-slate-900]:!text-white
      [&_.text-slate-800]:!text-white/90
      [&_.text-slate-700]:!text-white/75
      [&_.text-slate-600]:!text-white/60
      [&_.text-slate-500]:!text-white/40
      [&_.text-slate-400]:!text-white/30
      [&_.text-slate-300]:!text-white/20
      [&_.rounded-xl]:rounded-xl
      [&_button:not(.bg-indigo-600):not(.bg-emerald-600)]:hover:!bg-white/[0.06]
    ">
      <PostQueue
        posts={posts}
        channels={channels}
        onEdit={onEdit}
        onRefresh={onRefresh}
        onNewPost={onNewPost}
      />
    </div>
  );
}