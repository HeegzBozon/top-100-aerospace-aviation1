import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronRight } from "lucide-react";
import { brandColors } from "@/components/core/brandTheme";
import { cn } from "@/lib/utils";

export default function MobileDMsList({ dms, user, onSelect, unreadCounts, isDarkMode }) {
  const [expanded, setExpanded] = useState(false);

  const text = isDarkMode ? "#ffffff" : brandColors.navyDeep;
  const textMuted = isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(30,58,90,0.5)";
  const cardBg = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)";
  const cardBorder = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)";

  const getDisplayName = (conv) => {
    if (conv.is_you) return "You";
    if (conv.is_perry) return "Lt. Perry";
    const other = conv.participants?.find(p => p !== user?.email) || "";
    return other.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const getInitial = (conv) => {
    if (conv.is_you) return "Y";
    if (conv.is_perry) return "P";
    return getDisplayName(conv).charAt(0);
  };

  const totalUnread = dms.reduce((sum, dm) => sum + (unreadCounts[dm.id] || 0), 0);

  return (
    <div className="px-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full py-2"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: textMuted }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
            Direct Messages
          </span>
          {totalUnread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-rose-500">
              {totalUnread}
            </span>
          )}
        </div>
        <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", expanded && "rotate-90")}
          style={{ color: textMuted }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 mt-1"
          >
            {dms.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: textMuted }}>No direct messages yet</p>
            )}
            {dms.map((dm) => {
              const name = getDisplayName(dm);
              const initial = getInitial(dm);
              const unread = unreadCounts[dm.id] || 0;

              return (
                <motion.button
                  key={dm.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(dm)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: dm.is_perry
                      ? "linear-gradient(135deg, #c9a87c, #a0784c)"
                      : `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`
                    }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: text }}>{name}</p>
                    {dm.last_message_preview && (
                      <p className="text-xs truncate" style={{ color: textMuted }}>{dm.last_message_preview}</p>
                    )}
                  </div>
                  {unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full bg-rose-500 shrink-0">
                      {unread}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}