import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  Search,
  MoreHorizontal,
  UserCircle,
  Gamepad2,
  Rocket,
  CheckSquare,
  BookOpen,
  Award,
  Star,
  Heart
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { brandColors, CORE_NAV_ITEMS } from "@/components/layout/navConfig";
import { getMobileTheme } from "@/components/core/commsUtils";
import { base44 } from "@/api/base44Client";
import { iconMap, DefaultIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_MAP = LucideIcons;

export default function MobileDock({ onSearchOpen, isDarkMode = false, currentPageName }) {
  const navigate = useNavigate();
  const theme = getMobileTheme(isDarkMode, brandColors);
  const [railItems, setRailItems] = useState([]);
  const [moreItems, setMoreItems] = useState([]);

  useEffect(() => {
    base44.entities.RailItem.list()
      .then((data) => {
        const enabled = data.filter(i => i.is_enabled !== false && i.is_mobile !== false);
        const sorted = [...enabled].sort((a, b) => (a.mobile_order ?? 0) - (b.mobile_order ?? 0));
        setRailItems(sorted.filter(i => !i.is_more_item));
        setMoreItems(sorted.filter(i => i.is_more_item));
      })
      .catch(() => {
        // silently fall back to hardcoded defaults
      });
  }, []);

  const dockStyle = {
    background: theme.dockBg,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: `1px solid ${theme.dockBorder}`,
    boxShadow: theme.dockShadow,
  };

  const menuItems = [
    { label: "Profile", icon: UserCircle, page: "Profile" },
    { label: "Play", icon: Gamepad2, page: "Arcade" },
    { label: "Launch Party", icon: Rocket, page: "LaunchParty" },
  ];

  const indexMenuItems = [
    { label: "Publications", icon: BookOpen, page: "Top100Women2025" },
    { label: "Nominate", icon: Award, page: "Nominations" },
    { label: "Endorse", icon: Star, page: "Nominations" },
    { label: "Sponsor", icon: Heart, page: "Sponsors" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-30 flex items-center justify-center">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-sm flex items-center justify-around h-16 px-4 rounded-3xl"
        style={dockStyle}
      >
        {(railItems.length ? railItems : CORE_NAV_ITEMS).map((item) => {
          const itemPage = item.page || item.pageName;
          const Icon = iconMap[item.icon] || ICON_MAP[item.icon] || DefaultIcon;
          const isActive = currentPageName === itemPage;
          const url = item.query ? `${itemPage}?${item.query}` : itemPage;

          if (item.label === "Index") {
            return (
              <DropdownMenu key={itemPage}>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center justify-center min-w-[64px] transition-transform active:scale-90 outline-none">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[var(--accent)] text-white shadow-lg' : ''}`}>
                      <Icon className="w-6 h-6" style={{ color: isActive ? 'white' : theme.text }} />
                    </div>
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter" style={{ color: theme.text, opacity: isActive ? 1 : 0.6 }}>
                      {item.label}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className="w-56 mb-4 rounded-2xl border-white/20 shadow-2xl overflow-hidden p-2"
                  style={{
                    background: theme.dockBg,
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    color: theme.text
                  }}
                >
                  {indexMenuItems.map((menuItem) => (
                    <DropdownMenuItem
                      key={menuItem.label}
                      onClick={() => navigate(createPageUrl(menuItem.page))}
                      className="flex items-center gap-3 p-3 rounded-xl focus:bg-white/10 cursor-pointer transition-colors"
                    >
                      <menuItem.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                      <span className="font-semibold text-sm">{menuItem.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Link
              key={itemPage}
              to={createPageUrl(url)}
              className="flex flex-col items-center justify-center min-w-[64px] transition-transform active:scale-90"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[var(--accent)] text-white shadow-lg' : ''}`}>
                <Icon className="w-6 h-6" style={{ color: isActive ? 'white' : theme.text }} />
              </div>
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter" style={{ color: theme.text, opacity: isActive ? 1 : 0.6 }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center min-w-[64px] transition-transform active:scale-90 outline-none">
              <div className="p-2 rounded-2xl">
                <MoreHorizontal className="w-6 h-6" style={{ color: theme.text }} />
              </div>
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter" style={{ color: theme.text, opacity: 0.6 }}>
                More
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            className="w-56 mb-4 rounded-2xl border-white/20 shadow-2xl overflow-hidden p-2"
            style={{
              background: theme.dockBg,
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              color: theme.text
            }}
          >
            {(moreItems.length ? moreItems : menuItems).map((menuItem) => {
              const Icon = iconMap[menuItem.icon] || ICON_MAP[menuItem.icon] || DefaultIcon;
              const menuPage = menuItem.page || menuItem.pageName;
              return (
                <DropdownMenuItem
                  key={menuItem.label}
                  onClick={() => navigate(createPageUrl(menuPage))}
                  className="flex items-center gap-3 p-3 rounded-xl focus:bg-white/10 cursor-pointer transition-colors"
                >
                  <Icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  <span className="font-semibold text-sm">{menuItem.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.nav>
    </div>
  );
}