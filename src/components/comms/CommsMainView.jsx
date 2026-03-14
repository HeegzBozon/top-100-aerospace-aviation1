import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useQueryClient } from "@tanstack/react-query";
import { brandColors } from "@/components/core/brandTheme";
import { Message } from "@/entities/Message";
import { Conversation } from "@/entities/Conversation";
import { Poll } from "@/entities/Poll";
import MessageThread from "./MessageThread";
import WelcomeRulesLanding from "./WelcomeRulesLanding";
import CommsOverview from "./CommsOverview";
import GettingStartedLanding from "./GettingStartedLanding";
import IndexLanding from "./IndexLanding";
import PostFeed from "@/components/forum/PostFeed";
import ChannelPostFeed from "./ChannelPostFeed";
import MobileCommsHeader from "./MobileCommsHeader";
import { createPageUrl } from "@/utils";
import { Link2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import MobileSearch from "./MobileSearch";
import PerryDMThread from "./PerryDMThread";
import YouDMThread from "./YouDMThread";
import PerryRRFRouter from "@/components/chat/PerryRRFRouter";
import ThreadControlCenter from "./ThreadControlCenter";

export default function CommsMainView({ onOpenMobileSidebar }) {
  const { user, activeConversation, selectConversation } = useConversation();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConversation?.id],
    queryFn: () => Message.filter({ conversation_id: activeConversation.id }, "created_date", 200),
    enabled: !!activeConversation?.id && !!user?.email,
    staleTime: 5000,
    refetchInterval: 8000,
    onSuccess: (all) => {
      // Fire-and-forget batch read — does not block render
      const unread = all.filter(m =>
        m.sender_email !== user.email &&
        !m.read_by?.includes(user.email)
      );
      if (unread.length > 0) {
        Promise.all(
          unread.map(msg =>
            Message.update(msg.id, { read_by: [...(msg.read_by || []), user.email] })
          )
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
        });
      }
    },
  });

  const isPollChannel = activeConversation?.name?.toLowerCase().includes('poll');
  const isWelcomeRulesChannel = activeConversation?.name?.toLowerCase().includes('welcome') &&
    activeConversation?.name?.toLowerCase().includes('rules');
  const isStatusChannel = activeConversation?.name?.toLowerCase().includes('status') ||
    activeConversation?.name?.toLowerCase().includes('operations');
  const isGettingStartedChannel = activeConversation?.name?.toLowerCase().includes('getting-started') ||
    activeConversation?.name?.toLowerCase().includes('getting started');
  const isIndexChannel = activeConversation?.name?.toLowerCase().includes('index') ||
    activeConversation?.name?.toLowerCase().includes('top-100') ||
    activeConversation?.name?.toLowerCase().includes('top 100');
  const isSlackChannel = activeConversation?.name?.toLowerCase() === 'chit-chat' ||
    activeConversation?.name?.toLowerCase() === 'hangar-talk';

  // All non-special channels use ChannelPostFeed (general or forum)
  const isPostFeedChannel = activeConversation?.type === 'channel' &&
    !isWelcomeRulesChannel && !isStatusChannel && !isGettingStartedChannel && !isIndexChannel && !isSlackChannel;
  const { data: polls = [] } = useQuery({
    queryKey: ["polls", activeConversation?.id],
    queryFn: () => Poll.filter({ conversation_id: activeConversation.id }, "-created_date", 50),
    enabled: !!activeConversation?.id && isPollChannel,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, parentId, rrfStage, crpStep }) => {
      const msg = await Message.create({
        conversation_id: activeConversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        content,
        message_type: "text",
        read_by: [user.email],
        parent_id: parentId || null,
        rrf_stage: rrfStage || activeConversation.rrf_stage,
        rrf_message_type: "message",
        ...(crpStep ? { crp_step: crpStep } : {}),
      });
      if (parentId) {
        const parent = messages.find(m => m.id === parentId);
        if (parent) {
          await Message.update(parentId, { reply_count: (parent.reply_count || 0) + 1 });
        }
      }
      await Conversation.update(activeConversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content.replace(/<[^>]*>/g, '').slice(0, 50),
        rrf_stage: rrfStage,
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", activeConversation?.id]);
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["unread-counts"]);
    },
  });

  const getConversationTitle = () => {
    if (!activeConversation) return "";
    if (activeConversation.type === "channel") return `#${activeConversation.name}`;
    const other = activeConversation.participants?.find(p => p !== user?.email);
    return other?.split("@")[0] || "Conversation";
  };

  if (activeConversation?.is_perry) {
    return (
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        <div className="px-3 md:px-4 py-3 border-b border-gray-100 flex md:items-center gap-3 bg-gradient-to-r from-[#faf8f5] to-white">
          <button
            onClick={() => selectConversation(null)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
          >
            <span className="text-gray-600">←</span>
          </button>
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-2 ring-amber-400/30 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
              alt="Lt. Perry"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#1e3a5a]">Lt. Perry</h3>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-red-700 bg-red-50 border border-red-200">
                BETA PREVIEW
              </span>
            </div>
            <p className="text-xs text-gray-500">AI-powered profile management & platform guide</p>
          </div>
        </div>
        <PerryDMThread
          user={user}
          crpCurrentStep={activeConversation?.crp_current_step}
          crpCompletedSteps={activeConversation?.crp_completed_steps}
        />
      </div>
    );
  }

  if (activeConversation?.is_you) {
    return (
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        <div className="px-3 md:px-4 py-3 border-b border-gray-100 flex md:items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
          <button
            onClick={() => selectConversation(null)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
          >
            <span className="text-gray-600">←</span>
          </button>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-amber-400/30">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-amber-900">Notes to Self</h3>
            <p className="text-xs text-amber-700/60">Personal notes & reminders</p>
          </div>
        </div>
        <YouDMThread currentUser={user} />
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Header for mobile */}
        <div className="md:hidden p-3 border-b border-gray-100 flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Messages</span>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-xs">
            <div
              className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)` }}
            >
              <Link2 className="w-10 h-10" style={{ color: brandColors.goldPrestige }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.navyDeep }}>
              Welcome to Connect
            </h3>
            <p className="text-sm mb-5 text-gray-500">
              Select a channel or start a conversation to begin messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden">
        <MobileCommsHeader onBack={() => selectConversation(null)} />
      </div>

      {/* Thread Control Center (DMs Only) */}
      {activeConversation?.type === 'dm' && (
        <ThreadControlCenter conversation={activeConversation} currentUserEmail={user?.email} />
      )}

      {/* Special landing pages for specific channels */}
      {isWelcomeRulesChannel ? (
        <WelcomeRulesLanding />
      ) : isStatusChannel ? (
        <CommsOverview />
      ) : isGettingStartedChannel ? (
        <GettingStartedLanding />
      ) : isIndexChannel ? (
        <IndexLanding />
      ) : isPostFeedChannel ? (
        <ChannelPostFeed conversation={activeConversation} currentUser={user} />
      ) : (
        <MessageThread
           messages={messages}
           currentUserEmail={user?.email}
           currentUserRole={user?.role}
           isReadonly={activeConversation.is_readonly}
           conversationId={activeConversation.id}
           isPerry={false}
           defaultCrpStep={activeConversation?.crp_current_step || null}
           onSendMessage={(content, parentId, rrfStage, crpStep) => sendMessageMutation.mutate({ content, parentId, rrfStage, crpStep })}
           onReactToMessage={async (msgId, reactions) => {
             await Message.update(msgId, { reactions });
             queryClient.invalidateQueries(["messages", activeConversation?.id]);
           }}
           onEditMessage={async (msgId, content) => {
             await Message.update(msgId, { content, is_edited: true, edited_at: new Date().toISOString() });
             queryClient.invalidateQueries(["messages", activeConversation?.id]);
           }}
           onDeleteMessage={async (msgId) => {
             await Message.delete(msgId);
             queryClient.invalidateQueries(["messages", activeConversation?.id]);
           }}
           polls={polls}
           isPollChannel={isPollChannel}
           onCreatePoll={async (pollData) => {
             await Poll.create({
               ...pollData,
               conversation_id: activeConversation.id,
               creator_email: user.email,
             });
             queryClient.invalidateQueries(["polls", activeConversation?.id]);
           }}
           onVotePoll={async (pollId, options) => {
             await Poll.update(pollId, { options });
             queryClient.invalidateQueries(["polls", activeConversation?.id]);
           }}
           onClosePoll={async (pollId) => {
             await Poll.update(pollId, { is_closed: true });
             queryClient.invalidateQueries(["polls", activeConversation?.id]);
           }}
           isLoading={sendMessageMutation.isPending}
         />
      )}

      {/* Mobile Search - no dock inside open DM (iOS-native pattern) */}
      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}