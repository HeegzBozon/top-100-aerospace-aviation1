import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, Trophy, Compass, Calendar, MessageCircle, Users,
  Bookmark, MoreHorizontal, Plus, Settings, User,
  Smile, ChevronRight, Hash, Briefcase, Gamepad2, Video, ShieldCheck,
  Search, Rocket, X, Clock, ArrowUp, ArrowDown, Send, Lightbulb
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConversation } from "@/components/contexts/ConversationContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import InvitePeopleModal from "./InvitePeopleModal";
import { iconMap, DefaultIcon } from "@/components/icons";
import { brandColors } from "@/components/layout/navConfig";



const AUTH_ONLY_LABELS = new Set(['saved', 'bookmark', 'bookmarks']);

// Static fallbacks synchronized with CORE_NAV_ITEMS
const FALLBACK_RAIL = [
  { icon: "Home", label: "Home", page: "Home" },
  { icon: "MessageCircle", label: "Comms", page: "Comms" },
  { icon: "CircuitBoard", label: "Index", page: "Top100Women2025" },
];

const FALLBACK_MORE = [
  { icon: "Gamepad2", label: "Play", page: "Arcade" },
  { icon: "Rocket", label: "Party", page: "LaunchParty" },
  { icon: "User", label: "Profile", page: "Profile" },
  { icon: "Settings", label: "Settings", page: "Profile" },
];

function RailIcon({ iconName, className }) {
  const Icon = iconMap[iconName] || DefaultIcon;
  return <Icon className={className} />;
}

