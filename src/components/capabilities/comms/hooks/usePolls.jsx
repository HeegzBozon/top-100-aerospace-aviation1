import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Encapsulates poll fetching and mutation logic for a conversation.
 */
export function usePolls({ conversationId, isPollChannel, userEmail }) {
  const queryClient = useQueryClient();

  const { data: polls = [] } = useQuery({
    queryKey: ["polls", conversationId],
    queryFn: () =>
      base44.entities.Poll.filter(
        { conversation_id: conversationId },
        "-created_date",
        50
      ),
    enabled: !!conversationId && isPollChannel,
    refetchInterval: 5000,
  });

  const createPoll = async (pollData) => {
    await base44.entities.Poll.create({
      ...pollData,
      conversation_id: conversationId,
      creator_email: userEmail,
    });
    queryClient.invalidateQueries({ queryKey: ["polls", conversationId] });
  };

  const votePoll = async (pollId, options) => {
    await base44.entities.Poll.update(pollId, { options });
    queryClient.invalidateQueries({ queryKey: ["polls", conversationId] });
  };

  const closePoll = async (pollId) => {
    await base44.entities.Poll.update(pollId, { is_closed: true });
    queryClient.invalidateQueries({ queryKey: ["polls", conversationId] });
  };

  return { polls, createPoll, votePoll, closePoll };
}