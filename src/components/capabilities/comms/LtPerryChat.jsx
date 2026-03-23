import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, UserCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import PerryProfileConfirmCard from './PerryProfileConfirmCard';
import { ltPerryGuest } from '@/functions/ltPerryGuest';
import { perryProfileManager } from '@/functions/perryProfileManager';

const AGENT_NAME = 'ltPerry';
const PROFILE_AGENT_NAME = 'ltPerryProfile';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi, I'm Lt. Perry — your guide to the TOP 100 Aerospace & Aviation Women platform. Ask me anything about nominations, voting, membership, or how to get involved.",
};

// Keywords that trigger escalation to full agent (investment/legal complexity)
const COMPLEX_KEYWORDS = /invest|safe|equity|wefunder|valuation|cap|legal|sec|reg cf|objection|convert|series|accredited|refund|cancel|guarantee|risk|board|observer|form c/i;

// Keywords that trigger the profile management agent
const PROFILE_KEYWORDS = /update.*profile|edit.*profile|change.*bio|update.*bio|my profile|career history|add.*job|remove.*job|edit.*job|update.*title|update.*company|update.*linkedin|update.*instagram|update.*skills|update.*role|what.*my profile|show.*my profile|my bio|update my/i;

export default function LtPerryChat() {
  const [isAuth, setIsAuth] = useState(null);
  const [conversation, setConversation] = useState(null);         // ltPerry agent conv
  const [profileConversation, setProfileConversation] = useState(null); // ltPerryProfile conv
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);        // awaiting confirm card
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const bottomRef = useRef(null);
  const loadingTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current); };
  }, []);

  useEffect(() => {
    let unsubMain, unsubProfile;

    const init = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
        try {
          // Create both agent conversations in parallel
          const [mainConv, profileConv] = await Promise.all([
            base44.agents.createConversation({ agent_name: AGENT_NAME, metadata: { name: 'Public Chat' } }),
            base44.agents.createConversation({ agent_name: PROFILE_AGENT_NAME, metadata: { name: 'Profile Manager' } }),
          ]);
          setConversation(mainConv);
          setProfileConversation(profileConv);

          // Subscribe to main agent
          unsubMain = base44.agents.subscribeToConversation(mainConv.id, (data) => {
            const filtered = data.messages.filter((m) => m.role !== 'system');
            if (filtered.length > 0) {
              setMessages([INITIAL_MESSAGE, ...filtered]);
              setIsLoading(false);
              if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            }
          });

          // Subscribe to profile agent — also parse __profile_action__ payloads
          unsubProfile = base44.agents.subscribeToConversation(profileConv.id, (data) => {
            const filtered = data.messages.filter((m) => m.role !== 'system');
            if (filtered.length > 0) {
              const lastAssistant = [...filtered].reverse().find((m) => m.role === 'assistant');
              if (lastAssistant) {
                // Check for structured profile action payload in the message
                const actionMatch = lastAssistant.content?.match(/\[\[PROFILE_ACTION:(.*?)\]\]/s);
                if (actionMatch) {
                  try {
                    const action = JSON.parse(actionMatch[1]);
                    setPendingAction(action);
                    // Strip the payload from the visible message
                    const cleanContent = lastAssistant.content.replace(/\[\[PROFILE_ACTION:.*?\]\]/s, '').trim();
                    setMessages([INITIAL_MESSAGE, ...filtered.map((m) =>
                      m === lastAssistant ? { ...m, content: cleanContent } : m
                    )]);
                  } catch {
                    setMessages([INITIAL_MESSAGE, ...filtered]);
                  }
                } else {
                  setMessages([INITIAL_MESSAGE, ...filtered]);
                }
              }
              setIsLoading(false);
              if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            }
          });
        } catch {
          setIsAuth(false);
        }
      }
    };

    init();
    return () => { unsubMain?.(); unsubProfile?.(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction]);

  const isProfileIntent = useCallback((msg) => PROFILE_KEYWORDS.test(msg), []);

  const needsAgentHorsepower = useCallback((userMessage, messageHistory) => {
    const userTurns = messageHistory.filter((m) => m.role === 'user').length;
    if (userTurns > 3) return true;
    return COMPLEX_KEYWORDS.test(userMessage);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || isAuth === null) return;

    setInputValue('');
    setIsLoading(true);
    setPendingAction(null);

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    // Non-authed user trying profile management
    if (!isAuth && isProfileIntent(trimmed)) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Profile management requires a signed-in account. Log in or create a free membership to update your profile.",
      }]);
      setIsLoading(false);
      return;
    }

    // Profile intent → route to ltPerryProfile agent
    if (isAuth && profileConversation && isProfileIntent(trimmed)) {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(async () => {
        // Fallback: fetch via perryProfileManager get_profile and reply manually
        const res = await perryProfileManager({ action: 'get_profile' });
        const hasNominee = !!res?.data?.nominee;
        const fallback = hasNominee
          ? "I found your profile. What would you like to update?"
          : "I can see your account but you don't have a claimed Nominee profile yet. I can update your community profile fields — what would you like to change?";
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        setIsLoading(false);
      }, 12000);
      await base44.agents.addMessage(profileConversation, { role: 'user', content: trimmed });
      return;
    }

    // Standard chat routing (fast LLM or full main agent)
    const useAgent = isAuth && conversation && needsAgentHorsepower(trimmed, messages);

    if (useAgent) {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(async () => {
        const historyForLLM = nextMessages.filter((m) => m.role !== 'system');
        const res = await ltPerryGuest({ messages: historyForLLM });
        const reply = res?.data?.reply || "Sorry, I couldn't reach Lt. Perry. Try again.";
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        setIsLoading(false);
      }, 12000);
      await base44.agents.addMessage(conversation, { role: 'user', content: trimmed });
    } else {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      const historyForLLM = nextMessages.filter((m) => m.role !== 'system');
      const res = await ltPerryGuest({ messages: historyForLLM });
      const reply = res?.data?.reply || "Sorry, I couldn't process that. Try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsLoading(false);
    }
  }, [inputValue, isLoading, isAuth, conversation, profileConversation, messages, needsAgentHorsepower, isProfileIntent]);

  // User confirmed the pending profile action
  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    setIsSubmittingAction(true);
    try {
      const res = await perryProfileManager(pendingAction.payload);
      const success = res?.data?.success;
      const diff = res?.data?.diff;
      const diffSummary = diff
        ? Object.entries(diff).map(([k, v]) => `**${k}** updated`).join(', ')
        : 'Profile updated';
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: success
          ? `Done! ${diffSummary}. Your profile is now live. Anything else to update?`
          : `Something went wrong: ${res?.data?.error || 'Unknown error'}. Please try again.`,
      }]);
    } finally {
      setPendingAction(null);
      setIsSubmittingAction(false);
    }
  }, [pendingAction]);

  const handleCancelAction = useCallback(() => {
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: 'assistant', content: "No worries — nothing was changed. What else can I help you with?" }]);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const isReady = isAuth !== null && (isAuth ? conversation !== null : true);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 py-5 min-h-0">
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Inline confirmation card */}
          {pendingAction && (
            <PerryProfileConfirmCard
              pendingAction={pendingAction}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
              isSubmitting={isSubmittingAction}
            />
          )}

          {isLoading && (
            <div className="flex items-end gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-[#0a1628] to-[#1a2f5a]"
                aria-hidden="true"
              >
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Profile mode indicator for authed users */}
      {isAuth && (
        <div className="shrink-0 flex items-center gap-1.5 px-4 pt-2">
          <UserCircle className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] text-slate-400">Profile management available — just ask</span>
        </div>
      )}

      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-2 items-center">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Lt. Perry anything…"
          aria-label="Message Lt. Perry"
          disabled={isLoading || !isReady || isSubmittingAction}
          className="flex-1 rounded-full border-slate-200 bg-slate-50 focus:bg-white text-sm px-4"
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading || !isReady || isSubmittingAction}
          aria-label="Send message"
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a2f5a] shadow-md transition-transform hover:scale-105 active:scale-95 border-0"
          size="icon"
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}