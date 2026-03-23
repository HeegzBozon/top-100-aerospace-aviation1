import { useState } from "react";
import { ChevronLeft, HelpCircle, Hash, ChevronDown, CheckSquare } from "lucide-react";
import { useConversation } from "@/components/contexts/ConversationContext";
import { brandColors } from "@/components/core/brandColors";
import { motion, AnimatePresence } from "framer-motion";
import TribeCRPHeader from "./TribeCRPHeader";
import TuckmanInfoPanel from "./TuckmanInfoPanel";
import ConversationTodoPanel, { useTodos } from "./ConversationTodoPanel";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MobileCommsHeader({ onBack }) {
  const { activeConversation, user } = useConversation();
  const [crpOpen, setCrpOpen] = useState(false);
  const [tuckmanOpen, setTuckmanOpen] = useState(false);
  const [todosOpen, setTodosOpen] = useState(false);
  const { pendingCount } = useTodos(activeConversation?.id);

  // Live conversation data so CRP progress stays fresh after step toggles
  const { data: liveConversation } = useQuery({
    queryKey: ["conversation", activeConversation?.id],
    queryFn: () => base44.entities.Conversation.filter({ id: activeConversation.id }, null, 1).then(r => r[0]),
    enabled: !!activeConversation?.id && activeConversation?.type === 'dm',
    staleTime: 3000,
    refetchInterval: 8000,
  });

  if (!activeConversation) return null;

  const isDm = activeConversation.type === 'dm';
  const displayName = isDm
    ? activeConversation.participants?.find(p => p !== user?.email)?.split("@")[0] || "Chat"
    : activeConversation.name;

  const memberCount = isDm ? 2 : (activeConversation.member_count || 1);
  const tabCount = activeConversation.tab_count || 0;

  const conversation = liveConversation || activeConversation;
  const completedSteps = conversation?.crp_completed_steps?.length || 0;
  const crpSubtitle = `${memberCount} member${memberCount > 1 ? 's' : ''}${tabCount > 0 ? ` · ${tabCount} tabs` : ''}`;

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

        {/* Todo button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTodosOpen(o => !o); setTuckmanOpen(false); }}
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: todosOpen
              ? 'rgba(16,185,129,0.2)'
              : (isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)'),
            border: todosOpen
              ? '1px solid rgba(16,185,129,0.4)'
              : (isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)'),
          }}
          aria-label="Action items"
          aria-expanded={todosOpen}
        >
          <CheckSquare className="w-5 h-5" style={{ color: todosOpen ? 'rgb(110,231,183)' : (isDm ? 'rgba(255,255,255,0.7)' : brandColors.navyDeep) }} />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold bg-emerald-500 text-white tabular-nums">
              {pendingCount}
            </span>
          )}
        </motion.button>

        {/* Right Button — Tuckman info toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTuckmanOpen(o => !o); setTodosOpen(false); }}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: tuckmanOpen
              ? (isDm ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)')
              : (isDm ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.5)'),
            border: tuckmanOpen
              ? '1px solid rgba(99,102,241,0.5)'
              : (isDm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255, 255, 255, 0.6)'),
          }}
          aria-label="Tuckman stages info"
          aria-expanded={tuckmanOpen}
        >
          <HelpCircle className="w-5 h-5" style={{ color: tuckmanOpen ? 'rgb(165,180,252)' : (isDm ? 'rgba(255,255,255,0.7)' : brandColors.navyDeep) }} />
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
            <TribeCRPHeader
              conversation={conversation}
              expanded={crpOpen}
              onToggleExpand={() => setCrpOpen(o => !o)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Items Panel */}
      <ConversationTodoPanel
        open={todosOpen}
        onClose={() => setTodosOpen(false)}
        conversationId={activeConversation?.id}
        isDm={isDm}
      />

      {/* Tuckman Info Panel */}
      <TuckmanInfoPanel
        open={tuckmanOpen}
        onClose={() => setTuckmanOpen(false)}
      />
    </motion.div>
  );
}