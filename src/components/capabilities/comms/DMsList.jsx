import React from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { useUnread } from "@/components/capabilities/contexts/UnreadContext";
import RRFSidebarContact from "@/components/epics/05-rapid-response-cells/rrf/RRFSidebarContact";

export function DMsList({
  dms,
  dmsExpanded,
  onToggleDMs,
  onSelectConversation,
  onShowNewModal,
  isDmsOnlyView,
  showPerry = true,
}) {
  const { activeConversation, user } = useConversation();
  const { unreadCounts } = useUnread();

  const getDisplayName = (email) => {
    const name = email?.split("@")[0] || "Unknown";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p !== user?.email) || "Unknown";
  };

  return (
    <>
      {/* ── "You" DM (Notes to Self) ── */}
      <div className="mt-3 mb-1 px-2">
        <button
          onClick={() => onSelectConversation({ id: '__you__', type: 'dm', is_you: true, name: 'You' })}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all min-h-[44px]",
            activeConversation?.is_you
              ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm"
              : "hover:bg-white/10"
          )}
          aria-current={activeConversation?.is_you ? "page" : undefined}
          aria-label="Notes to Self - Personal notes and reminders"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
            ✓
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className={cn("text-[15px] truncate block", activeConversation?.is_you ? "font-semibold text-white" : "font-medium text-white/90")}>
              You
            </span>
            <span className={cn("text-[12px] truncate block", activeConversation?.is_you ? "text-white/70" : "text-white/50")}>
              Notes to self
            </span>
          </div>
        </button>
      </div>

      {/* ── Lt. Perry — Dedicated Section (Comms only) ── */}
      {showPerry && (
        <div className="mt-3 mb-1 px-2">
          <button
            onClick={() => onSelectConversation({ id: '__perry__', type: 'dm', is_perry: true, name: 'Lt. Perry' })}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all min-h-[44px]",
              activeConversation?.is_perry
                ? "bg-gradient-to-r from-[#1164A3] to-[#0f4a7e] shadow-sm"
                : "hover:bg-white/10"
            )}
            aria-current={activeConversation?.is_perry ? "page" : undefined}
            aria-label="Chat with Lt. Perry, platform assistant"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm ring-2 ring-amber-400/40 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
                  alt="Lt. Perry"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#152a42] rounded-full bg-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className={cn("text-[15px] truncate block", activeConversation?.is_perry ? "font-semibold text-white" : "font-medium text-white/90")}>
                Lt. Perry
              </span>
              <span className={cn("text-[12px] truncate block", activeConversation?.is_perry ? "text-white/70" : "text-white/50")}>
                Platform assistant
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ── DMs Header ── */}
      <div className={cn("mt-3 pt-3", !isDmsOnlyView && "border-t")} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={onToggleDMs}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-[12px] font-bold text-white/70 hover:text-white/90 transition-colors uppercase tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-expanded={dmsExpanded}
          aria-label={`${dmsExpanded ? 'Collapse' : 'Expand'} direct messages`}
        >
          <span className="flex-1 text-left">Direct Messages</span>
          {dmsExpanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
        </button>
      </div>

      {/* DMs List */}
      {dmsExpanded && dms.map((conv) => {
        const otherEmail = getOtherParticipant(conv);
        const isActive = activeConversation?.id === conv.id;
        const unread = unreadCounts[conv.id] || 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={cn(
              "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all relative group min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-400",
              isActive 
                ? "bg-gradient-to-r from-[#1164A3] to-[#0f4a7e] text-white shadow-sm" 
                : "text-white/90 hover:bg-white/10 motion-safe:hover:shadow-sm"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${getDisplayName(otherEmail)}${unread > 0 ? `, ${unread} unread message${unread > 1 ? 's' : ''}` : ''}`}
          >
            {/* Apple-style avatar with online indicator */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {getDisplayName(otherEmail).charAt(0).toUpperCase()}
              </div>
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#152a42] rounded-full transition-colors",
                isActive ? "bg-green-400" : "bg-gray-500"
              )} aria-hidden="true" />
            </div>

            {/* Name & Preview */}
            <div className="flex-1 min-w-0 text-left">
              <span className={cn("text-[15px] truncate block transition-colors", isActive ? "font-semibold text-white" : unread > 0 ? "font-bold text-white" : "font-medium text-white/90")}>
                {getDisplayName(otherEmail)}
              </span>
              {conv.last_message_preview && (
                <span className={cn("text-[13px] truncate block transition-colors", isActive ? "text-white/70" : "text-white/50")}>
                  {conv.last_message_preview}
                </span>
              )}
            </div>

            {/* RRF Stage Dot + Unread Badge or Timestamp */}
            <div className="flex items-center gap-2 shrink-0 relative" aria-hidden="false">
              <RRFSidebarContact stage={conv.rrf_stage} unreadCount={unread} />
              {unread > 0 ? (
                <span 
                  className="min-w-[24px] h-6 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm"
                  role="status"
                  aria-label={`${unread} unread message${unread > 1 ? 's' : ''}`}
                >
                  {unread}
                </span>
              ) : (
                <span className="text-[11px] text-white/40 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity">
                  {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              )}
            </div>
          </button>
        );
      })}

      {/* Add DM */}
      {dmsExpanded && (
        <button 
          onClick={onShowNewModal}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white/80 transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-400"
          aria-label="Start a new direct message"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span className="text-[15px] font-medium">Add teammates</span>
        </button>
      )}
    </>
  );
}