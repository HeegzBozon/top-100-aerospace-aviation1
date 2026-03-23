import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, Hash, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversation } from "@/components/contexts/ConversationContext";

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "channels", label: "Channels" },
  { id: "people", label: "People" },
  { id: "nominees", label: "Nominees" },
];

const getDisplayName = (email) => {
  const name = email?.split("@")[0] || "Unknown";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function MobileSearch({ open, onClose }) {
  const { user, channels, dms, selectConversation } = useConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  const handleSelect = (conv) => {
    selectConversation(conv);
    onClose();
    setSearchQuery("");
    setSearchFilter("all");
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setSearchFilter("all");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'var(--bg, #faf8f5)' }}
        >
          {/* Header */}
          <div className="px-4 pt-12 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ce29eba0_ChatGPTImageDec3202506_22_48PM.png"
                  alt="TOP 100"
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Search</h1>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="text-sm" style={{ background: 'var(--accent)', color: 'white' }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSearchFilter(tab.id)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: searchFilter === tab.id ? 'var(--accent)' : 'var(--card)',
                    color: searchFilter === tab.id ? 'white' : 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
            <button className="w-full flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-2)' }}>
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <span className="text-[15px]" style={{ color: 'var(--text)' }}>Invite a teammate</span>
            </button>

            {(searchFilter === "all" || searchFilter === "people") && dms.map((dm) => {
              const otherEmail = dm.participants?.find(p => p !== user?.email) || "Unknown";
              const name = getDisplayName(otherEmail);
              return (
                <button key={dm.id} onClick={() => handleSelect(dm)} className="w-full flex items-center gap-3 py-3 text-left">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback style={{ background: 'var(--accent)', color: 'white' }}>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-[15px]" style={{ color: 'var(--text)' }}>{name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{otherEmail}</div>
                  </div>
                </button>
              );
            })}

            {(searchFilter === "all" || searchFilter === "channels") && channels.map((channel) => (
              <button key={channel.id} onClick={() => handleSelect(channel)} className="w-full flex items-center gap-3 py-3 text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {channel.is_private
                    ? <Lock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    : <Hash className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  }
                </div>
                <span className="text-[15px]" style={{ color: 'var(--text)' }}>{channel.name}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-5 h-5" style={{ color: 'var(--muted)' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
              <button onClick={handleClose} className="absolute right-3 w-8 h-8 flex items-center justify-center">
                <X className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}