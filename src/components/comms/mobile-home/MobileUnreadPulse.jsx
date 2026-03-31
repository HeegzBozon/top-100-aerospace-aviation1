import { motion } from "framer-motion";
import { Hash, MessageSquare } from "lucide-react";
import { brandColors } from "@/components/core/brandTheme";

export default function MobileUnreadPulse({ unreads, onSelect, isDarkMode }) {
  if (!unreads.length) return null;

  const cardBg = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.75)";
  const cardBorder = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)";
  const text = isDarkMode ? "#ffffff" : brandColors.navyDeep;
  const textMuted = isDarkMode ? "rgba(255,255,255,0.55)" : "rgba(30,58,90,0.55)";

  return (
    <div className="px-4 mb-3">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: textMuted }}>
        Unread
      </p>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
        {unreads.map((conv) => {
          const isDm = conv.type === "dm";
          const name = isDm
            ? (conv.participants?.[0] || "DM").split("@")[0]
            : conv.name;
          const initial = (name || "?").charAt(0).toUpperCase();

          return (
            <motion.button
              key={conv.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(conv)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
            >
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-sm"
                  style={{ background: isDm
                    ? `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`
                    : `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`
                  }}
                >
                  {isDm ? initial : <Hash className="w-5 h-5" />}
                </div>
                {/* Red dot */}
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" />
              </div>
              <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: text }}>
                {name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}