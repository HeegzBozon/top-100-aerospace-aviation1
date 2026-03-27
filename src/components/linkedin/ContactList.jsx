import React from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactList({ contacts, selectedContact, onSelectContact }) {
  const unreadCount = contacts.filter(c => c.has_unread).length;
  const completedCount = contacts.filter(c => c.response_status === 'done').length;
  const totalCount = contacts.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#1e3a5a] mb-3">Inbox ({contacts.length})</h2>
        
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

      <div className="max-h-[600px] overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No contacts yet</div>
        ) : (
          <div className="space-y-2 p-4">
            {contacts.map((contact, idx) => (
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
                    <p className="font-semibold text-[#1e3a5a] truncate">{contact.full_name}</p>
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