import { useState } from "react";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";
import CommsMainView from "./CommsMainView";
import { Hash, Lock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Priority channels to show first in the tray
const TOP_CHANNEL_NAMES = ['welcome-and-rules', 'announcements', 'nominations'];

export default function MobileHomeView({ isDarkMode = false }) {
  const { channels, selectConversation, activeConversation } = useConversation();
  const { unreadCounts } = useUnread();
  const [trayOpen, setTrayOpen] = useState(false);

  // If a conversation is selected, show it full screen
  if (activeConversation) {
    return <CommsMainView onOpenMobileSidebar={() => {}} />;
  }

  // Sort channels: top priority first, then the rest
  const sortedChannels = [
    ...channels.filter(c => TOP_CHANNEL_NAMES.includes(c.name?.toLowerCase())).sort((a, b) => {
      const order = { 'welcome-and-rules': 0, 'announcements': 1, 'nominations': 2 };
      return (order[a.name?.toLowerCase()] ?? 99) - (order[b.name?.toLowerCase()] ?? 99);
    }),
    ...channels.filter(c => !TOP_CHANNEL_NAMES.includes(c.name?.toLowerCase())),
  ];

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden relative" style={{ background: '#faf8f5' }}>
      {/* Home page content - scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-2">
        {/* Dynamically render the actual Home page content */}
        <HomePageContent />
      </div>

      {/* Channels Tray - slides up from bottom */}
      <div className="shrink-0 border-t border-gray-200 bg-white shadow-lg">
        {/* Tray Handle / Toggle */}
        <button
          onClick={() => setTrayOpen(!trayOpen)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#1e3a5a]" />
            <span className="text-sm font-semibold text-[#1e3a5a]">Channels</span>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-red-500">
                {totalUnread}
              </span>
            )}
          </div>
          <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", trayOpen && "rotate-180")} />
        </button>

        {/* Channel list - expands upward */}
        <AnimatePresence>
          {trayOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto pb-2">
                {sortedChannels.map((channel) => {
                  const unread = unreadCounts[channel.id] || 0;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => { selectConversation(channel); setTrayOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      {channel.is_private
                        ? <Lock className="w-4 h-4 shrink-0 text-gray-400" />
                        : <Hash className="w-4 h-4 shrink-0 text-gray-400" />
                      }
                      <span className={cn("text-sm flex-1 text-left truncate", unread > 0 ? "font-semibold text-[#1e3a5a]" : "text-gray-700")}>
                        {channel.name}
                      </span>
                      {unread > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full bg-red-500 shrink-0">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Lazy-loaded home page content for mobile
import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("@/pages/Home"));

function HomePageContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}