import { useState } from "react";
import { useConversation } from "@/components/capabilities/contexts/ConversationContext";
import { useUnread } from "@/components/capabilities/contexts/UnreadContext";
import NewConversationModal from "./NewConversationModal";
import ChannelManagerModal from "./ChannelManagerModal";
import { ChannelsList } from "./ChannelsList";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Drawer({ currentPageName, onMobileClose, user }) {
  const {
    channels,
    dms,
    selectConversation,
    activeConversation,
  } = useConversation();
  const { unreadCounts } = useUnread();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showChannelManager, setShowChannelManager] = useState(false);
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

  // Filter DMs by selected RRF stage
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
    <div className="h-full flex flex-col text-white w-full md:w-72 border-r" style={{ background: 'linear-gradient(180deg, #0f1f33 0%, #1a2f47 100%)', borderColor: 'rgba(201, 168, 124, 0.15)' }}>
      {/* Header */}
      <div className="px-4 py-6 md:py-8 border-b flex flex-col items-center backdrop-blur-sm" style={{ background: 'rgba(201, 168, 124, 0.08)', borderColor: 'rgba(201, 168, 124, 0.2)' }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
          alt="TOP 100 Aerospace & Aviation"
          className="w-48 h-48 object-contain"
        />

        {/* Close button for mobile */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 md:hidden p-1.5 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Conditional content based on page */}
      {isCommsPage ? (
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
          <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-3 space-y-1.5">
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

        {/* Lt. Perry */}
        <button
          onClick={() => {
            selectConversation({ id: '__perry__', type: 'dm', is_perry: true, name: 'Lt. Perry' });
            onMobileClose?.();
          }}
          className={cn(
            "w-full px-3 py-3 rounded-lg transition-all duration-300 group flex items-start gap-3 border-l-2",
            activeConversation?.is_perry
              ? "bg-gradient-to-r from-amber-900/40 to-amber-900/20 border-l-amber-600 shadow-lg shadow-amber-600/10"
              : "hover:bg-slate-800/30 border-l-transparent group-hover:border-l-amber-600/50"
          )}
        >
          <div className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-200",
            activeConversation?.is_perry
              ? "bg-gradient-to-br from-amber-600 to-amber-700"
              : "bg-slate-700 group-hover:bg-slate-600"
          )}>
            P
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">Lt. Perry</p>
            <p className="text-xs text-gray-400 truncate">AI Agent • Straight Line</p>
          </div>
          {unreadCounts['__perry__'] > 0 && (
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ml-auto">
              {unreadCounts['__perry__']}
            </div>
          )}
        </button>

        {/* DM Divider */}
        {filteredDMs.length > 0 && (
          <div className="my-3 border-t border-gray-800/50" />
        )}

        {/* User DMs */}
        {filteredDMs.map(conv => {
          const isActive = activeConversation?.id === conv.id;
          const unread = unreadCounts[conv.id] || 0;
          const displayName = getDisplayName(conv);
          const subtitle = getSubtitle(conv);
          const initials = getInitials(conv.participants?.find(p => p !== user?.email) || '');
          const gradientClass = getAvatarGradient(conv);

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
              <div className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 transition-all duration-200",
                "bg-gradient-to-br from-slate-600 to-slate-700"
              )}>
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
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
          <ChannelsList
            channels={channels}
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
            const { Conversation } = await import("@/entities/Conversation");
            const newConv = await Conversation.create({
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
    </div>
  );
}