export default function CommsIconRail({ currentPageName, totalUnread }) {
  const { user, selectConversation } = useConversation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [railItems, setRailItems] = useState([]);
  const [moreItems, setMoreItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem('top100_recent_searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  const addRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('top100_recent_searches', JSON.stringify(updated));
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const query = searchQuery.toLowerCase().trim();
        const allNominees = await base44.entities.Nominee.list('-created_date', 1000);
        const nomineeResults = allNominees
          .filter(n =>
            (n.status === 'active' || n.status === 'approved') &&
            (n.name?.toLowerCase().includes(query) ||
              n.description?.toLowerCase().includes(query) ||
              n.title?.toLowerCase().includes(query) ||
              n.company?.toLowerCase().includes(query))
          )
          .slice(0, 5)
          .map(n => ({
            type: 'nominee',
            id: n.id,
            title: n.name,
            subtitle: n.title || n.description?.substring(0, 60),
            avatar: n.avatar_url,
          }));

        setSearchResults(nomineeResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    base44.entities.RailItem.list()
      .then((data) => {
        const enabled = data.filter(i =>
          i.is_enabled !== false &&
          i.is_desktop !== false &&
          (!AUTH_ONLY_LABELS.has(i.label?.toLowerCase()) || !!user)
        );
        const sorted = [...enabled].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setRailItems(sorted.filter(i => !i.is_more_item));
        setMoreItems(sorted.filter(i => i.is_more_item));
      })
      .catch(() => {
        // silently fall back to hardcoded defaults
      });
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleCreateMessage = () => {
    setCreateMenuOpen(false);
    navigate(createPageUrl('Comms'));
    // Trigger new conversation modal via context or URL param
    window.dispatchEvent(new CustomEvent('openNewConversation', { detail: { type: 'dm' } }));
  };

  const handleCreateJob = () => {
    setCreateMenuOpen(false);
    navigate(createPageUrl('MissionControl') + '?module=employer');
  };

  const handleCreateEvent = () => {
    setCreateMenuOpen(false);
    navigate(createPageUrl('Calendar') + '?action=create');
  };

  const handleCreateNomination = () => {
    setCreateMenuOpen(false);
    navigate(createPageUrl('Nominations') + '?nominate=true');
  };

  const handleSearch = (searchValue) => {
    if (searchValue.trim()) {
      addRecentSearch(searchValue.trim());
      setSearchOpen(false);
      setSearchQuery('');
      window.location.href = createPageUrl(`Top100Women2025?search=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <div
      className="h-full w-[76px] flex flex-col items-center shrink-0 border-r border-white/10"
      style={{
        background: 'rgba(15, 26, 42, 0.85)',
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      }}
    >


      {/* Main Nav Items */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-2">
        {(railItems.length ? railItems : FALLBACK_RAIL.filter(i => !AUTH_ONLY_LABELS.has(i.label?.toLowerCase()) || !!user)).map((item) => {
          const isActive = currentPageName === item.page;
          const url = item.query ? `${item.page}?${item.query}` : item.page;
          return (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Link
                to={createPageUrl(url)}
                onClick={() => {
                  if (item.page !== "Comms" && selectConversation) selectConversation(null);
                }}
                className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all relative group"
                title={item.label}
              >
                <div className={cn(
                   "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                   isActive
                     ? "bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(201,168,124,0.3)]"
                     : "text-white/60 group-hover:bg-white/10 group-hover:text-white"
                )}>
                   <RailIcon iconName={item.icon} className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300",
                  isActive ? "text-white opacity-100" : "text-white/40 group-hover:opacity-80"
                )}>
                  {item.label}
                </span>
                {item.label === "Comms" && totalUnread > 0 && (
                  <span
                    className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black text-white rounded-full ring-2 ring-[#0f1a2a]"
                    style={{ background: brandColors.roseAccent }}
                  >
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Admin-only: Publisher */}
        {user?.role === 'admin' && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
            <Link
              to={createPageUrl('Publisher')}
              className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all relative group"
              title="Publisher"
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                currentPageName === 'Publisher'
                  ? "bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(201,168,124,0.3)]"
                  : "text-white/60 group-hover:bg-white/10 group-hover:text-white"
              )}>
                <Send className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300",
                currentPageName === 'Publisher' ? "text-white opacity-100" : "text-white/40 group-hover:opacity-80"
              )}>
                Publish
              </span>
            </Link>
          </motion.div>
        )}

        {/* Search in main rail */}
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <button className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all w-full group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all text-white/60 group-hover:text-white group-hover:bg-white/10">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:opacity-80">Search</span>
              </button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-80 p-0 border-0 shadow-2xl"
            style={{ background: '#1a1d21' }}
          >
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search nominees…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  autoFocus
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 text-sm"
                />
              </div>
            </div>

            {searchQuery.trim() && (
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSearch(searchQuery)}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white">Search for "{searchQuery}"</span>
                </div>
              </div>
            )}

            {recentSearches.length > 0 && !searchQuery.trim() && (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-medium text-white/40">Recent</div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                    onClick={() => handleSearch(search)}
                  >
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-sm text-white">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {searchLoading && (
              <div className="p-3 text-center text-xs text-white/60">Searching…</div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="py-2 border-t border-white/10">
                <div className="px-3 py-2 text-xs font-medium text-white/40">Results</div>
                {searchResults.map((result) => (
                  <a
                    key={`${result.type}-${result.id}`}
                    href={createPageUrl(`Nominee?id=${result.id}`)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors"
                  >
                    {result.avatar ? (
                      <img
                        src={result.avatar}
                        alt={result.title}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold">
                        {result.title?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-white/60 truncate">{result.subtitle}</div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* More Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <button className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all w-full group">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all text-white/60 group-hover:text-white group-hover:bg-white/10">
                  <MoreHorizontal className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 group-hover:opacity-80">More</span>
              </button>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-64 p-0 border-0 shadow-2xl"
            style={{ background: '#1a1d21' }}
          >
            <div className="p-3 border-b border-white/10">
              <p className="font-semibold text-[15px] text-white">More</p>
            </div>
            <div className="py-2">
              {(moreItems.length ? moreItems : FALLBACK_MORE).map((item) => (
                <Link
                  key={item.label}
                  to={createPageUrl(item.page)}
                  onClick={() => {
                    if (selectConversation) selectConversation(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-600/30">
                    <RailIcon iconName={item.icon} className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[15px] text-white">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>



      {/* User Profile at Bottom */}
      {user && (
        <div className="mt-auto flex flex-col items-center gap-2 pb-2">
          {/* Add/Create Button with Popover */}
          <Popover open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
            <PopoverTrigger asChild>
              <button className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              className="w-72 p-0 border-0 shadow-2xl"
              style={{ background: 'white' }}
            >
              <div className="p-3 border-b" style={{ borderColor: `${brandColors.navyDeep}10` }}>
                <p className="font-semibold text-[15px]" style={{ color: brandColors.navyDeep }}>Create</p>
              </div>
              <div className="py-2">
                <button
                  onClick={handleCreateMessage}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${brandColors.skyBlue}20` }}
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[15px]" style={{ color: brandColors.navyDeep }}>Message</p>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>Start a conversation in a DM or channel</p>
                  </div>
                  <span className="text-xs" style={{ color: `${brandColors.navyDeep}40` }}>⌘N</span>
                </button>

                <button
                  onClick={handleCreateJob}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${brandColors.goldPrestige}20` }}
                  >
                    <Briefcase className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[15px]" style={{ color: brandColors.navyDeep }}>New Job/Opportunity</p>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>Post a job or opportunity listing</p>
                  </div>
                </button>

                <button
                  onClick={handleCreateEvent}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${brandColors.roseAccent}20` }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: brandColors.roseAccent }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[15px]" style={{ color: brandColors.navyDeep }}>Event</p>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>Schedule a meeting or event</p>
                  </div>
                </button>

                <button
                  onClick={handleCreateNomination}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${brandColors.navyDeep}15` }}
                  >
                    <Trophy className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[15px]" style={{ color: brandColors.navyDeep }}>Nomination</p>
                    <p className="text-xs" style={{ color: `${brandColors.navyDeep}60` }}>Nominate someone for TOP 100</p>
                  </div>
                </button>
              </div>

              <div className="border-t py-2" style={{ borderColor: `${brandColors.navyDeep}10` }}>
                <button
                  onClick={() => { setCreateMenuOpen(false); setShowInviteModal(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 ml-2.5" style={{ color: `${brandColors.navyDeep}60` }} />
                  <span className="text-[15px]" style={{ color: brandColors.navyDeep }}>Invite people</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Invite Modal */}
          <InvitePeopleModal
            open={showInviteModal}
            onClose={() => setShowInviteModal(false)}
          />

          {/* User Avatar with Popover */}
          <Popover open={profileOpen} onOpenChange={setProfileOpen}>
            <PopoverTrigger asChild>
              <button className="w-11 h-11 rounded-lg overflow-hidden relative hover:opacity-90 transition-all">
                {user.avatar_url ? (
                  <img src={user.avatar_url} className="w-11 h-11 object-cover" alt="" />
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.full_name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1a2a] rounded-full" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              className="w-72 p-0 border-0 shadow-2xl"
              style={{ background: '#1a1d21' }}
            >
              {/* User Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-14 h-14 object-cover" alt="" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {user.full_name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-[15px]">{user.full_name || user.email?.split('@')[0]}</p>
                  <p className="text-green-400 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Active
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="px-4 pb-3">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 transition-colors">
                  <Smile className="w-5 h-5" />
                  <span className="text-[15px]">Update your status</span>
                </button>
              </div>

              <div className="h-px bg-white/10" />

              {/* Menu Items */}
              <div className="py-2">
                <button className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Set yourself as <strong>away</strong></span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Pause notifications</span>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <div className="h-px bg-white/10" />

              <div className="py-2">
                <Link
                  to={createPageUrl('Profile')}
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[15px]">Profile</span>
                </Link>
                <Link
                  to={createPageUrl('Profile')}
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[15px]">Preferences</span>
                  <span className="text-white/40 text-xs">⌘,</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to={createPageUrl('Admin')}
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-amber-300 hover:bg-white/10 transition-colors font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[15px]">Admin Panel</span>
                  </Link>
                )}
              </div>

              <div className="h-px bg-white/10" />

              <div className="py-2">
                <button className="w-full flex items-center justify-between px-4 py-2 text-white/90 hover:bg-white/10 transition-colors">
                  <span className="text-[15px]">Downloads</span>
                  <span className="text-white/40 text-xs">⌘⇧J</span>
                </button>
              </div>

              <div className="h-px bg-white/10" />

              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-white/90 hover:bg-white/10 transition-colors"
                >
                  <span className="text-[15px]">Sign out of TOP 100 Aerospace</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}