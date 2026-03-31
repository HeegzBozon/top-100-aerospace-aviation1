import { motion } from "framer-motion";
import { brandColors } from "@/components/core/brandTheme";

const PINNED_CONFIG = [
  {
    key: "welcome-and-rules",
    emoji: "📖",
    label: "Welcome & Rules",
    sublabel: "Start here",
    gradient: `linear-gradient(135deg, #1e3a5a, #2d5a8e)`,
  },
  {
    key: "announcements",
    emoji: "📢",
    label: "Announcements",
    sublabel: "Official updates",
    gradient: `linear-gradient(135deg, #2d5a8e, #4a90b8)`,
  },
  {
    key: "nominations",
    emoji: "🏆",
    label: "Nominations",
    sublabel: "Season 4 open",
    gradient: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})`,
  },
  {
    key: "index",
    emoji: "🌍",
    label: "TOP 100 Index",
    sublabel: "2025 rankings",
    gradient: `linear-gradient(135deg, #0f2a42, #1e3a5a)`,
    matchFn: (ch) =>
      ch.name?.toLowerCase().includes("index") ||
      ch.name?.toLowerCase().includes("top-100") ||
      ch.name?.toLowerCase().includes("top 100"),
  },
];

export default function MobilePinnedChannels({ channels, onSelect, unreadCounts, isDarkMode }) {
  const text = isDarkMode ? "#ffffff" : "#ffffff"; // always white on gradient cards
  const textMuted = "rgba(255,255,255,0.7)";

  const findChannel = (cfg) => {
    if (cfg.matchFn) return channels.find(cfg.matchFn);
    return channels.find(ch => ch.name?.toLowerCase() === cfg.key);
  };

  return (
    <div className="px-4 mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2.5"
        style={{ color: isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(30,58,90,0.45)" }}>
        Channels
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {PINNED_CONFIG.map((cfg) => {
          const channel = findChannel(cfg);
          if (!channel) return null;
          const unread = unreadCounts[channel.id] || 0;

          return (
            <motion.button
              key={cfg.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(channel)}
              className="relative flex flex-col justify-between p-4 rounded-2xl text-left shadow-md"
              style={{ background: cfg.gradient, minHeight: 88 }}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{cfg.emoji}</span>
                {unread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full bg-rose-500">
                    {unread}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{cfg.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>{cfg.sublabel}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}