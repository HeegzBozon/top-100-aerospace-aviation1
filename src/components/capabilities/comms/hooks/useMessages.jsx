import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Encapsulates all message data fetching, read-marking, and mutation logic
 * for an active conversation.
 */
export function useMessages({ conversationId, userEmail, enabled = true }) {
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      base44.entities.Message.filter(
        { conversation_id: conversationId },
        "created_date",
        200
      ),
    enabled: !!conversationId && !!userEmail && enabled,
    staleTime: 5000,
    refetchInterval: 8000,
  });

  // Fix: onSuccess is deprecated in TanStack Query v5 — use useEffect instead
  useEffect(() => {
    if (!messages.length || !userEmail) return;

    const unread = messages.filter(
      (m) => m.sender_email !== userEmail && !m.read_by?.includes(userEmail)
    );

    if (unread.length === 0) return;

    Promise.all(
      unread.map((msg) =>
        base44.entities.Message.update(msg.id, {
          read_by: [...(msg.read_by || []), userEmail],
        })
      )
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    });
  }, [messages, userEmail, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      parentId,
      rrfStage,
      crpStep,
      conversationData,
    }) => {
      const msg = await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: userEmail,
        content,
        message_type: "text",
        read_by: [userEmail],
        parent_id: parentId || null,
        rrf_stage: rrfStage || conversationData?.rrf_stage,
        rrf_message_type: "message",
        ...(crpStep ? { crp_step: crpStep } : {}),
      });

      if (parentId) {
        const parent = messages.find((m) => m.id === parentId);
        if (parent) {
          await base44.entities.Message.update(parentId, {
            reply_count: (parent.reply_count || 0) + 1,
          });
        }
      }

      await base44.entities.Conversation.update(conversationId, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content.replace(/<[^>]*>/g, "").slice(0, 50),
        rrf_stage: rrfStage,
      });

      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-counts"] });
    },
  });

  const reactToMessage = async (msgId, reactions) => {
    await base44.entities.Message.update(msgId, { reactions });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  const editMessage = async (msgId, content) => {
    await base44.entities.Message.update(msgId, {
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  const deleteMessage = async (msgId) => {
    await base44.entities.Message.delete(msgId);
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  return {
    messages,
    isLoading,
    isSending: sendMessage.isPending,
    sendMessage: (args) => sendMessage.mutate(args),
    reactToMessage,
    editMessage,
    deleteMessage,
  };
}