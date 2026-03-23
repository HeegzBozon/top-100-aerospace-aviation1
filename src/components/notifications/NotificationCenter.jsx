import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Radio, CheckCircle, AlertTriangle, Info, Trophy, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  alert: AlertTriangle,
  mission: Zap,
  achievement: Trophy,
};

const notificationColors = {
  info: brandColors.skyBlue,
  success: '#10b981',
  warning: '#f59e0b',
  alert: '#ef4444',
  mission: brandColors.goldPrestige,
  achievement: '#8b5cf6',
};

export default function NotificationCenter({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Notification.filter(
        { user_email: user.email },
        '-created_date',
        50
      );
    },
    enabled: !!user?.email && isOpen,
  });

  // Admin-only: fetch pending nominees as notifications
  const { data: pendingNominees = [] } = useQuery({
    queryKey: ['pending-nominees'],
    queryFn: async () => {
      if (user?.role !== 'admin') return [];
      return await base44.entities.Nominee.filter({ status: 'pending' }, '-created_date', 50);
    },
    enabled: user?.role === 'admin' && isOpen,
  });

  // Convert pending nominees to notification-like objects
  const pendingNomineeNotifications = useMemo(() => {
    return pendingNominees.map(n => ({
      id: `nominee-${n.id}`,
      title: `New Nomination: ${n.name}`,
      message: n.description || `Nominated by ${n.nominated_by}`,
      type: 'info',
      read: false,
      urgent: false,
      important: true,
      created_date: n.created_date,
      action_url: createPageUrl(`Admin?tab=nominees`),
      isPendingNominee: true,
      nomineeId: n.id,
    }));
  }, [pendingNominees]);

  // Combine real notifications with pending nominee notifications for admins
  const allNotifications = useMemo(() => {
    return [...pendingNomineeNotifications, ...notifications];
  }, [notifications, pendingNomineeNotifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.update(notificationId, { read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(unreadIds.map(id => 
        base44.entities.Notification.update(id, { read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      onClose();
      navigate(notification.action_url);
    }
  };

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = [...allNotifications];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Read status filter
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'priority') {
        const getPriority = (n) => {
          if (n.urgent && n.important) return 4;
          if (n.urgent) return 3;
          if (n.important) return 2;
          return 1;
        };
        return getPriority(b) - getPriority(a);
      }
      return 0;
    });

    return filtered;
  }, [notifications, searchQuery, filterType, filterRead, sortBy]);

  const unreadCount = allNotifications.filter(n => !n.read).length;

  // Triage notifications into sections
  const criticalNotifications = filteredAndSortedNotifications.filter(n => n.urgent && n.important);
  const urgentNotifications = filteredAndSortedNotifications.filter(n => n.urgent && !n.important);
  const importantNotifications = filteredAndSortedNotifications.filter(n => !n.urgent && n.important);
  const otherNotifications = filteredAndSortedNotifications.filter(n => !n.urgent && !n.important);

  const renderNotification = (notification) => {
    const Icon = notificationIcons[notification.type] || Info;
    const color = notificationColors[notification.type] || brandColors.skyBlue;
    
    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 transition-all ${
          !notification.read ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'
        } ${notification.action_url ? 'cursor-pointer' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                {notification.title}
              </h4>
              {!notification.read && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {new Date(notification.created_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(notification.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-14 md:top-16 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            style={{ borderLeft: `4px solid ${brandColors.navyDeep}` }}
          >
            {/* Fixed Header with Close Button */}
            <div className="shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 relative">
              {/* Close Button - Always visible */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 transition-colors shadow-md"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 pr-16">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${brandColors.navyDeep}20` }}
                >
                  <Radio className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">Air Traffic Control</h2>
                  <p className="text-xs text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} new transmission${unreadCount !== 1 ? 's' : ''}` : 'All clear'}
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-2 mt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRead} onValueChange={setFilterRead}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Sort: Date</SelectItem>
                      <SelectItem value="priority">Sort: Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="w-full text-xs mt-2"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark All as Read
                </Button>
              )}
            </div>

            {/* Notifications List - Triaged Sections */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <Radio className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Receiving transmissions...</p>
                </div>
              ) : filteredAndSortedNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No matching notifications</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No transmissions</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {/* CRITICAL: Urgent & Important */}
                  {criticalNotifications.length > 0 && (
                    <div className="border-b-4 border-red-500/20">
                      <div className="bg-red-50 px-4 py-2 border-b border-red-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <h3 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                            Critical ({criticalNotifications.length})
                          </h3>
                        </div>
                      </div>
                      <div className="divide-y divide-red-100">
                        {criticalNotifications.map(renderNotification)}
                      </div>
                    </div>
                  )}

                  {/* URGENT: Time-sensitive */}
                  {urgentNotifications.length > 0 && (
                    <div className="border-b-4 border-orange-500/20">
                      <div className="bg-orange-50 px-4 py-2 border-b border-orange-100">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-600" />
                          <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wide">
                            Urgent ({urgentNotifications.length})
                          </h3>
                        </div>
                      </div>
                      <div className="divide-y divide-orange-100">
                        {urgentNotifications.map(renderNotification)}
                      </div>
                    </div>
                  )}

                  {/* IMPORTANT: High-priority */}
                  {importantNotifications.length > 0 && (
                    <div className="border-b-4 border-blue-500/20">
                      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                            Important ({importantNotifications.length})
                          </h3>
                        </div>
                      </div>
                      <div className="divide-y divide-blue-100">
                        {importantNotifications.map(renderNotification)}
                      </div>
                    </div>
                  )}

                  {/* OTHER: Routine */}
                  {otherNotifications.length > 0 && (
                    <div>
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-gray-500" />
                          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Other ({otherNotifications.length})
                          </h3>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {otherNotifications.map(renderNotification)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                🛩️ Stay informed. Stay ahead.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}