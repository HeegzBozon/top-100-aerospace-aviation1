import React, { useState } from "react";
import { ChevronLeft, HelpCircle, Hash, ChevronDown } from "lucide-react";
import { useConversation } from "@/components/contexts/ConversationContext";
import { brandColors } from "@/components/core/brandColors";
import { motion, AnimatePresence } from "framer-motion";
import TribeCRPHeader from "./TribeCRPHeader";

export default function MobileCommsHeader({ onBack }) {
  const { activeConversation, user } = useConversation();
  const [crpOpen, setCrpOpen] = useState(false);

  if (!activeConversation) return null;

  const isDm = activeConversation.type === 'dm';
  const displayName = isDm
    ? activeConversation.participants?.find(p => p !== user?.email)?.split("@")[0] || "Chat"
    : activeConversation.name;

  const memberCount = isDm ? 2 : (activeConversation.member_count || 1);
  const tabCount = activeConversation.tab_count || 0;

  // CRP progress summary for the pill subtitle
  const completedSteps = activeConversation?.crp_completed_steps?.length || 0;
  const crpSubtitle = isDm
    ? `CRP ${completedSteps}/16 · tap to expand`
    : `${memberCount} member${memberCount > 1 ? 's' : ''}${tabCount > 0 ? ` · ${tabCount} tabs` : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 shrink-0"
      style={{
        background: isDm ? 'rgba(13, 30, 51, 0.95)' : 'rgba(250, 248, 245, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: isDm ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(30, 58, 90, 0.1)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)',
            border: isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)',
          }}
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: isDm ? 'rgba(255,255,255,0.9)' : brandColors.navyDeep }} />
        </motion.button>

        {/* Center Pill — tappable on DM to toggle CRP */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => isDm && setCrpOpen(o => !o)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full min-w-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.6)',
            border: isDm
              ? crpOpen ? '1px solid rgba(201,168,124,0.4)' : '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(255, 255, 255, 0.7)',
            cursor: isDm ? 'pointer' : 'default',
          }}
          aria-expanded={isDm ? crpOpen : undefined}
          aria-label={isDm ? `${displayName} — toggle CRP pipeline` : displayName}
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
            <div className="truncate min-w-0 text-left">
              <div className="text-sm font-semibold truncate" style={{ color: isDm ? 'rgba(255,255,255,0.95)' : brandColors.navyDeep }}>
                {displayName}
              </div>
              {isDm ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {/* Micro progress bar */}
                  <div className="relative h-1.5 rounded-full overflow-hidden" style={{ width: 64, background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #ec4899, #f59e0b)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((completedSteps / 16) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'rgba(201,168,124,0.65)' }}>
                    {completedSteps}/16
                  </span>
                </div>
              ) : (
                <div className="text-xs truncate" style={{ color: brandColors.skyBlue }}>
                  {crpSubtitle}
                </div>
              )}
            </div>
          </div>
          {isDm && (
            <motion.div
              animate={{ rotate: crpOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className="w-4 h-4" style={{ color: 'rgba(201,168,124,0.7)' }} />
            </motion.div>
          )}
        </motion.button>

        {/* Right Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)',
            border: isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)',
          }}
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" style={{ color: isDm ? 'rgba(255,255,255,0.7)' : brandColors.navyDeep }} />
        </motion.button>
      </div>

      {/* CRP Panel — slides down when open on DM threads */}
      <AnimatePresence>
        {isDm && crpOpen && (
          <motion.div
            key="crp-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <TribeCRPHeader conversation={activeConversation} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}