import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useConversation } from "./ConversationContext";

const UnreadContext = createContext(null);

export function UnreadProvider({ children }) {
  const { user } = useConversation();

  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["unread-counts", user?.email],
    queryFn: async () => {
      const allMsgs = await base44.entities.Message.list("-created_date", 500);
      const counts = {};
      allMsgs.forEach(msg => {
        if (msg.sender_email !== user.email && !msg.read_by?.includes(user.email)) {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((a, b) => a + b, 0),
    [unreadCounts]
  );

  const unreadByType = useMemo(() => {
    const result = { channels: 0, dms: 0 };
    Object.entries(unreadCounts).forEach(([convId, count]) => {
      // Note: This is a simple split; actual type detection should come from ConversationContext
      result.channels += count;
    });
    return result;
  }, [unreadCounts]);

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