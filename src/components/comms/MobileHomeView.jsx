import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";
import CommsMainView from "./CommsMainView";
import MobileDock from "./MobileDock";
import MobileSearch from "./MobileSearch";
import MobileCustomizeSheet from "./MobileCustomizeSheet";
import {
  Hash, Lock, MessageSquare, Bookmark, ChevronRight,
  Settings, List, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { brandColors } from "@/components/core/brandTheme";
import { getMobileTheme } from "@/components/core/commsUtils";

// Quick access items configuration
const QUICK_ACCESS_CONFIG = {
  index: { icon: List, label: "Index", sublabel: "", action: "index" },
  threads: { icon: MessageSquare, label: "Threads", sublabel: "0 new", href: "Home?view=dms" },
  later: { icon: Bookmark, label: "Saved", sublabel: "0 items", href: "MyFavorites", external: true },
};

const DEFAULT_ORDER = ["index", "threads", "later"];

// App logo component
const AppLogo = () => (
  <img
    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/b9767349c_TOP100AerospaceAviationlogo.png"
    alt="TOP 100"
    className="w-9 h-9 rounded-xl object-contain shadow-md"
  />
);

export default function MobileHomeView({
  isDarkMode = false,
  setIsDarkMode,
  onSearchOpen
}) {
  const {
    user,
    channels,
    dms,
    selectConversation,
    activeConversation,
  } = useConversation();

  const { unreadCounts } = useUnread();

  const handleQuickAccessAction = (key) => {
    if (key === 'index') {
      const indexChannel = channels.find(c =>
        c.name?.toLowerCase().includes('index') ||
        c.name?.toLowerCase().includes('top-100') ||
        c.name?.toLowerCase().includes('top 100')
      );
      if (indexChannel) { selectConversation(indexChannel); return; }
    }
  };

  const [unreadsExpanded, setUnreadsExpanded] = useState(true);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [itemOrder, setItemOrder] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quickAccessOrder');
      if (saved) {
        // Filter out any keys no longer in config (e.g. old "settings" entry)
        const parsed = JSON.parse(saved).filter(k => QUICK_ACCESS_CONFIG[k]);
        return parsed.length > 0 ? parsed : DEFAULT_ORDER;
      }
    }
    return DEFAULT_ORDER;
  });
  const [enabledItems, setEnabledItems] = useState({
    index: true,
    threads: true,
    later: true,
  });

  // Persist itemOrder to localStorage
  React.useEffect(() => {
    localStorage.setItem('quickAccessOrder', JSON.stringify(itemOrder));
  }, [itemOrder]);

  // Handle drag end for reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(itemOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setItemOrder(items);
  };

  const theme = getMobileTheme(isDarkMode, brandColors);

  const liquidGlassHeader = {
    background: isDarkMode ? 'rgba(15, 29, 45, 0.8)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderBottom: `1px solid ${theme.cardBorder}`,
  };

  const liquidGlassCard = {
    background: theme.cardBg,
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.cardShadow,
  };

  // Get channels with unreads
  const unreads = [...channels, ...dms].filter(c => (unreadCounts[c.id] || 0) > 0);

  const getDisplayName = (email) => {
    const name = email?.split("@")[0] || "Unknown";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getOtherParticipant = (conv) => conv.participants?.find(p => p !== user?.email) || "Unknown";

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const viewParam = urlParams.get('view');

  // If a conversation is selected or we navigated with ?view=dms, show the conversation/DMs view
  if (activeConversation) {
    return <CommsMainView onOpenMobileSidebar={() => { }} />;
  }

  if (viewParam === 'dms') {
    // Show a simple DM list view
    return (
      <div className="min-h-screen overflow-y-auto pb-28" style={{ background: theme.bg }}>
        <div className="sticky top-0 z-10" style={liquidGlassHeader}>
          <div className="flex items-center gap-3 px-4 py-3">
            <Link to={createPageUrl("Comms")} className="p-1.5 rounded-lg text-lg font-semibold" style={{ color: theme.text }}>
              ←
            </Link>
            <h1 className="text-base font-bold" style={{ color: theme.text }}>Direct Messages</h1>
          </div>
        </div>
        <div className="px-4 py-4 space-y-2">
          {dms.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: theme.textMuted }}>No direct messages yet</p>
          )}
          {dms.map((dm) => {
            const other = getOtherParticipant(dm);
            const name = getDisplayName(other);
            const unread = unreadCounts[dm.id] || 0;
            return (
              <button key={dm.id} onClick={() => selectConversation(dm)} className="w-full text-left">
                <motion.div whileTap={{ scale: 0.98 }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl" style={liquidGlassCard}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                    style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm block truncate" style={{ color: theme.text }}>{name}</span>
                    {dm.last_message_preview && (
                      <span className="text-xs truncate block" style={{ color: theme.textMuted }}>{dm.last_message_preview}</span>
                    )}
                  </div>
                  {unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                      style={{ background: brandColors.roseAccent }}>{unread}</span>
                  )}
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen pb-28 overflow-y-auto scrollbar-hide"
      style={{
        background: theme.bg,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10" style={liquidGlassHeader}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <AppLogo />
            <div>
              <h1 className="text-base font-bold" style={{ color: theme.text }}>
                TOP 100 Aerospace & Aviation
              </h1>
            </div>
          </div>
          <Avatar className="w-8 h-8 ring-2 ring-white/30 shadow-md">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback
              className="text-white text-sm font-medium"
              style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Access Cards - Hidden scrollbar */}
      <div
        className="flex gap-2.5 px-4 py-4 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {itemOrder.filter(key => enabledItems[key] && QUICK_ACCESS_CONFIG[key]).map((key) => {
          const item = QUICK_ACCESS_CONFIG[key];
          const Icon = item.icon;
          const card = (
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center w-[76px] h-[68px] rounded-2xl transition-all"
              style={liquidGlassCard}
            >
              <Icon className="w-5 h-5 mb-1" style={{ color: theme.text }} />
              <span className="text-xs font-medium" style={{ color: theme.text }}>{item.label}</span>
              {item.sublabel && (
                <span className="text-[10px]" style={{ color: theme.textMuted }}>{item.sublabel}</span>
              )}
            </motion.div>
          );

          if (item.action) {
            return (
              <button key={key} className="flex-shrink-0" onClick={() => handleQuickAccessAction(key)}>
                {card}
              </button>
            );
          }
          // href may include query params (e.g. "Home?view=dms")
          const [page, qs] = item.href.split('?');
          const to = createPageUrl(page) + (qs ? `?${qs}` : '');
          return (
            <Link key={key} to={to} className="flex-shrink-0">{card}</Link>
          );
        })}
        {/* Settings Card */}
        <button onClick={() => setSettingsOpen(true)} className="flex-shrink-0">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center w-[76px] h-[68px] rounded-2xl transition-all"
            style={liquidGlassCard}
          >
            <Settings className="w-5 h-5 mb-1" style={{ color: theme.textMuted }} />
            <span className="text-xs font-medium" style={{ color: theme.textMuted }}>Settings</span>
          </motion.div>
        </button>
      </div>

      {/* Unreads Section */}
      {unreads.length > 0 && (
        <div className="px-4 mb-4">
          <button
            onClick={() => setUnreadsExpanded(!unreadsExpanded)}
            className="flex items-center gap-2 py-2 w-full"
            style={{ color: theme.text }}
          >
            <span className="font-semibold text-sm">Unreads</span>
            <ChevronRight className={cn("w-4 h-4 transition-transform", unreadsExpanded && "rotate-90")} />
          </button>

          <AnimatePresence>
            {unreadsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {unreads.map((conv) => {
                  const isDm = conv.type === 'dm';
                  const displayName = isDm ? getDisplayName(getOtherParticipant(conv)) : conv.name;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className="w-full text-left"
                    >
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                        style={liquidGlassCard}
                      >
                        {isDm ? (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md"
                            style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
                          >
                            {displayName.charAt(0)}
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                            style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }}
                          >
                            {conv.is_private ? (
                              <Lock className="w-4 h-4" style={{ color: theme.text }} />
                            ) : (
                              <Hash className="w-4 h-4" style={{ color: theme.text }} />
                            )}
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate" style={{ color: theme.text }}>{displayName}</span>
                          </div>
                          {conv.last_message_preview && (
                            <p className="text-sm truncate" style={{ color: theme.textMuted }}>{conv.last_message_preview}</p>
                          )}
                        </div>
                      </motion.div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Channels Section */}
      <div className="px-4">
        <button
          onClick={() => setChannelsExpanded(!channelsExpanded)}
          className="flex items-center gap-2 py-2 w-full"
          style={{ color: theme.text }}
        >
          <Hash className="w-4 h-4" style={{ color: theme.textMuted }} />
          <span className="font-semibold text-sm">Channels</span>
          <ChevronRight className={cn("w-4 h-4 transition-transform", channelsExpanded && "rotate-90")} />
        </button>

        <AnimatePresence>
          {channelsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-0.5"
            >
              {channels.map((channel) => {
                const unread = unreadCounts[channel.id] || 0;

                return (
                  <button
                    key={channel.id}
                    onClick={() => selectConversation(channel)}
                    className="w-full text-left"
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.hoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {channel.is_private ? (
                        <Lock className="w-4 h-4" style={{ color: theme.textMuted }} />
                      ) : (
                        <Hash className="w-4 h-4" style={{ color: theme.textMuted }} />
                      )}
                      <span
                        className={cn("text-[15px]", unread > 0 && "font-semibold")}
                        style={{ color: theme.text }}
                      >
                        {channel.name}
                      </span>
                      {unread > 0 && (
                        <span
                          className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                          style={{ background: brandColors.roseAccent }}
                        >
                          {unread}
                        </span>
                      )}
                    </motion.div>
                  </button>
                );
              })}

              {/* Add Channel */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                style={{ color: theme.textMuted }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-[15px]">Add channel</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Direct Messages Section */}
      <div className="px-4 mt-2">
        <button
          onClick={() => setDmsExpanded(!dmsExpanded)}
          className="flex items-center gap-2 py-2 w-full"
          style={{ color: theme.text }}
        >
          <MessageSquare className="w-4 h-4" style={{ color: theme.textMuted }} />
          <span className="font-semibold text-sm">Direct Messages</span>
          <ChevronRight className={cn("w-4 h-4 transition-transform", dmsExpanded && "rotate-90")} />
        </button>

        <AnimatePresence>
          {dmsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-0.5"
            >
              {dms.map((dm) => {
                const unread = unreadCounts[dm.id] || 0;
                const other = getOtherParticipant(dm);
                const name = getDisplayName(other);

                return (
                  <button
                    key={dm.id}
                    onClick={() => selectConversation(dm)}
                    className="w-full text-left"
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.hoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-semibold text-[10px]"
                        style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}>
                        {name.charAt(0)}
                      </div>
                      <span
                        className={cn("text-[15px]", unread > 0 && "font-semibold")}
                        style={{ color: theme.text }}
                      >
                        {name}
                      </span>
                      {unread > 0 && (
                        <span
                          className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                          style={{ background: brandColors.roseAccent }}
                        >
                          {unread}
                        </span>
                      )}
                    </motion.div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safe area padding */}
      <div className="h-[env(safe-area-inset-bottom)]" />

      {/* MobileDock and MobileSearch removed as they are now in the layout */}

      {/* Reusable Customize Sheet */}
      <MobileCustomizeSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        isDarkMode={isDarkMode}
        onDarkModeChange={setIsDarkMode}
        itemOrder={itemOrder}
        onOrderChange={setItemOrder}
        enabledItems={enabledItems}
        onEnabledChange={(key, checked) => setEnabledItems(prev => ({ ...prev, [key]: checked }))}
      />
    </div>
  );
}