import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useConversation } from "./ConversationContext";

const UnreadContext = createContext(null);

export function UnreadProvider({ children }) {
  const { user, conversations } = useConversation();

  // Fetch only recent messages and derive unread counts — targeted, not 500-message global fetch
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["unread-counts", user?.email],
    queryFn: async () => {
      // Fetch last 200 messages; sufficient for badge accuracy without full table scan
      const allMsgs = await base44.entities.Message.list("-created_date", 200);
      const counts = {};
      allMsgs.forEach(msg => {
        if (msg.sender_email !== user.email && !msg.read_by?.includes(user.email)) {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!user?.email,
    // No polling interval — invalidated by CommsMainView after read-marking
    staleTime: 30 * 1000,
  });

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((a, b) => a + b, 0),
    [unreadCounts]
  );

  // Correctly split unread by type using conversation data from ConversationContext
  const unreadByType = useMemo(() => {
    const result = { channels: 0, dms: 0 };
    if (!conversations?.length) return result;
    const convTypeMap = {};
    conversations.forEach(c => { convTypeMap[c.id] = c.type; });
    Object.entries(unreadCounts).forEach(([convId, count]) => {
      if (convTypeMap[convId] === 'dm') result.dms += count;
      else result.channels += count;
    });
    return result;
  }, [unreadCounts, conversations]);

  const value = useMemo(() => ({ unreadCounts, totalUnread, unreadByType }), [unreadCounts, totalUnread, unreadByType]);

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error("useUnread must be used within UnreadProvider");
  }
  return context;
}