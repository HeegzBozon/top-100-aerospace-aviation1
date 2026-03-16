import React, { useState } from "react";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";
import CommsMainView from "./CommsMainView";
import NewConversationModal from "./NewConversationModal";
import { Plus, MessageCircle } from "lucide-react";
import { brandColors } from "@/components/core/brandTheme";
import { getMobileTheme } from "@/components/core/commsUtils";
import { motion } from "framer-motion";

export default function MobileCommsView({ isDarkMode = false, onComposerActiveChange }) {
  const { user, dms, activeConversation, selectConversation } = useConversation();
  const { unreadCounts } = useUnread();
  const theme = getMobileTheme(isDarkMode, brandColors);
  const [showNewDM, setShowNewDM] = useState(false);

  // If a conversation is active, show the message thread
  if (activeConversation) {
    return <CommsMainView onOpenMobileSidebar={() => selectConversation(null)} onComposerActiveChange={onComposerActiveChange} />;
  }

  const getDisplayName = (email) => {
    const name = email?.split("@")[0] || "Unknown";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p !== user?.email) || "Unknown";

  const handleCreateDM = async (email) => {
    const existing = dms.find(
      (c) => c.participants?.includes(email) && c.participants?.includes(user?.email)
    );
    if (existing) {
      selectConversation(existing);
    } else {
      const { Conversation } = await import("@/entities/Conversation");
      const newConv = await Conversation.create({
        type: "dm",
        participants: [user.email, email],
      });
      selectConversation(newConv);
    }
    setShowNewDM(false);
  };

  const headerStyle = {
    background: isDarkMode ? "rgba(15, 29, 45, 0.95)" : "rgba(255,255,255,0.95)",
    borderBottom: `1px solid ${theme.cardBorder}`,
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: theme.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={headerStyle}>
        <h1 className="text-base font-bold" style={{ color: theme.text }}>
          Direct Messages
        </h1>
        <button
          onClick={() => setShowNewDM(true)}
          className="p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{
            color: theme.text,
            background: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          }}
          aria-label="New direct message"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* DM List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1">
        {dms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${brandColors.skyBlue}20` }}
            >
              <MessageCircle className="w-8 h-8" style={{ color: brandColors.skyBlue }} />
            </div>
            <p className="text-sm text-center" style={{ color: theme.textMuted }}>
              No direct messages yet. Start a conversation!
            </p>
            <button
              onClick={() => setShowNewDM(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white min-h-[44px]"
              style={{
                background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`,
              }}
            >
              New Message
            </button>
          </div>
        ) : (
          dms.map((dm) => {
            const otherEmail = getOtherParticipant(dm);
            const name = getDisplayName(otherEmail);
            const unread = unreadCounts[dm.id] || 0;

            return (
              <motion.button
                key={dm.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectConversation(dm)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left min-h-[56px] transition-colors"
                style={{
                  background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${theme.cardBorder}`,
                }}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`,
                  }}
                >
                  {name.charAt(0)}
                </div>

                {/* Name + Preview */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-[15px] truncate ${unread > 0 ? "font-bold" : "font-medium"}`}
                    style={{ color: theme.text }}
                  >
                    {name}
                  </span>
                  {dm.last_message_preview && (
                    <span className="block text-xs truncate" style={{ color: theme.textMuted }}>
                      {dm.last_message_preview}
                    </span>
                  )}
                </div>

                {/* Unread badge or date */}
                {unread > 0 ? (
                  <span
                    className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full shrink-0"
                    style={{ background: brandColors.roseAccent }}
                  >
                    {unread}
                  </span>
                ) : dm.last_message_at ? (
                  <span className="text-[11px] shrink-0" style={{ color: theme.textMuted }}>
                    {new Date(dm.last_message_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : null}
              </motion.button>
            );
          })
        )}
      </div>

      <NewConversationModal
        open={showNewDM}
        onClose={() => setShowNewDM(false)}
        onCreateDM={handleCreateDM}
        onCreateChannel={async ({ name, description, is_private }) => {
          const { Conversation } = await import("@/entities/Conversation");
          const newConv = await Conversation.create({
            type: "channel",
            name,
            description,
            is_private,
            participants: [user.email],
            owner_email: user.email,
          });
          selectConversation(newConv);
          setShowNewDM(false);
        }}
        currentUserEmail={user?.email}
      />
    </div>
  );
}