import React, { useState } from "react";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { useMessages } from "./hooks/useMessages";
import { usePolls } from "./hooks/usePolls";
import { brandColors } from "@/components/core/brandTheme";
import MessageThread from "./MessageThread";
import WelcomeRulesLanding from "./WelcomeRulesLanding";
import CommsOverview from "./CommsOverview";
import GettingStartedLanding from "./GettingStartedLanding";
import IndexLanding from "./IndexLanding";
import ChannelPostFeed from "./ChannelPostFeed";
import MobileCommsHeader from "./MobileCommsHeader";
import PerryDMThread from "./PerryDMThread";
import YouDMThread from "./YouDMThread";
import ThreadControlCenter from "./ThreadControlCenter";
import MobileSearch from "./MobileSearch";
import { Link2, Menu } from "lucide-react";

/**
 * Derives the view type for a conversation using its channel_type field (preferred)
 * or falls back to name-based detection for legacy channels.
 */
function resolveChannelView(conv) {
  if (!conv || conv.type !== "channel") return "thread";

  // Prefer explicit channel_type if set
  if (conv.channel_type) return conv.channel_type;

  // Legacy name-based fallback
  const name = conv.name?.toLowerCase() ?? "";
  if (name.includes("welcome") && name.includes("rules")) return "welcome";
  if (name.includes("status") || name.includes("operations")) return "status";
  if (name.includes("getting-started") || name.includes("getting started")) return "getting-started";
  if (name.includes("index") || name.includes("top-100") || name.includes("top 100")) return "index";
  if (name === "chit-chat" || name === "hangar-talk") return "thread";

  return "post-feed";
}

function PerryHeader({ onBack }) {
  return (
    <div className="px-3 md:px-4 py-3 border-b border-gray-100 flex md:items-center gap-3 bg-gradient-to-r from-[#faf8f5] to-white">
      <button
        onClick={onBack}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
        aria-label="Back"
      >
        <span className="text-gray-600">←</span>
      </button>
      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-2 ring-amber-400/30 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
          alt="Lt. Perry"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
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
  );
}

function EmptyState({ onOpenSidebar }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="md:hidden p-3 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">Messages</span>
      </div>
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

export default function CommsMainView({ onOpenMobileSidebar }) {
  const { user, activeConversation, selectConversation } = useConversation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isPollChannel = !!activeConversation?.name?.toLowerCase().includes("poll");
  const channelView = resolveChannelView(activeConversation);

  const {
    messages,
    isSending,
    sendMessage,
    reactToMessage,
    editMessage,
    deleteMessage,
  } = useMessages({
    conversationId: activeConversation?.id,
    userEmail: user?.email,
    enabled: !!activeConversation && !activeConversation.is_perry && !activeConversation.is_you,
  });

  const { polls, createPoll, votePoll, closePoll } = usePolls({
    conversationId: activeConversation?.id,
    isPollChannel,
    userEmail: user?.email,
  });

  if (!activeConversation) {
    return <EmptyState onOpenSidebar={onOpenMobileSidebar} />;
  }

  if (activeConversation.is_perry) {
    return (
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        <PerryHeader onBack={() => selectConversation(null)} />
        <PerryDMThread
          user={user}
          crpCurrentStep={activeConversation?.crp_current_step}
          crpCompletedSteps={activeConversation?.crp_completed_steps}
        />
      </div>
    );
  }

  if (activeConversation.is_you) {
    return (
      <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
        <div className="px-3 md:px-4 py-3 border-b border-gray-100 flex md:items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
          <button
            onClick={() => selectConversation(null)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Back"
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

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden">
        <MobileCommsHeader onBack={() => selectConversation(null)} />
      </div>

      {/* Thread Control Center for DMs */}
      {activeConversation.type === "dm" && (
        <ThreadControlCenter
          conversation={activeConversation}
          currentUserEmail={user?.email}
        />
      )}

      {/* Channel view router */}
      {channelView === "welcome" ? (
        <WelcomeRulesLanding />
      ) : channelView === "status" ? (
        <CommsOverview />
      ) : channelView === "getting-started" ? (
        <GettingStartedLanding />
      ) : channelView === "index" ? (
        <IndexLanding />
      ) : channelView === "post-feed" ? (
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
          onSendMessage={(content, parentId, rrfStage, crpStep) =>
            sendMessage({
              content,
              parentId,
              rrfStage,
              crpStep,
              conversationData: activeConversation,
            })
          }
          onReactToMessage={reactToMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          polls={polls}
          isPollChannel={isPollChannel}
          onCreatePoll={createPoll}
          onVotePoll={votePoll}
          onClosePoll={closePoll}
          isLoading={isSending}
        />
      )}

      <MobileSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}