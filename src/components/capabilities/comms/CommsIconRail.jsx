import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MoreHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { iconMap, DefaultIcon } from "@/components/icons";
import { brandColors } from "@/components/layout/navConfig";
import { useState, useEffect } from "react";
import GlobalSearch from "./GlobalSearch";
import CreateMenu from "./CreateMenu";
import UserProfilePopover from "./UserProfilePopover";

const FALLBACK_RAIL = [
  { icon: "Home", label: "Home", page: "Home" },
  { icon: "MessageCircle", label: "Comms", page: "Comms" },
  { icon: "CircuitBoard", label: "Index", page: "Top100Women2025" },
];

const FALLBACK_MORE = [
  { icon: "Gamepad2", label: "Play", page: "Arcade" },
  { icon: "Rocket", label: "Party", page: "LaunchParty" },
  { icon: "User", label: "Profile", page: "Profile" },
  { icon: "Settings", label: "Settings", page: "Profile" },
];

function RailIcon({ iconName, className }) {
  const Icon = iconMap[iconName] || DefaultIcon;
  return <Icon className={className} />;
}

function NavItem({ item, isActive, onClick, unreadCount = 0 }) {
  const url = item.query ? `${item.page}?${item.query}` : item.page;
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
      <Link
        to={createPageUrl(url)}
        onClick={onClick}
        className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all relative group"
        title={item.label}
        aria-current={isActive ? "page" : undefined}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
            isActive
              ? "bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(201,168,124,0.3)]"
              : "text-white/60 group-hover:bg-white/10 group-hover:text-white"
          )}
        >
          <RailIcon iconName={item.icon} className="w-5 h-5" />
        </div>
        <span
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300",
            isActive ? "text-white opacity-100" : "text-white/40 group-hover:opacity-80"
          )}
        >
          {item.label}
        </span>
        {unreadCount > 0 && (
          <span
            className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white rounded-full ring-2 ring-[#0f1a2a]"
            style={{ background: brandColors.roseAccent }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export default function CommsIconRail({ currentPageName, totalUnread }) {
  const { user, selectConversation } = useConversation();
  const [railItems, setRailItems] = useState([]);
  const [moreItems, setMoreItems] = useState([]);

  useEffect(() => {
    base44.entities.RailItem.list()
      .then((data) => {
        const enabled = data.filter((i) => i.is_enabled !== false && i.is_desktop !== false);
        const sorted = [...enabled].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setRailItems(sorted.filter((i) => !i.is_more_item));
        setMoreItems(sorted.filter((i) => i.is_more_item));
      })
      .catch(() => {
        // fall back to hardcoded defaults silently
      });
  }, []);

  const displayRail = railItems.length ? railItems : FALLBACK_RAIL;
  const displayMore = moreItems.length ? moreItems : FALLBACK_MORE;

  return (
    <nav
      className="h-full w-[76px] flex flex-col items-center shrink-0 border-r border-white/10"
      style={{
        background: "rgba(15, 26, 42, 0.85)",
        backdropFilter: "blur(30px) saturate(150%)",
        WebkitBackdropFilter: "blur(30px) saturate(150%)",
      }}
      aria-label="Main navigation"
    >
      {/* Nav items */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-2">
        {displayRail.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            isActive={currentPageName === item.page}
            unreadCount={item.label === "Comms" ? totalUnread : 0}
            onClick={() => {
              if (item.page !== "Comms" && selectConversation) selectConversation(null);
            }}
          />
        ))}

        {/* Global Search */}
        <GlobalSearch />

        {/* More menu */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <button
                className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all w-full group"
                aria-label="More navigation items"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all text-white/60 group-hover:text-white group-hover:bg-white/10">
                  <MoreHorizontal className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:opacity-80">
                  More
                </span>
              </button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-64 p-0 border-0 shadow-2xl rounded-xl overflow-hidden"
            style={{ background: "#1a1d21" }}
          >
            <div className="p-3 border-b border-white/10">
              <p className="font-semibold text-[15px] text-white">More</p>
            </div>
            <div className="py-2">
              {displayMore.map((item) => (
                <Link
                  key={item.label}
                  to={createPageUrl(item.page)}
                  onClick={() => selectConversation?.(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-600/30">
                    <RailIcon iconName={item.icon} className="w-5 h-5 text-purple-300" />
                  </div>
                  <p className="font-medium text-[15px] text-white">{item.label}</p>
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bottom: Create + Profile */}
      {user && (
        <div className="mt-auto flex flex-col items-center gap-2 pb-4">
          <CreateMenu />
          <UserProfilePopover user={user} />
        </div>
      )}
    </nav>
  );
}