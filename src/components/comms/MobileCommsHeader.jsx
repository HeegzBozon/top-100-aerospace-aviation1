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
      className="sticky top-0 z-20 px-3 py-2.5"
      style={{
        background: 'rgba(250, 248, 245, 0.7)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '1px solid rgba(30, 58, 90, 0.1)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
        </motion.button>

        {/* Channel Pill */}
        <div
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isDm ? (
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Hash className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
            )}
            <div className="truncate">
              <div className="text-sm font-semibold truncate" style={{ color: brandColors.navyDeep }}>
                {displayName}
              </div>
              <div className="text-xs" style={{ color: brandColors.skyBlue }}>
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
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <HelpCircle className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
        </motion.button>
      </div>
    </motion.div>
  );
}