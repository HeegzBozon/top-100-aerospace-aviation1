import React from 'react';
import { motion } from 'framer-motion';
import { Mail, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactList({ contacts, selectedContact, onSelectContact }) {
  const unreadCount = contacts.filter(c => c.has_unread).length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#1e3a5a] mb-2">Contacts ({contacts.length})</h2>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {unreadCount} unread messages
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