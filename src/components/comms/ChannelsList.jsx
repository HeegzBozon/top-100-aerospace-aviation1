import { useMemo } from "react";
import { Hash, Lock, ChevronDown, ChevronRight, Plus, Settings, Megaphone, MessageCircle, User, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversation } from "@/components/contexts/ConversationContext";
import { useUnread } from "@/components/contexts/UnreadContext";

const CHANNEL_ICONS = {
  '📢': Megaphone,
  '💬': MessageCircle,
  '👋': User,
  '❓': HelpCircle,
  '✨': Sparkles,
  '🗳️': Sparkles,
  '⚙️': Sparkles,
  '💡': Sparkles,
  '🐛': Sparkles,
  '☕': Sparkles,
};

const PLATFORM_HELP_CATEGORY_NAME = "platform help";

export function ChannelsList({
  channels,
  channelCategories,
  collapsedCategories,
  onToggleCategory,
  onSelectConversation,
  isAdmin,
  onShowNewModal,
  onShowChannelManager,
}) {
  const { activeConversation } = useConversation();
  const { unreadCounts } = useUnread();

  const getChannelIcon = (conv) => {
    if (conv.is_private) return Lock;
    if (conv.icon && CHANNEL_ICONS[conv.icon]) return CHANNEL_ICONS[conv.icon];
    return Hash;
  };

  // Group channels by category
  const grouped = useMemo(() => {
    const groups = {};
    channelCategories.forEach(cat => { groups[cat.id] = []; });
    groups['__none__'] = [];
    channels.forEach(ch => {
      const key = ch.category_id && groups[ch.category_id] !== undefined ? ch.category_id : '__none__';
      groups[key].push(ch);
    });
    Object.keys(groups).forEach(k => groups[k].sort((a, b) => (a.order || 0) - (b.order || 0)));
    return groups;
  }, [channels, channelCategories]);

  const renderChannel = (conv) => {
    const IconComponent = getChannelIcon(conv);
    const isActive = activeConversation?.id === conv.id;
    const unread = unreadCounts[conv.id] || 0;
    return (
      <button
        key={conv.id}
        onClick={() => onSelectConversation(conv)}
        className={cn(
          "w-full flex items-center gap-3 pl-4 pr-2 py-2 rounded-lg transition-all relative overflow-hidden group",
          isActive ? "text-white" : unread > 0 ? "text-white hover:bg-white/10" : "text-white/75 hover:bg-white/8 hover:text-white"
        )}
        style={isActive ? { background: 'linear-gradient(135deg, rgba(17,100,163,0.9), rgba(74,144,184,0.5))' } : {}}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#4a90b8]" />
        )}
        <IconComponent className={cn(
          "w-5 h-5 shrink-0 transition-colors",
          isActive ? "text-[#90c8e8]" : conv.is_readonly ? "text-amber-400" : "text-white/50 group-hover:text-white/80"
        )} />
        <span className={cn(
          "text-[14px] truncate flex-1 text-left tracking-wide",
          isActive ? "font-semibold" : unread > 0 ? "font-bold" : "font-medium"
        )}>
          {conv.name}
        </span>
        {unread > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full shrink-0" style={{ background: '#E01E5A' }}>
            {unread}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Uncategorized channels */}
      {(grouped['__none__'] || []).length > 0 && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {(grouped['__none__'] || []).map(renderChannel)}
        </div>
      )}

      {/* Categorized sections */}
      {channelCategories.map((cat) => {
        const catChannels = grouped[cat.id] || [];
        if (catChannels.length === 0) return null;
        const isCollapsed = collapsedCategories[cat.id];
        const isPlatformHelp = cat.name?.toLowerCase() === PLATFORM_HELP_CATEGORY_NAME;
        return (
          <div key={cat.id} className="mt-2">
            <button
              onClick={() => onToggleCategory(cat.id)}
              className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-semibold text-white/70 hover:text-white/90 transition-colors uppercase tracking-[0.13em]"
            >
              <span className="flex-1 text-left">{cat.name}</span>
              {isCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
            </button>
            {!isCollapsed && catChannels.map(renderChannel)}

          </div>
        );
      })}

      {/* Lt. Perry — Platform Assistant */}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => onSelectConversation({ id: '__perry__', type: 'dm', is_perry: true, name: 'Lt. Perry' })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all min-h-[44px]",
            activeConversation?.is_perry ? "text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
          )}
          style={activeConversation?.is_perry ? { background: 'linear-gradient(135deg, rgba(17,100,163,0.9), rgba(74,144,184,0.5))' } : {}}
          aria-label="Chat with Lt. Perry, platform assistant"
          aria-current={activeConversation?.is_perry ? "page" : undefined}
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden ring-1 ring-amber-400/40 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
                alt="Lt. Perry"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-[#152a42] rounded-full bg-green-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className={cn("text-[14px] truncate block", activeConversation?.is_perry ? "font-semibold text-white" : "font-medium text-white/75")}>
              Lt. Perry
            </span>
            <span className={cn("text-[11px] truncate block", activeConversation?.is_perry ? "text-white/70" : "text-white/50")}>
              Platform assistant
            </span>
          </div>
        </button>
      </div>

      {/* Add Channel (Admin Only) */}
       {isAdmin && (
         <div className="mt-2">
            <button
              onClick={onShowNewModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white/90 transition-all text-[14px] font-medium"
              aria-label="Create new channel (admin only)"
            >
              <Plus className="w-4 h-4" />
              <span>Add channel</span>
            </button>
            <button
              onClick={onShowChannelManager}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white/90 transition-all text-[14px] font-medium"
              aria-label="Manage all channels"
            >
              <Settings className="w-4 h-4" />
              <span>Manage channels</span>
            </button>
         </div>
       )}
    </>
  );
}