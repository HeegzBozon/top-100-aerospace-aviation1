import React from "react";
import CommsMainView from "./CommsMainView";
import MobileCommsView from "./MobileCommsView";
import NoConversationPlaceholder from "./NoConversationPlaceholder";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";

/**
 * CommsPageContent — the full comms experience, rendered by the Comms page.
 * On mobile: renders MobileCommsView (its own self-contained layout).
 * On desktop: renders CommsMainView which fills the main area beside the
 * Layout-provided Drawer and IconRail.
 */
export default function CommsPageContent() {
  const isMobile = useIsMobile();
  const { activeConversation } = useConversation();

  if (isMobile) {
    return <MobileCommsView />;
  }

  if (!activeConversation) {
    return <NoConversationPlaceholder />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <CommsMainView onOpenMobileSidebar={() => {}} />
    </div>
  );
}