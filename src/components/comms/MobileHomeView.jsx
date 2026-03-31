import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";
import { getMobileTheme } from "@/components/core/commsUtils";
import { brandColors } from "@/components/core/brandTheme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommsMainView from "./CommsMainView";
import MobileHomeHero from "./mobile-home/MobileHomeHero";
import MobileUnreadPulse from "./mobile-home/MobileUnreadPulse";
import MobilePinnedChannels from "./mobile-home/MobilePinnedChannels";

export default function MobileHomeView({ isDarkMode = false, setIsDarkMode, onSearchOpen }) {
  const { user, channels, selectConversation, activeConversation } = useConversation();
  const { unreadCounts } = useUnread();

  const theme = getMobileTheme(isDarkMode, brandColors);

  // Redirect to active conversation view
  if (activeConversation) {
    return <CommsMainView onOpenMobileSidebar={() => {}} />;
  }

  const unreads = channels.filter(c => (unreadCounts[c.id] || 0) > 0);

  const handleNominationsClick = () => {
    const ch = channels.find(c => c.name?.toLowerCase() === "nominations");
    if (ch) selectConversation(ch);
  };

  const headerStyle = {
    background: isDarkMode ? "rgba(15,29,45,0.85)" : "rgba(255,255,255,0.75)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    borderBottom: `1px solid ${theme.cardBorder}`,
  };

  return (
    <div
      className="h-screen pb-28 overflow-y-auto scrollbar-hide"
      style={{ background: theme.bg }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-20" style={headerStyle}>
        <div className="flex items-center justify-between px-4 py-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/b9767349c_TOP100AerospaceAviationlogo.png"
            alt="TOP 100"
            className="w-9 h-9 rounded-xl object-contain"
          />
          <Avatar className="w-8 h-8 ring-2 ring-white/30 shadow-md">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback
              className="text-white text-sm font-medium"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            >
              {user?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Zone 1: Hero */}
      <MobileHomeHero
        isDarkMode={isDarkMode}
        onNominationsClick={handleNominationsClick}
      />

      {/* Zone 2: Unread Pulse */}
      <MobileUnreadPulse
        unreads={unreads}
        onSelect={selectConversation}
        isDarkMode={isDarkMode}
      />

      {/* Zone 3: Pinned Channels */}
      <MobilePinnedChannels
        channels={channels}
        onSelect={selectConversation}
        unreadCounts={unreadCounts}
        isDarkMode={isDarkMode}
      />

      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}