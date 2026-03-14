import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Info } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PerryProfileConfirmCard from '@/components/chat/PerryProfileConfirmCard';
import { ltPerryGuest } from '@/functions/ltPerryGuest';
import { perryProfileManager } from '@/functions/perryProfileManager';

const AGENT_NAME = 'ltPerryProfile';

const PROFILE_KEYWORDS = /update.*profile|edit.*profile|change.*bio|update.*bio|my profile|career history|add.*job|remove.*job|edit.*job|update.*title|update.*company|update.*linkedin|update.*instagram|update.*skills|update.*role|what.*my profile|show.*my profile|my bio|update my/i;

// ── Date chip ───────────────────────────────────────────────────────────────
function DateChip({ date }) {
  const d = new Date(date);
  let label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'EEEE, MMMM do');
  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <span className="mx-4 px-4 py-1 rounded-full text-[11px] font-semibold text-slate-500 bg-white border border-slate-100 shadow-sm">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}

// ── Single message bubble ───────────────────────────────────────────────────
function PerryMessageBubble({ message, showAvatar }) {
  const isUser = message.role === 'user';
  const time = message.created_at ? format(new Date(message.created_at), 'h:mm a') : '';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {showAvatar ? (
        isUser ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            ME
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden shadow-sm ring-1 ring-amber-400/30 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png"
              alt="Lt. Perry"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={`flex flex-col max-w-[78%] ${isUser ? 'items-end' : ''}`}>
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            <span className="text-[12px] font-semibold text-slate-700">
              {isUser ? 'You' : 'Lt. Perry'}
            </span>
            {time && <span className="text-[10px] text-gray-400">{time}</span>}
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-[#c9a87c] to-[#b8956b] text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p]:leading-relaxed"
              components={{
                a: ({ children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Perry DM Thread ────────────────────────────────────────────────────
export default function PerryDMThread({ user, crpCurrentStep, crpCompletedSteps }) {
   const [conversation, setConversation] = useState(null);
   const [messages, setMessages] = useState([]);
   const [inputValue, setInputValue] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [isInitializing, setIsInitializing] = useState(true);
   const [pendingAction, setPendingAction] = useState(null);
   const [isSubmittingAction, setIsSubmittingAction] = useState(false);
   const [showInfo, setShowInfo] = useState(false);
   const bottomRef = useRef(null);
   const loadingTimerRef = useRef(null);
   const quillRef = useRef(null);

  // Load or resume persistent agent conversation
  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      try {
        // List existing conversations to find a persisted one
        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        let conv;

        if (existing?.length > 0) {
          // Resume most recent
          conv = await base44.agents.getConversation(existing[0].id);
        } else {
          // Create fresh
          conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: 'Perry DM', persisted: true },
          });
        }

        setConversation(conv);

        // Load existing history
        const filtered = (conv.messages || []).filter((m) => m.role !== 'system');
        if (filtered.length === 0) {
          setMessages([{
            role: 'assistant',
            content: `Hi ${user?.full_name?.split(' ')[0] || 'there'} — I'm Lt. Perry. I can help you update your profile, answer questions about the platform, or assist with nominations and voting. What would you like to do?`,
            created_at: new Date().toISOString(),
          }]);
        } else {
          setMessages(filtered);
        }

        // Subscribe for real-time updates
        unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
          const updated = data.messages.filter((m) => m.role !== 'system');
          if (updated.length > 0) {
            // Parse __profile_action__ payloads
            const lastAssistant = [...updated].reverse().find((m) => m.role === 'assistant');
            if (lastAssistant) {
              const actionMatch = lastAssistant.content?.match(/\[\[PROFILE_ACTION:(.*?)\]\]/s);
              if (actionMatch) {
                try {
                  const action = JSON.parse(actionMatch[1]);
                  setPendingAction(action);
                  const clean = lastAssistant.content.replace(/\[\[PROFILE_ACTION:.*?\]\]/s, '').trim();
                  setMessages(updated.map((m) => m === lastAssistant ? { ...m, content: clean } : m));
                } catch {
                  setMessages(updated);
                }
              } else {
                setMessages(updated);
              }
            }
            setIsLoading(false);
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
          }
        });
      } catch {
        // Fallback: stateless guest mode
        setMessages([{
          role: 'assistant',
          content: "Hi — I'm Lt. Perry. Ask me anything about the platform.",
          created_at: new Date().toISOString(),
        }]);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
    return () => {
      unsubscribe?.();
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [user?.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction, isLoading]);

  const handleSend = useCallback(async () => {
    const html = inputValue.trim();
    const plainText = quillRef.current?.getEditor()?.getText()?.trim() || '';
    if (!plainText || isLoading || isInitializing) return;

    setInputValue('');
    setIsLoading(true);
    setPendingAction(null);

    const userMsg = { role: 'user', content: plainText, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    if (conversation) {
      // Timeout fallback
      loadingTimerRef.current = setTimeout(async () => {
        const recentHistory = messages.slice(-6).concat(userMsg);
        const res = await ltPerryGuest({ messages: recentHistory });
        const reply = res?.data?.reply || "Sorry, I couldn't reach Lt. Perry. Try again.";
        setMessages((prev) => [...prev, { role: 'assistant', content: reply, created_at: new Date().toISOString() }]);
        setIsLoading(false);
      }, 14000);

      await base44.agents.addMessage(conversation, { role: 'user', content: plainText });
    } else {
      // Pure fallback
      const recentHistory = messages.slice(-6).concat(userMsg);
      const res = await ltPerryGuest({ messages: recentHistory });
      const reply = res?.data?.reply || "Sorry, I couldn't process that. Try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, created_at: new Date().toISOString() }]);
      setIsLoading(false);
    }
  }, [inputValue, isLoading, isInitializing, conversation, messages]);

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    setIsSubmittingAction(true);
    try {
      const res = await perryProfileManager(pendingAction.payload);
      const success = res?.data?.success;
      const diff = res?.data?.diff;
      const summary = diff
        ? Object.keys(diff).map((k) => `**${k}** updated`).join(', ')
        : 'Profile updated';
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: success ? `Done! ${summary}. Your profile is now live. Anything else?` : `Something went wrong: ${res?.data?.error || 'Please try again.'}`,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setPendingAction(null);
      setIsSubmittingAction(false);
    }
  }, [pendingAction]);

  const handleCancelAction = useCallback(() => {
    setPendingAction(null);
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: "No problem — nothing was changed. What else can I help with?",
      created_at: new Date().toISOString(),
    }]);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // Group messages for avatar display logic
  const shouldShowAvatar = (msg, idx, list) => {
    if (idx === 0) return true;
    return list[idx - 1]?.role !== msg.role;
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden overflow-hidden" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #fff 100%)' }}>
       {/* Info Panel - positioned above messages */}
       {showInfo && (
         <div className="shrink-0 mx-5 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
           <div className="flex items-start justify-between gap-2">
             <p className="font-semibold">How to use:</p>
             <button
               onClick={() => setShowInfo(false)}
               className="p-1 rounded-lg hover:bg-amber-100 transition-colors shrink-0 text-amber-900 hover:text-amber-950"
             >
               ×
             </button>
           </div>
           <ul className="list-disc pl-4 space-y-1 text-amber-800">
             <li>Ask about updating your profile (bio, career history, socials)</li>
             <li>Request info about the platform, voting, or nominations</li>
             <li>Get help with nominations and voting strategies</li>
           </ul>
           <p className="font-semibold mt-2">Limitations:</p>
           <ul className="list-disc pl-4 space-y-1 text-amber-800">
             <li>Context window: Last 6 messages in conversation</li>
             <li>Profile changes require your confirmation before applying</li>
             <li>Not all platform features can be modified via chat</li>
           </ul>
         </div>
       )}

       {/* Messages - with bottom padding to prevent keyboard overlap */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-3 min-h-0" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 280px))' }}>
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const msgDate = msg.created_at ? new Date(msg.created_at) : null;
              const prevMsg = messages[idx - 1];
              const prevDate = prevMsg?.created_at ? new Date(prevMsg.created_at) : null;
              const showDateChip = msgDate && (idx === 0 || (prevDate && !isSameDay(prevDate, msgDate)));

              return (
                <React.Fragment key={idx}>
                  {showDateChip && <DateChip date={msg.created_at} />}
                  <PerryMessageBubble
                    message={msg}
                    showAvatar={shouldShowAvatar(msg, idx, messages)}
                  />
                </React.Fragment>
              );
            })}

            {pendingAction && (
              <PerryProfileConfirmCard
                pendingAction={pendingAction}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
                isSubmitting={isSubmittingAction}
              />
            )}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden ring-1 ring-amber-400/30 bg-gradient-to-br from-[#0a1628] to-[#1a2f5a] shadow-sm">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/6cfeb5817_generated_image.png" alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input - Fixed on mobile only */}
      <div className="md:relative md:px-3 md:py-2 md:border-t md:border-gray-100 md:bg-white fixed bottom-0 left-0 right-0 px-3 py-2 border-t border-gray-100 bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <fieldset className="rounded-lg overflow-hidden border border-gray-200 bg-white w-full" disabled={isLoading || isInitializing || isSubmittingAction}>
          <ReactQuill
            ref={quillRef}
            value={inputValue}
            onChange={setInputValue}
            onFocus={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            modules={{ toolbar: false }}
            formats={['bold', 'italic', 'underline', 'link']}
            placeholder="Message Lt. Perry…"
            className="[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[50px] [&_.ql-editor]:max-h-[150px] [&_.ql-editor]:overflow-auto [&_.ql-editor]:px-3 [&_.ql-editor]:py-2 [&_.ql-editor.ql-blank::before]:text-gray-400 [&_.ql-editor.ql-blank::before]:not-italic [&_.ql-editor]:text-gray-700 [&_.ql-editor]:bg-transparent"
            style={{ fontSize: '15px' }}
          />
          <div className="flex items-center justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
            <Button
              onClick={handleSend}
              disabled={!inputValue.replace(/<[^>]*>/g, '').trim() || isLoading || isInitializing || isSubmittingAction}
              aria-label="Send message"
              size="sm"
              className="h-8 px-4 rounded-lg border-0"
              style={{
                background: inputValue.replace(/<[^>]*>/g, '').trim()
                  ? 'rgb(30, 58, 90)'
                  : 'rgba(30, 58, 90, 0.3)',
                color: '#fff',
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}