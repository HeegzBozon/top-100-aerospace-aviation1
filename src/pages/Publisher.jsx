import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pen, Layers, CalendarDays, Radio, Zap, TrendingUp, Clock, FlaskConical, Users } from "lucide-react";
import PostComposer from "@/components/publisher/PostComposer.jsx";
import PostQueue from "@/components/publisher/PostQueue";
import PublisherCalendar from "@/components/publisher/PublisherCalendar";
import EditorialKanban from "@/components/publisher/EditorialKanban";
import CommunityFeed from "@/components/publisher/CommunityFeed";
import ChannelManager from "@/components/publisher/ChannelManager";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

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
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-5 h-5 text-[#c9a87c]/40" />
          </div>
          <p className="text-[#e8dcc8]/40 text-sm font-medium tracking-widest uppercase">Restricted Access</p>
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

  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const drafts = posts.filter(p => p.status === "draft").length;
  const published = posts.filter(p => p.status === "published").length;
  const connected = channels.filter(c => c.connection_status === "connected").length;

  return (
    <div className="min-h-screen" style={{background: "linear-gradient(160deg, #0b1120 0%, #101828 40%, #0f1a2e 70%, #14101e 100%)"}}>

      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-10" style={{background: "radial-gradient(circle, #1a3a6b 0%, transparent 70%)"}} />
          <div className="absolute -top-10 right-20 w-64 h-64 rounded-full opacity-8" style={{background: "radial-gradient(circle, #c9a87c 0%, transparent 70%)"}} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.2em] font-semibold uppercase" style={{color: "#c9a87c"}}>Signal Publisher</span>
                <span className="w-1 h-1 rounded-full bg-[#c9a87c]/40" />
                <span className="text-[10px] tracking-[0.15em] text-white/25 uppercase">Broadcast Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{background: "linear-gradient(135deg, #e8dcc8 0%, #c9a87c 50%, #e8dcc8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
                Your Editorial Command
              </h1>
              <p className="text-sm text-white/35 mt-1.5 max-w-sm">Craft, schedule, and broadcast your story across every channel.</p>
            </div>

            <Button
              onClick={() => handleCompose()}
              className="shrink-0 gap-2 min-h-[44px] rounded-xl font-semibold text-sm border-0 shadow-lg transition-all hover:scale-[1.02]"
              style={{background: "linear-gradient(135deg, #c9a87c 0%, #b8935c 100%)", color: "#0b1120", boxShadow: "0 8px 24px rgba(201,168,124,0.25)"}}
            >
              <Pen className="w-3.5 h-3.5" />
              Compose
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/[0.05] overflow-x-auto scrollbar-hide">
            <StatPill icon={Clock} label="Scheduled" value={scheduled} accent="#7b9fd4" />
            <StatPill icon={Layers} label="Drafts" value={drafts} accent="rgba(232,220,200,0.45)" />
            <StatPill icon={TrendingUp} label="Published" value={published} accent="#6dbf8a" />
            <StatPill icon={Zap} label="Live Channels" value={connected} accent="#c9a87c" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="queue">
          <TabsList className="mb-6 h-auto p-1 rounded-xl border border-white/[0.07]" style={{background: "rgba(255,255,255,0.04)"}}>
            {[
              { value: "queue", icon: Layers, label: "Queue" },
              { value: "calendar", icon: CalendarDays, label: "Calendar" },
              { value: "rd", icon: FlaskConical, label: "R&D" },
              { value: "channels", icon: Radio, label: "Channels", badge: channels.length },
            ].map(({ value, icon: Icon, label, badge }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none"
                style={{"--tw-text-opacity": 1}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background: "rgba(201,168,124,0.2)", color: "#c9a87c"}}>
                    {badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="queue">
            <PostQueue
              posts={posts}
              channels={channels}
              onEdit={handleCompose}
              onRefresh={refetchPosts}
              onNewPost={() => handleCompose()}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <PublisherCalendar
              posts={posts}
              channels={channels}
              onEditPost={handleCompose}
              onNewPost={() => handleCompose()}
            />
          </TabsContent>

          <TabsContent value="rd">
            <EditorialKanban userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelManager channels={channels} onRefresh={refetchChannels} userEmail={user?.email} />
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

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <Icon className="w-3.5 h-3.5" style={{color: accent}} />
      <span className="text-lg font-bold leading-none" style={{color: accent}}>{value}</span>
      <span className="text-[11px] text-white/25 font-medium tracking-wider uppercase">{label}</span>
    </div>
  );
}