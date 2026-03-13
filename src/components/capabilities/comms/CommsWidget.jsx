import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, ChevronRight, Hash, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@/entities/Conversation";
import { formatDistanceToNow } from "date-fns";
import { useUnread } from "@/components/capabilities/contexts/UnreadContext";

export default function CommsWidget({ currentUserEmail }) {
  const { unreadCounts, totalUnread } = useUnread();

  const { data: conversations = [] } = useQuery({
    queryKey: ["comms-widget", currentUserEmail],
    queryFn: async () => {
      const all = await Conversation.list("-last_message_at", 50);
      return all.filter(c => c.participants?.includes(currentUserEmail));
    },
    enabled: !!currentUserEmail,
    staleTime: 30000,
    refetchInterval: 30000,
  });
  const recentConversations = conversations.slice(0, 3);

  const getDisplayName = (conv) => {
    if (conv.type === "channel") return `#${conv.name}`;
    const other = conv.participants?.find(p => p !== currentUserEmail);
    return other?.split("@")[0] || "Unknown";
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-semibold text-[var(--text)]">Comms</h3>
          {totalUnread > 0 && (
            <span className="bg-[var(--accent)] text-white text-xs px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <Link 
          to={createPageUrl("Comms")}
          className="text-[var(--accent)] text-sm flex items-center hover:underline"
        >
          Open <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {recentConversations.length === 0 ? (
        <div className="text-center py-6 text-[var(--muted)] text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No conversations yet
        </div>
      ) : (
        <div className="space-y-2">
          {recentConversations.map(conv => (
            <Link
              key={conv.id}
              to={createPageUrl("Comms") + `?conv=${conv.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                {conv.type === "channel" ? (
                  <Hash className="w-4 h-4 text-[var(--accent)]" />
                ) : (
                  <User className="w-4 h-4 text-[var(--accent)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{getDisplayName(conv)}</span>
                  {conv.last_message_at && (
                    <span className="text-[10px] text-[var(--muted)]">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {conv.last_message_preview && (
                  <p className="text-xs text-[var(--muted)] truncate">{conv.last_message_preview}</p>
                )}
              </div>
              {unreadCounts[conv.id] > 0 && (
                <span className="bg-[var(--accent)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCounts[conv.id]}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <Link
        to={createPageUrl("Comms")}
        className="mt-4 block w-full text-center py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium hover:bg-[var(--accent)]/20 transition-colors"
      >
        View All Conversations
      </Link>
    </div>
  );
}