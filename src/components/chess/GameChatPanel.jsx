import { useState, useRef, useEffect, useContext } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { ThemeContext } from '@/components/core/ThemeContext';

export default function GameChatPanel({ game, currentUser }) {
  const { mode } = useContext(ThemeContext) || { mode: 'dark' };
  const isDark = mode === 'dark';
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const messages = game?.chat_messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim() || !game?.id) return;
    setSending(true);
    const newMsg = {
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    await base44.entities.ChessGame.update(game.id, {
      chat_messages: [...messages, newMsg]
    });
    setMessage('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 overflow-y-auto space-y-3 p-4 min-h-0 scrollbar-hide ${isDark ? 'bg-transparent' : 'bg-white'}`}>
        {messages.length === 0 && (
          <p className={`text-xs italic text-center pt-6 tracking-wide ${isDark ? 'text-white/25' : 'text-gray-400'}`}>No messages yet</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_email === currentUser?.email;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className={`text-[10px] mb-1 px-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>{msg.sender_name}</span>
              <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[85%] break-words leading-relaxed ${
                isMe
                  ? isDark ? 'bg-amber-500/20 text-amber-100 rounded-br-sm' : 'bg-yellow-400 text-yellow-900 rounded-br-sm'
                  : isDark ? 'bg-white/8 text-white/85 rounded-bl-sm' : 'bg-gray-200 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className={`flex gap-2 p-3 border-t ${isDark ? 'border-white/8' : 'border-gray-200'}`}>
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Say something…"
          className={`flex-1 text-sm h-9 ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-amber-500/40'
              : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-yellow-500/40'
          }`}
          maxLength={200}
          aria-label="Chat message"
        />
        <Button
          size="icon"
          className={`h-9 w-9 shrink-0 transition-colors ${
            isDark ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
          }`}
          onClick={handleSend}
          disabled={sending || !message.trim()}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}