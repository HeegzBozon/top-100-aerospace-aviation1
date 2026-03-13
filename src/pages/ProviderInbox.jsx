import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, User as UserIcon, Loader2, ArrowLeft, StickyNote } from 'lucide-react';
import ClientNotesPanel from '@/components/epics/01-index-engine/talent/ClientNotesPanel';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import MessagingPanel from '@/components/epics/01-index-engine/talent/MessagingPanel';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ProviderInbox() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => User.me()
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['all-messages', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: user.email });
      const received = await base44.entities.Message.filter({ recipient_email: user.email });
      return [...sent, ...received];
    },
    enabled: !!user?.email,
    initialData: []
  });

  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const grouped = {};
    messages.forEach(msg => {
      const otherId = msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email;
      if (!grouped[otherId]) {
        grouped[otherId] = {
          otherEmail: otherId,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      grouped[otherId].messages.push(msg);
      if (!msg.is_read && msg.recipient_email === user?.email) {
        grouped[otherId].unreadCount++;
      }
    });

    // Sort by most recent and get last message
    Object.values(grouped).forEach(conv => {
      conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      conv.lastMessage = conv.messages[0];
    });

    return Object.values(grouped).sort((a, b) => 
      new Date(b.lastMessage?.created_date) - new Date(a.lastMessage?.created_date)
    );
  }, [messages, user?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to={createPageUrl('MissionControl') + '?module=provider'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
          Messages
        </h1>
        {conversations.some(c => c.unreadCount > 0) && (
          <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} unread
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-2">
          {conversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conv) => (
              <Card 
                key={conv.otherEmail}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConversation === conv.otherEmail ? 'ring-2 ring-[#1e3a5a]' : ''
                }`}
                onClick={() => setSelectedConversation(conv.otherEmail)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 truncate">
                          {conv.otherEmail.split('@')[0]}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {conv.lastMessage?.content}
                      </p>
                      <span className="text-xs text-slate-400">
                        {conv.lastMessage && format(new Date(conv.lastMessage.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedConversation ? (
            <>
              <MessagingPanel
                currentUserEmail={user?.email}
                recipientEmail={selectedConversation}
                recipientName={selectedConversation.split('@')[0]}
              />
              <ClientNotesPanel
                providerEmail={user?.email}
                clientEmail={selectedConversation}
              />
            </>
          ) : (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center text-slate-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}