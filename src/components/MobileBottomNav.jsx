import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import * as LucideIcons from "lucide-react";
import { CORE_NAV_ITEMS, brandColors } from "@/components/layout/navConfig";

import { cn } from "@/lib/utils";

const ICON_MAP = LucideIcons;

export default function MobileBottomNav({ currentPageName }) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'Landing';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9998] lg:hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid ${brandColors.navyDeep}10`,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {CORE_NAV_ITEMS.map(item => {
          const isActive = currentPath === item.pageName || currentPageName === item.pageName;
          const Icon = ICON_MAP[item.icon];
          return (
            <Link
              key={item.label}
              to={createPageUrl(item.pageName)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-lg transition-all min-w-[56px]",
                isActive ? "scale-105" : "opacity-70"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-gradient-to-br from-[#c9a87c] to-[#d4a574]"
                )}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? 'white' : brandColors.navyDeep }}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "text-[#c9a87c]" : ""
                )}
                style={{
                  color: isActive ? brandColors.goldPrestige : brandColors.navyDeep,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'inherit' }} />
    </nav>
  );
}