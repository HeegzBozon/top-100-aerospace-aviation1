import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function MessagingPanel({ currentUserEmail, recipientEmail, recipientName, serviceId, onClose }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const conversationId = [currentUserEmail, recipientEmail].sort().join('_');

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }),
    enabled: !!conversationId,
    refetchInterval: 5000,
    initialData: []
  });

  const sendMutation = useMutation({
    mutationFn: (content) => base44.entities.Message.create({
      conversation_id: conversationId,
      sender_email: currentUserEmail,
      recipient_email: recipientEmail,
      content,
      related_service_id: serviceId
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', conversationId]);
    }
  });

  // Mark messages as read
  useEffect(() => {
    const unread = messages?.filter(m => m.recipient_email === currentUserEmail && !m.is_read) || [];
    unread.forEach(m => base44.entities.Message.update(m.id, { is_read: true }));
  }, [messages, currentUserEmail]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sortedMessages = [...(messages || [])].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-2 border-b flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <CardTitle className="text-sm">{recipientName || recipientEmail}</CardTitle>
            <span className="text-xs text-slate-400">Direct Message</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Start the conversation
          </div>
        ) : (
          sortedMessages.map((msg) => {
            const isMine = msg.sender_email === currentUserEmail;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                  isMine 
                    ? 'bg-[#1e3a5a] text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                    {format(new Date(msg.created_date), 'h:mm a')}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-3 border-t">
        <form onSubmit={(e) => { e.preventDefault(); message.trim() && sendMutation.mutate(message); }} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || sendMutation.isPending} style={{ background: brandColors.navyDeep }}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}