import React from "react";
import { ChevronLeft, HelpCircle, Hash, Lock } from "lucide-react";
import { useConversation } from "@/components/contexts/ConversationContext";
import { brandColors } from "@/components/core/brandColors";
import { motion } from "framer-motion";

export default function MobileCommsHeader({ onBack }) {
  const { activeConversation, user } = useConversation();

  if (!activeConversation) return null;

  const isDm = activeConversation.type === 'dm';
  const displayName = isDm 
    ? activeConversation.participants?.find(p => p !== user?.email)?.split("@")[0] || "Chat"
    : activeConversation.name;
  
  const memberCount = isDm ? 2 : (activeConversation.member_count || 1);
  const tabCount = activeConversation.tab_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 px-3 py-2.5 shrink-0"
      style={{
        background: isDm ? 'rgba(13, 30, 51, 0.92)' : 'rgba(250, 248, 245, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: isDm ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(30, 58, 90, 0.1)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)',
            border: isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: isDm ? 'rgba(255,255,255,0.9)' : brandColors.navyDeep }} />
        </motion.button>

        {/* Channel / DM Info */}
        <div
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full min-w-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.6)',
            border: isDm ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isDm ? (
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Hash className="w-4 h-4 shrink-0" style={{ color: brandColors.skyBlue }} />
            )}
            <div className="truncate min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: isDm ? 'rgba(255,255,255,0.95)' : brandColors.navyDeep }}>
                {displayName}
              </div>
              <div className="text-xs" style={{ color: isDm ? 'rgba(255,255,255,0.45)' : brandColors.skyBlue }}>
                {memberCount} member{memberCount > 1 ? 's' : ''}{!isDm && tabCount > 0 ? ` • ${tabCount} tabs` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)',
            border: isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <HelpCircle className="w-5 h-5" style={{ color: isDm ? 'rgba(255,255,255,0.7)' : brandColors.navyDeep }} />
        </motion.button>
      </div>
    </motion.div>
  );
}