import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Rocket, Radio, MessageSquare, MessageSquareOff, Users, Maximize2, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

// ── Avatar colour from name ───────────────────────────────────────────────────
const AVATAR_COLOURS = [
  'bg-violet-500', 'bg-sky-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500',
];
function avatarColour(name = '') {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AVATAR_COLOURS[n % AVATAR_COLOURS.length];
}

// ── Single chat message ───────────────────────────────────────────────────────
function ChatMessage({ msg, isMe }) {
  const initial = (msg.author_name?.[0] || '?').toUpperCase();
  const colour = avatarColour(msg.author_name || '');
  return (
    <div className="flex items-start gap-2.5 group">
      <div className={`w-7 h-7 rounded-full ${colour} flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5`}>
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[11px] font-semibold leading-none ${isMe ? 'text-amber-400' : 'text-white/50'}`}>
            {isMe ? 'You' : msg.author_name}
          </span>
          {msg.sent_at && (
            <span className="text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              {format(new Date(msg.sent_at), 'h:mm a')}
            </span>
          )}
        </div>
        <p className="text-sm text-white/85 leading-snug break-words mt-0.5">{msg.text}</p>
      </div>
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({ messages, user, input, setInput, onSend, onKeyDown, sending, inputRef, bottomRef }) {
  return (
    <div className="flex flex-col bg-[#111] border-t sm:border-t-0 sm:border-l border-white/[0.08] w-full sm:w-[340px] shrink-0 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] shrink-0">
        <Users className="w-3.5 h-3.5 text-white/40" />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Top chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-3.5 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-white/20 text-xs text-center pt-6">Be the first to say something 🚀</p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isMe={msg.author_email === user?.email} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 py-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-0 focus-within:border-white/30 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={user ? 'Say something…' : 'Log in to chat'}
            disabled={!user || sending}
            aria-label="Chat message"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none py-3 disabled:opacity-40"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || !user || sending}
            aria-label="Send"
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-amber-500/80 text-white/60 hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function LaunchPartyModal({ launch, youtubeId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auth
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  // Initial messages
  useEffect(() => {
    if (!launch?.id) return;
    base44.entities.LaunchPartyMessage
      .filter({ launch_id: launch.id }, 'created_date', 60)
      .then(setMessages).catch(() => {});
  }, [launch?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!launch?.id) return;
    const unsub = base44.entities.LaunchPartyMessage.subscribe((event) => {
      if (event.data?.launch_id !== launch.id) return;
      if (event.type === 'create') setMessages(prev => [...prev, event.data]);
    });
    return unsub;
  }, [launch?.id]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setInput('');
    try {
      await base44.entities.LaunchPartyMessage.create({
        launch_id: launch.id,
        author_name: user.full_name || user.email?.split('@')[0] || 'Guest',
        author_email: user.email,
        text,
        sent_at: new Date().toISOString(),
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, user, sending, launch?.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Launch Party"
      className={`${isFullscreen ? 'fixed inset-0' : 'fixed inset-4 rounded-2xl'} z-[9999] flex flex-col bg-[#0a0a0a] overflow-hidden`}
    >
      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-white/[0.08]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm tracking-wide shrink-0 animate-pulse">
            <Radio className="w-2.5 h-2.5" /> LIVE
          </span>
          <span className="text-white/75 text-sm font-medium truncate">{launch?.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => setChatHidden(h => !h)}
            aria-label={chatHidden ? 'Show chat' : 'Hide chat'}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            {chatHidden ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Body: video left (flex), chat right (sidebar) ── */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0 gap-0">

        {/* Video — left column, maintains 16:9 */}
        <div className="w-full sm:flex-1 bg-black relative min-h-0">
          <div className="aspect-video">
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title={`${launch?.name} webcast`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                <Rocket className="w-14 h-14" />
                <p className="text-sm font-medium">Stream not available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat — right sidebar, full width below on mobile, fixed width on desktop */}
        {!chatHidden && (
          <ChatPanel
            messages={messages}
            user={user}
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            onKeyDown={handleKeyDown}
            sending={sending}
            inputRef={inputRef}
            bottomRef={bottomRef}
          />
        )}
      </div>
    </div>
  );
}