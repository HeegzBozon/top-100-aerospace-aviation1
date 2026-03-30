import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const ConversationContext = createContext(null);

export function ConversationProvider({ children }) {
  const [activeConversation, setActiveConversation] = useState(null);
  const didRestoreFromUrl = useRef(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["conversations", user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list("-last_message_at", 100);
      return all.filter(c =>
        c.participants?.includes(user.email) ||
        (c.type === "channel" && !c.is_private)
      );
    },
    enabled: !!user?.email,
    staleTime: 10 * 1000,
    refetchInterval: 15000,
  });

  // Public channels for unauthenticated users
  const { data: publicChannels = [] } = useQuery({
    queryKey: ["public-channels"],
    queryFn: () => base44.entities.Conversation.filter({ type: "channel", is_private: false }, "order", 100),
    enabled: !user,
    staleTime: 60 * 1000,
  });

  const channels = useMemo(() => {
    const source = user ? conversations : publicChannels;
    return source
      .filter(c => c.type === "channel")
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [conversations, publicChannels, user]);

  const dms = useMemo(
    () => conversations.filter(c => c.type === "dm"),
    [conversations]
  );

  const activeConversationData = useMemo(
    () => ({
      isDm: activeConversation?.type === "dm",
      otherParticipant: activeConversation?.participants?.find(p => p !== user?.email),
    }),
    [activeConversation?.type, activeConversation?.participants, user?.email]
  );

  const selectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    const url = new URL(window.location);
    if (conv?.id) {
      url.searchParams.set("conv", conv.id);
    } else {
      url.searchParams.delete("conv");
    }
    window.history.pushState({}, "", url);
  }, []);

  // Restore conversation from URL — only once after conversations load
  useEffect(() => {
    if (didRestoreFromUrl.current || conversations.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conv");
    if (convId) {
      const found = conversations.find(c => c.id === convId);
      if (found) {
        setActiveConversation(found);
        didRestoreFromUrl.current = true;
      }
    } else {
      didRestoreFromUrl.current = true;
    }
  }, [conversations]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update' || event.type === 'delete') {
        queryClient.invalidateQueries({ queryKey: ["conversations", user?.email] });
      }
    });
    return () => unsubscribe();
  }, [queryClient, user?.email]);

  const value = useMemo(() => ({
    user,
    conversations,
    channels,
    dms,
    convsLoading,
    activeConversation,
    selectConversation,
    activeConversationData,
  }), [user, conversations, channels, dms, convsLoading, activeConversation, selectConversation, activeConversationData]);

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within ConversationProvider");
  }
  return context;
}