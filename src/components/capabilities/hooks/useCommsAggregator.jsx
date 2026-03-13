import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { useUnread } from "@/components/capabilities/contexts/UnreadContext";
import { useSidebar } from "@/components/capabilities/contexts/SidebarContext";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Backward-compatible aggregator hook for existing code.
 * Combines ConversationContext, UnreadContext, and SidebarContext.
 */
export function useComms() {
  const conversation = useConversation();
  const unread = useUnread();
  const sidebar = useSidebar();
  const queryClient = useQueryClient();

  return {
    // From ConversationContext
    user: conversation.user,
    conversations: conversation.conversations,
    channels: conversation.channels,
    dms: conversation.dms,
    convsLoading: conversation.convsLoading,
    activeConversation: conversation.activeConversation,
    selectConversation: conversation.selectConversation,

    // From UnreadContext
    unreadCounts: unread.unreadCounts,
    totalUnread: unread.totalUnread,

    // From SidebarContext
    sidebarExpanded: sidebar.sidebarExpanded,
    setSidebarExpanded: sidebar.setSidebarExpanded,

    // QueryClient for advanced operations
    queryClient,
  };
}