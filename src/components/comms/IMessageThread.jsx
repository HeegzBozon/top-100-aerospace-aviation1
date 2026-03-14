import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Send } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TribeCRPHeader from './TribeCRPHeader';
import { useCommsTheme } from '@/components/contexts/CommsThemeContext';

// Date separator
function DateDivider({ date }) {
  const d = new Date(date);
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMM d, yyyy');
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <span className="mx-3 text-[11px] font-medium text-gray-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}

// Message bubble with Apple-style design
function MessageBubble({ message, showAvatar, isUser, displayName, avatar }) {
  const time = message.created_at ? format(new Date(message.created_at), 'h:mm a') : '';

  return (
    <div className={cn("flex gap-3 mb-2 group", isUser && "flex-row-reverse")}>
      {showAvatar && avatar && (
        <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm", avatar.className)}>
          {avatar.initials || avatar.icon}
        </div>
      )}
      {showAvatar && !avatar && <div className="w-8 shrink-0" />}

      <div className={cn("flex flex-col max-w-xs", isUser && "items-end")}>
        {showAvatar && (
          <span className={cn("text-xs font-medium text-gray-500 mb-1", isUser && "text-right")}>
            {displayName}
          </span>
        )}
        <div className={cn(
          "rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-[#007AFF] text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        )}>
          {message.content}
        </div>
        {!showAvatar && time && (
          <span className="text-[10px] text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

export default function IMessageThread({
  messages,
  user,
  conversation,
  isPerry = false,
  isSelfNotes = false,
  onSendMessage,
  crpExpanded,
  onToggleCRP,
  conversationData,
  isLoading = false,
}) {
  const { theme } = useCommsTheme();
  const [crpLocalExpanded, setCrpLocalExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const quillRef = useRef(null);
  const messagesEndRef = useRef(null);

  const displayCrpExpanded = onToggleCRP !== undefined ? crpExpanded : crpLocalExpanded;
  const handleToggleCRP = () => {
    if (onToggleCRP) {
      onToggleCRP?.();
    } else {
      setCrpLocalExpanded(!crpLocalExpanded);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const plainText = quillRef.current?.getEditor()?.getText()?.trim() || '';
    if (!plainText || isLoading) return;
    onSendMessage?.(inputValue);
    setInputValue('');
    quillRef.current?.getEditor().setContents([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages for avatar display
  const shouldShowAvatar = (idx) => {
    if (idx === 0) return true;
    return messages[idx - 1]?.sender_email !== messages[idx]?.sender_email;
  };

  // Get avatar config for user
  const userAvatar = {
    className: 'bg-gradient-to-br from-blue-400 to-blue-600',
    initials: user?.full_name?.split(' ')[0]?.charAt(0) || 'U',
  };

  // Get avatar config for other user
  const otherEmail = conversation?.participants?.find(p => p !== user?.email) || '';
  const otherName = otherEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden bg-white">
      {/* CRP Module - Integrated */}
      {!isPerry && !isSelfNotes && conversationData && (
        <div
          className="border-b"
          style={{ borderColor: 'rgba(0,0,0,0.05)' }}
          onClick={handleToggleCRP}
        >
          <TribeCRPHeader
            conversation={conversationData}
            isExpanded={displayCrpExpanded}
            onToggleExpand={handleToggleCRP}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isUserMsg = msg.sender_email === user?.email;
              const prevMsg = messages[idx - 1];
              const msgDate = msg.created_at ? new Date(msg.created_at) : null;
              const prevDate = prevMsg?.created_at ? new Date(prevMsg.created_at) : null;
              const showDateChip = msgDate && (idx === 0 || (prevDate && !isSameDay(prevDate, msgDate)));

              return (
                <React.Fragment key={msg.id || idx}>
                  {showDateChip && <DateDivider date={msg.created_at} />}
                  <MessageBubble
                    message={msg}
                    showAvatar={shouldShowAvatar(idx)}
                    isUser={isUserMsg}
                    displayName={isUserMsg ? 'You' : otherName}
                    avatar={isUserMsg ? userAvatar : isPerry ? { icon: '🤖' } : null}
                  />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer - iMessage Style */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-white safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all duration-200">
            <ReactQuill
              ref={quillRef}
              value={inputValue}
              onChange={setInputValue}
              onKeyDown={handleKeyDown}
              modules={{ toolbar: false }}
              formats={['bold', 'italic', 'underline', 'link']}
              placeholder="Message…"
              className="[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[36px] [&_.ql-editor]:max-h-[100px] [&_.ql-editor]:overflow-auto [&_.ql-editor]:px-4 [&_.ql-editor]:py-2 [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor]:text-gray-700 [&_.ql-editor]:bg-transparent [&_.ql-editor]:text-sm"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.replace(/<[^>]*>/g, '').trim() || isLoading}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
              inputValue.replace(/<[^>]*>/g, '').trim()
                ? "bg-[#007AFF] text-white hover:scale-110 active:scale-95"
                : "text-gray-300"
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}