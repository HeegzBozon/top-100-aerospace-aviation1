import { useState } from "react";
import { Link } from "react-router-dom";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";
import NewConversationModal from "./NewConversationModal";
import ChannelManagerModal from "./ChannelManagerModal";
import ContactUsModal from "./ContactUsModal";
import { ChannelsList } from "./ChannelsList";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommsTheme } from "@/components/contexts/CommsThemeContext";

export default function Drawer({ currentPageName, onMobileClose, user }) {
  const { theme } = useCommsTheme();
  const {
    channels,
    dms,
    selectConversation,
    activeConversation,
  } = useConversation();
  const { unreadCounts } = useUnread();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showChannelManager, setShowChannelManager] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const isAdmin = user?.role === 'admin';
  const isCommsPage = currentPageName?.toLowerCase() === 'comms';

  // Fetch channel categories (for default view)
  const { data: channelCategories = [] } = useQuery({
    queryKey: ['channelCategories'],
    queryFn: async () => {
      try {
        return await base44.entities.ChannelCategory?.list?.() || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Separate top-priority channels and filter DMs by selected RRF stage
  const topChannels = channels.filter(ch => {
    const name = ch.name?.toLowerCase();
    return name === 'welcome-and-rules' || name === 'announcements' || name === 'nominations';
  }).sort((a, b) => {
    const order = { 'welcome-and-rules': 0, 'announcements': 1, 'nominations': 2 };
    const aOrder = order[a.name?.toLowerCase()] ?? 999;
    const bOrder = order[b.name?.toLowerCase()] ?? 999;
    return aOrder - bOrder;
  });
  const remainingChannels = channels.filter(ch => {
    const name = ch.name?.toLowerCase();
    return name !== 'welcome-and-rules' && name !== 'announcements' && name !== 'nominations' && name !== 'operations';
  });
  const filteredDMs = selectedStage
    ? dms.filter(dm => dm.rrf_stage === selectedStage)
    : dms;

  const getInitials = (email) => {
    if (email === '__you__') return 'Y';
    if (email === '__perry__') return 'P';
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getDisplayName = (conv) => {
    if (conv.is_you) return 'You';
    if (conv.is_perry) return 'Lt. Perry';
    const otherEmail = conv.participants?.find(p => p !== user?.email) || '';
    return otherEmail.split('@')[0];
  };

  const getSubtitle = (conv) => {
    if (conv.is_you) return 'Notes • Tasks • Strategy';
    if (conv.is_perry) return 'AI Agent • Straight Line';
    return 'Direct Message';
  };

  const getAvatarGradient = (conv) => {
    if (conv.is_you) return 'from-blue-500 to-blue-600';
    if (conv.is_perry) return 'from-amber-600 to-orange-600';
    return 'from-gray-600 to-gray-700';
  };

  return (
    <div className="h-full flex flex-col w-full md:w-72 border-r" style={{ background: theme.drawerBg, borderColor: theme.drawerBorder, color: 'white' }}>
      {/* Header */}
      <div className="relative px-4 py-6 md:py-8 border-b flex flex-col items-center backdrop-blur-sm overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.drawerHeaderBg}, rgba(201,168,124,0.08))`, borderColor: theme.drawerHeaderBorder }}>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(rgba(201,168,124,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,124,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,124,0.08) 0%, transparent 70%)' }} />
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
          alt="TOP 100 Aerospace & Aviation"
          className="w-48 h-48 object-contain"
        />

        {/* Close button for mobile */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="absolute top-4 left-4 md:hidden p-1.5 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Conditional content based on page */}
       {isCommsPage && !!user ? (
         <>
           {/* RRF Stage Filter (Comms only) */}
          <div className="px-4 py-4 border-b backdrop-blur-sm" style={{ background: 'rgba(201, 168, 124, 0.05)', borderColor: 'rgba(201, 168, 124, 0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(201, 168, 124, 0.5)' }}>Filter by stage</p>
            <div className="flex gap-2 flex-wrap">
              {['FORM', 'STORM', 'NORM', 'PERFORM'].map(stage => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(selectedStage === stage ? null : stage)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
                    selectedStage === stage
                      ? stage === 'FORM'
                        ? "border-indigo-500/60 bg-indigo-600/20 text-indigo-300 shadow-lg shadow-indigo-500/10"
                        : stage === 'STORM'
                        ? "border-amber-600/60 bg-amber-600/20 text-amber-300 shadow-lg shadow-amber-600/10"
                        : stage === 'NORM'
                        ? "border-rose-500/60 bg-rose-600/20 text-rose-300 shadow-lg shadow-rose-500/10"
                        : "border-amber-400/60 bg-amber-400/15 text-amber-100 shadow-lg shadow-amber-400/10"
                      : "border-slate-700/50 text-slate-500 hover:border-slate-600/70 hover:text-slate-400 hover:bg-slate-900/20"
                  )}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* DM List (Comms only) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-3 space-y-1.5 flex flex-col">
            {/* You - Notes to Self */}
            <button
              onClick={() => {
                selectConversation({ id: '__you__', type: 'dm', is_you: true, name: 'You' });
                onMobileClose?.();
              }}
              className={cn(
                "w-full px-3 py-3 rounded-lg transition-all duration-300 group flex items-start gap-3 border-l-2",
                activeConversation?.is_you
                  ? "bg-gradient-to-r from-indigo-900/40 to-indigo-900/20 border-l-indigo-500 shadow-lg shadow-indigo-500/10"
                  : "hover:bg-slate-800/30 border-l-transparent group-hover:border-l-indigo-500/50"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-200",
                activeConversation?.is_you
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                  : "bg-slate-700 group-hover:bg-slate-600"
              )}>
                Y
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">You</p>
                <p className="text-xs text-gray-400 truncate">Notes • Tasks • Strategy</p>
              </div>
              {unreadCounts['__you__'] > 0 && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ml-auto">
                  {unreadCounts['__you__']}
                </div>
              )}
            </button>

            {filteredDMs.length > 0 && (
              <div className="my-3 border-t border-gray-800/50" />
            )}

            {filteredDMs.map(conv => {
              const isActive = activeConversation?.id === conv.id;
              const unread = unreadCounts[conv.id] || 0;
              const displayName = getDisplayName(conv);
              const subtitle = getSubtitle(conv);
              const initials = getInitials(conv.participants?.find(p => p !== user?.email) || '');

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    selectConversation(conv);
                    onMobileClose?.();
                  }}
                  className={cn(
                    "w-full px-3 py-3 rounded-lg transition-all duration-300 group flex items-start gap-3 border-l-2",
                    isActive
                      ? "bg-gradient-to-r from-rose-900/40 to-rose-900/20 border-l-rose-500 shadow-lg shadow-rose-500/10"
                      : "hover:bg-slate-800/30 border-l-transparent group-hover:border-l-rose-500/50"
                  )}
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 bg-gradient-to-br from-slate-600 to-slate-700">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{subtitle}</p>
                  </div>
                  {unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ml-auto">
                      {unread}
                    </div>
                  )}
                </button>
              );
            })}

            {filteredDMs.length === 0 && selectedStage && (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: 'rgba(201, 168, 124, 0.4)' }}>No conversations in {selectedStage} stage</p>
              </div>
            )}
          </div>
         </>
         ) : (
        /* Default channels view for all other pages */
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 flex flex-col gap-3">
          {/* Top-priority channels (Welcome Rules, Nominations) */}
          <div className="space-y-1.5">
            {topChannels.map(ch => {
              const name = ch.name?.toLowerCase();
              const IconComponent = name === 'welcome-and-rules' ? () => <span className="text-lg">📖</span> : name === 'announcements' ? () => <span className="text-lg">📢</span> : () => <span className="text-lg">🗳️</span>;
              const isActive = activeConversation?.id === ch.id;
              const unread = unreadCounts[ch.id] || 0;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    selectConversation(ch);
                    onMobileClose?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all border-l-2",
                    isActive
                      ? "text-white bg-slate-800/50 border-l-blue-400"
                      : "text-white/75 hover:bg-white/10 hover:text-white border-l-transparent hover:border-l-amber-400/50"
                  )}
                >
                  <IconComponent />
                  <span className="text-sm truncate flex-1 text-left tracking-wide font-medium">{ch.name}</span>
                  {unread > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full shrink-0" style={{ background: '#E01E5A' }}>
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800/50" />

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <ChannelsList
              channels={remainingChannels}
              channelCategories={channelCategories}
              collapsedCategories={collapsedCategories}
              onToggleCategory={(catId) => setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }))}
              onSelectConversation={(conv) => {
                selectConversation(conv);
                onMobileClose?.();
              }}
              isAdmin={isAdmin}
              onShowNewModal={() => setShowNewModal(true)}
              onShowChannelManager={() => setShowChannelManager(true)}
            />
          </div>

          {/* Contact Us */}
          <div className="border-t border-gray-800/50 pt-2">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full px-4 py-3 rounded-xl transition-all text-white font-semibold text-sm flex items-center gap-3 border-2 border-gray-700/50 hover:border-gray-600 hover:bg-white/5"
            >
              <span className="text-lg">✉️</span>
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      <NewConversationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreateDM={async (email) => {
          const existing = dms.find(c =>
            c.participants?.includes(email) &&
            c.participants?.includes(user?.email)
          );
          if (existing) {
            selectConversation(existing);
          } else {
            const newConv = await base44.entities.Conversation.create({
              type: "dm",
              participants: [user.email, email],
            });
            selectConversation(newConv);
          }
          setShowNewModal(false);
          onMobileClose?.();
        }}
        currentUserEmail={user?.email}
      />

      {isAdmin && (
        <ChannelManagerModal
          open={showChannelManager}
          onClose={() => setShowChannelManager(false)}
        />
      )}

      <ContactUsModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
}