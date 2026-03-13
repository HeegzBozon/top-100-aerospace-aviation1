import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Home,
  Trophy,
  Users,
  Calendar,
  Send,
  Settings,
  Star,
  Plus,
  X,
  Plane,
  Award,
  Briefcase,
  Heart,
  Rocket,
  Target,
  Zap,
  Globe,
  BookOpen,
  MessageSquare,
  Bell,
  Search,
  LayoutDashboard,
  Compass,
  Bookmark,
  FolderOpen,
} from 'lucide-react';

import * as LucideIcons from 'lucide-react';
import {
  brandColors,
  ALL_RESOURCES as AVAILABLE_PAGES,
  QUICK_ACTIONS,
  DEFAULT_BOOKMARKS
} from '@/components/layout/navConfig';

const ICON_MAP = LucideIcons;

export default function DesktopDock({ currentPageName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['dock-items', user?.email],
    queryFn: () => base44.entities.DockItem.filter({ created_by: user?.email }, 'order'),
    enabled: !!user,
  });

  // Initialize default bookmarks for new users
  useEffect(() => {
    if (user && bookmarks.length === 0 && !isLoading) {
      DEFAULT_BOOKMARKS.forEach(item => {
        base44.entities.DockItem.create({ ...item, isEnabled: true });
      });
      queryClient.invalidateQueries({ queryKey: ['dock-items'] });
    }
  }, [user, bookmarks, isLoading]);

  const addBookmarkMutation = useMutation({
    mutationFn: (page) => base44.entities.DockItem.create({
      label: page.label,
      pageName: page.pageName,
      icon: page.icon,
      order: bookmarks.length,
      isEnabled: true,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dock-items'] }),
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: (id) => base44.entities.DockItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dock-items'] }),
  });

  if (!user) return null;

  const existingPages = bookmarks.map(b => b.pageName);
  const availableToAdd = AVAILABLE_PAGES.filter(p => !existingPages.includes(p.pageName));

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden lg:block">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`,
              border: `2px solid ${brandColors.goldPrestige}`,
            }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          className="w-72 p-0 overflow-hidden"
          side="top"
          align="end"
          sideOffset={12}
        >
          {/* Quick Actions */}
          <div className="p-3 border-b" style={{ background: `${brandColors.cream}` }}>
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Quick Actions
            </div>
            <div className="space-y-1">
              {QUICK_ACTIONS.map(action => {
                const Icon = ICON_MAP[action.icon];
                return (
                  <Link
                    key={action.pageName}
                    to={createPageUrl(action.pageName)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${action.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: action.color }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bookmarks */}
          <div className="p-3">
            <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <FolderOpen className="w-3 h-3" />
              Bookmarks
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No bookmarks yet</p>
            ) : (
              <div className="space-y-0.5 mb-2">
                {bookmarks.map(bookmark => {
                  const Icon = ICON_MAP[bookmark.icon] || Bookmark;
                  const isActive = bookmark.pageName === currentPageName;
                  return (
                    <div key={bookmark.id} className="group flex items-center">
                      <Link
                        to={createPageUrl(bookmark.pageName)}
                        onClick={() => setIsOpen(false)}
                        className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                      >
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className={`text-sm ${isActive ? 'font-medium' : ''}`} style={{ color: brandColors.navyDeep }}>
                          {bookmark.label}
                        </span>
                      </Link>
                      <button
                        onClick={() => removeBookmarkMutation.mutate(bookmark.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Bookmark */}
            {availableToAdd.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs text-slate-500">
                    <Plus className="w-3 h-3" />
                    Add bookmark
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="left" align="start">
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {availableToAdd.map(page => {
                      const Icon = ICON_MAP[page.icon] || Star;
                      return (
                        <button
                          key={page.pageName}
                          onClick={() => addBookmarkMutation.mutate(page)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}