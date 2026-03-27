import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ContactList({ contacts, selectedContact, onSelectContact }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('unread'); // 'unread', 'tier', 'name', 'recent'
  const [filterTier, setFilterTier] = useState('all'); // 'all', 'S-Tier', 'A-Tier', 'B-Tier', 'C-Tier'

  const getTierColor = (tier) => {
    const colors = {
      'S-Tier': 'bg-purple-100 text-purple-700',
      'A-Tier': 'bg-blue-100 text-blue-700',
      'B-Tier': 'bg-green-100 text-green-700',
      'C-Tier': 'bg-slate-100 text-slate-700',
    };
    return colors[tier] || 'bg-slate-100 text-slate-700';
  };

  const filteredAndSorted = useMemo(() => {
    let result = contacts.filter(contact => {
      const matchesSearch = contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.headline?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = filterTier === 'all' || contact.tier_classification === filterTier;
      return matchesSearch && matchesTier;
    });

    result.sort((a, b) => {
      if (sortBy === 'tier') {
        const tierOrder = { 'S-Tier': 0, 'A-Tier': 1, 'B-Tier': 2, 'C-Tier': 3 };
        return (tierOrder[a.tier_classification] || 999) - (tierOrder[b.tier_classification] || 999);
      } else if (sortBy === 'name') {
        return a.full_name.localeCompare(b.full_name);
      } else if (sortBy === 'recent') {
        return new Date(b.last_received_date || 0) - new Date(a.last_received_date || 0);
      } else {
        // 'unread' - unread first, then by status
        return (b.has_unread ? 1 : 0) - (a.has_unread ? 1 : 0);
      }
    });

    return result;
  }, [contacts, searchTerm, sortBy, filterTier]);

  const unreadCount = contacts.filter(c => c.has_unread).length;
  const completedCount = contacts.filter(c => c.response_status === 'done').length;
  const totalCount = contacts.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#1e3a5a] mb-4">Inbox ({filteredAndSorted.length})</h2>
        
        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white hover:border-slate-300 transition-colors"
          >
            <option value="unread">Unread First</option>
            <option value="tier">Tier (S→C)</option>
            <option value="recent">Most Recent</option>
            <option value="name">Name (A→Z)</option>
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white hover:border-slate-300 transition-colors"
          >
            <option value="all">All Tiers</option>
            <option value="S-Tier">S-Tier</option>
            <option value="A-Tier">A-Tier</option>
            <option value="B-Tier">B-Tier</option>
            <option value="C-Tier">C-Tier</option>
          </select>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">Inbox Zero Progress</span>
            <span className="text-xs font-bold text-[#D4A574]">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#D4A574] to-green-500 h-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{completedCount} of {totalCount} completed</p>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {unreadCount} unread
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredAndSorted.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            {contacts.length === 0 ? 'No contacts yet' : 'No contacts match your filter'}
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredAndSorted.map((contact, idx) => (
              <motion.button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all text-sm',
                  selectedContact?.id === contact.id
                    ? 'bg-[#D4A574]/10 border-[#D4A574]'
                    : 'border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-[#1e3a5a] truncate">{contact.full_name}</p>
                      {/* Tier Badge with Color Coding */}
                      {contact.tier_classification && (
                        <div className={cn('flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg', getTierColor(contact.tier_classification))}>
                          <span className="text-xs font-bold">{contact.tier_classification}</span>
                          <span className="text-xs font-semibold">{contact.tier_score || 0}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate">{contact.headline}</p>
                    {contact.last_received_message && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        "{contact.last_received_message.substring(0, 60)}..."
                      </p>
                    )}
                  </div>
                  {contact.has_unread && (
                    <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}