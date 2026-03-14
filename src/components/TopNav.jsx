import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DockItem } from '@/entities/DockItem';
import { User } from '@/entities/User';
import { base44 } from '@/api/base44Client';
import { iconMap, DefaultIcon } from '@/components/icons';
import { Menu, X, LogIn, Shield, ShoppingBag, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import UserProfileTrigger from '@/components/UserProfileTrigger';
import NotificationCenter from '@/components/notifications/NotificationCenter';

import { brandColors } from "@/components/core/brandTheme";

function NavLink({ item, isActive, onClick }) {
  const IconComponent = iconMap[item.icon] || DefaultIcon;

  return (
    <Link
      to={createPageUrl(item.pageName)}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
      style={{
        background: isActive ? `${brandColors.goldPrestige}20` : 'transparent',
        color: isActive ? brandColors.goldPrestige : brandColors.navyDeep,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: isActive ? 600 : 500,
      }}
    >
      <IconComponent className="w-5 h-5" />
      <span className="text-sm">{item.label}</span>
    </Link>
  );
}

const publicNavItems = [];

export default function TopNav() {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSME, setIsSME] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop() || 'Home';
  const isLandingPage = currentPage === 'Landing' || location.pathname === '/Landing' || location.pathname === '/';
  const isMissionControl = currentPage === 'MissionControl' || location.pathname === '/MissionControl' || location.pathname === '/';

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-notifications', userEmail, isAdmin],
    queryFn: async () => {
      if (!userEmail) return 0;
      let count = 0;

      // Count regular unread notifications
      const notifications = await base44.entities.Notification.filter(
        { user_email: userEmail, read: false }
      );
      count += notifications.length;

      // For admins, also count pending nominees
      if (isAdmin) {
        const pendingNominees = await base44.entities.Nominee.filter({ status: 'pending' });
        count += pendingNominees.length;
      }

      return count;
    },
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const query = searchQuery.toLowerCase().trim();

        // Search nominees - fetch all active nominees
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

        // Search events
        const allEvents = await base44.entities.Event.list('-event_date', 50);
        const eventResults = allEvents
          .filter(e =>
            e.title?.toLowerCase().includes(query) ||
            e.description?.toLowerCase().includes(query)
          )
          .slice(0, 3)
          .map(e => ({
            type: 'event',
            id: e.id,
            title: e.title,
            subtitle: new Date(e.event_date).toLocaleDateString(),
          }));

        setSearchResults([...nomineeResults, ...eventResults]);
        setShowSearchResults(true);
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
    const loadNavItems = async () => {
      try {
        // Check if user is logged in
        const isAuth = await base44.auth.isAuthenticated();
        setIsLoggedIn(isAuth);

        if (isAuth) {
          // Get user info for admin/SME check
          try {
            const user = await User.me();
            setIsAdmin(user?.role === 'admin');
            setIsSME(user?.role === 'admin' || user?.is_sme === true);
            setUserEmail(user?.email);
          } catch (e) {
            setIsAdmin(false);
            setIsSME(false);
            setUserEmail(null);
          }

          // Load dynamic nav items for logged-in users
          const items = await DockItem.list('order');
          const enabledItems = items.filter(item => item.isEnabled).sort((a, b) => a.order - b.order);
          setNavItems(enabledItems.length > 0 ? enabledItems : publicNavItems);
        } else {
          setNavItems(publicNavItems);
        }
      } catch (error) {
        // Not logged in - show public nav
        setIsLoggedIn(false);
        setNavItems(publicNavItems);
      } finally {
        setLoading(false);
      }
    };
    loadNavItems();
  }, []);

  if (loading) {
    return (
      <nav
        className="h-16 sticky top-0 z-[9999]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="w-24 h-6 bg-slate-200/50 rounded animate-pulse" />
          <div className="hidden md:flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-8 bg-slate-200/50 rounded animate-pulse" />)}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="h-14 md:h-16 sticky top-0 z-[9999]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="max-w-6xl mx-auto px-3 md:px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2 md:gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
              alt="TOP 100 Aerospace & Aviation"
              className="h-9 w-9 md:h-12 md:w-12 object-contain"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="text-lg md:text-xl tracking-wide"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  color: brandColors.navyDeep,
                  letterSpacing: '0.05em'
                }}
              >
                TOP 100
              </span>
              <span
                className="text-[9px] md:text-[10px] uppercase tracking-[0.2em]"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  color: brandColors.goldPrestige
                }}
              >
                Aerospace & Aviation
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Absolutely Centered */}
          {!(isMissionControl && !isLoggedIn) && (
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
              <div className="relative" style={{ width: 'min(90vw, 32rem)', maxWidth: '32rem' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      setShowSearchResults(false);
                      window.location.href = createPageUrl(`CourtOfHonor?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="relative flex items-center group"
                >
                  <Search className="absolute left-3 w-4 h-4 z-10 transition-all" style={{ color: brandColors.goldPrestige }} />
                  <input
                    type="text"
                    placeholder="Search nominees, honorees, events, companies, roles..."
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      // Update URL without reload if on CourtOfHonor
                      if (currentPage === 'CourtOfHonor' && value.trim()) {
                        const url = new URL(window.location);
                        url.searchParams.set('search', value);
                        window.history.replaceState({}, '', url);
                      } else if (currentPage === 'CourtOfHonor' && !value.trim()) {
                        const url = new URL(window.location);
                        url.searchParams.delete('search');
                        window.history.replaceState({}, '', url);
                      }
                    }}
                    onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    className="w-full pl-10 pr-28 py-2.5 rounded-xl text-sm transition-all shadow-sm focus:shadow-md focus:scale-[1.02] focus:outline-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                      border: `2px solid ${brandColors.goldPrestige}40`,
                      color: brandColors.navyDeep,
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all hover:scale-105 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #c9a87c 0%, #d4a574 100%)',
                      color: 'white',
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  >
                    EXPLORE
                  </button>
                </form>

                {/* Live Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchResults && (searchResults.length > 0 || searchLoading) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full rounded-xl shadow-2xl overflow-hidden z-50"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: `1px solid ${brandColors.goldPrestige}30`,
                        maxHeight: '400px',
                        overflowY: 'auto'
                      }}
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center text-sm" style={{ color: brandColors.navyDeep }}>
                          Searching...
                        </div>
                      ) : (
                        <div className="py-2">
                          {searchResults.map((result, idx) => (
                            <a
                              key={`${result.type}-${result.id}`}
                              href={result.type === 'nominee'
                                ? createPageUrl(`Nominee?id=${result.id}`)
                                : createPageUrl(`EventPage?id=${result.id}`)
                              }
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 transition-colors"
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              {result.type === 'nominee' ? (
                                result.avatar ? (
                                  <img
                                    src={result.avatar}
                                    alt={result.title}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ background: brandColors.goldPrestige }}
                                  >
                                    {result.title?.charAt(0)}
                                  </div>
                                )
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ background: `${brandColors.skyBlue}20`, color: brandColors.skyBlue }}
                                >
                                  📅
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-semibold text-sm truncate"
                                  style={{ color: brandColors.navyDeep }}
                                >
                                  {result.title}
                                </div>
                                {result.subtitle && (
                                  <div className="text-xs truncate" style={{ color: brandColors.goldPrestige }}>
                                    {result.subtitle}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full" style={{
                                background: result.type === 'nominee' ? `${brandColors.goldPrestige}20` : `${brandColors.skyBlue}20`,
                                color: result.type === 'nominee' ? brandColors.goldPrestige : brandColors.skyBlue,
                              }}>
                                {result.type}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/40 relative"
                style={{ color: brandColors.navyDeep }}
                onClick={() => setNotificationCenterOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                    style={{ background: '#ef4444' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            )}
            <Link to={createPageUrl('Shop')}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/40"
                style={{ color: brandColors.navyDeep }}
              >
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <UserProfileTrigger />
              </>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                size="sm"
                className="rounded-full px-6"
                style={{
                  background: brandColors.goldPrestige,
                  color: 'white',
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-1">
            {isLoggedIn && (
              <UserProfileTrigger />
            )}
            <button
              className="p-1.5 rounded-full hover:bg-white/40"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-14 left-0 right-0 z-30"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.75) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderBottom: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.pageName}
                  item={item}
                  isActive={currentPage === item.pageName}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}

              {isAdmin && (
                <button
                  onClick={() => { setMobileMenuOpen(false); setNotificationCenterOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all w-full text-left relative"
                  style={{ color: brandColors.navyDeep }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                      style={{ background: '#ef4444' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Archive Link */}
              <Link
                to={createPageUrl('ArchiveLanding')}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{ color: brandColors.navyDeep }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm">Archive & Downloads</span>
              </Link>

              {!isLoggedIn && (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="w-full mt-4 rounded-full"
                  style={{
                    background: brandColors.goldPrestige,
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </>
  );
}