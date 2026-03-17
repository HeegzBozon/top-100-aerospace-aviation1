import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, LayoutDashboard, CalendarDays, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostComposer from "@/components/publisher/PostComposer";
import PostQueue from "@/components/publisher/PostQueue";
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-medium">Access restricted to admins.</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Social Publisher</h1>
            <p className="text-sm text-slate-500 mt-0.5">Schedule and publish across all your channels</p>
          </div>
          <Button
            onClick={() => handleCompose()}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Post</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="queue">
          <TabsList className="mb-6">
            <TabsTrigger value="queue" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Channels
              {channels.length > 0 && (
                <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {channels.length}
                </span>
              )}
            </TabsTrigger>
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
            <PostCalendar posts={posts} channels={channels} onEdit={handleCompose} />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelManager
              channels={channels}
              onRefresh={refetchChannels}
              userEmail={user?.email}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Composer Modal */}
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

// Inline simple calendar placeholder — will be expanded in Phase 4
function PostCalendar({ posts, channels, onEdit }) {
  const scheduled = posts.filter(p => p.status === "scheduled" && p.scheduled_at);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 text-center py-16">
      <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500 font-medium">Calendar view coming in Phase 4</p>
      <p className="text-sm text-slate-400 mt-1">{scheduled.length} post{scheduled.length !== 1 ? "s" : ""} scheduled</p>
    </div>
  );
}