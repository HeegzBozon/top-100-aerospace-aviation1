import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { useMessages } from "./hooks/useMessages";
import { usePolls } from "./hooks/usePolls";
import MessageThread from "./MessageThread";
import YouDMThread from "./YouDMThread";
import PerryDMThread from "./PerryDMThread";
import ThreadControlCenter from "./ThreadControlCenter";
import ChannelPostFeed from "./ChannelPostFeed";

const POLL_CHANNEL_KEYWORDS = ["poll", "vote", "survey"];
const FORUM_CHANNEL_KEYWORDS = ["forum", "ideas", "discussion"];

function resolveChannelView(conversation) {
  if (!conversation) return "thread";
  const name = (conversation.name || "").toLowerCase();
  if (FORUM_CHANNEL_KEYWORDS.some((k) => name.includes(k))) return "forum";
  if (POLL_CHANNEL_KEYWORDS.some((k) => name.includes(k))) return "poll";
  return "thread";
}

export default function CommsMainView({ onOpenMobileSidebar }) {
  const { activeConversation, user } = useConversation();

  const conversationId = activeConversation?.id;
  const userEmail = user?.email;

  const { messages, isLoading, isSending, sendMessage, reactToMessage, editMessage, deleteMessage } =
    useMessages({
      conversationId,
      userEmail,
      enabled: !activeConversation?.is_you && !activeConversation?.is_perry,
    });

  const channelView = resolveChannelView(activeConversation);
  const isPollChannel = channelView === "poll";

  const { polls, createPoll, votePoll, closePoll } = usePolls({
    conversationId,
    isPollChannel,
    userEmail,
  });

  if (!activeConversation) return null;

  // Special DM views
  if (activeConversation.is_you) return <YouDMThread />;
  if (activeConversation.is_perry) return <PerryDMThread />;

  // Forum channel
  if (channelView === "forum") {
    return (
      <div className="flex flex-col h-full">
        <ThreadControlCenter conversation={activeConversation} />
        <ChannelPostFeed conversation={activeConversation} currentUser={user} />
      </div>
    );
  }

  // Standard thread (chat + poll channels)
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ThreadControlCenter conversation={activeConversation} />
      <MessageThread
        messages={messages}
        currentUserEmail={userEmail}
        currentUserRole={user?.role}
        isReadonly={activeConversation.is_readonly}
        isLoading={isSending}
        conversationId={conversationId}
        isPollChannel={isPollChannel}
        polls={polls}
        onSendMessage={(content, parentId, rrfStage, crpStep) =>
          sendMessage({ content, parentId, rrfStage, crpStep, conversationData: activeConversation })
        }
        onReactToMessage={reactToMessage}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
        onCreatePoll={createPoll}
        onVotePoll={votePoll}
        onClosePoll={closePoll}
      />
    </div>
  );
}