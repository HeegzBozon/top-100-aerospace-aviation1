import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, Inbox, Sparkles, ClipboardList, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const QUICK_ACTIONS = [
  { label: 'Priority Queue', prompt: 'Give me my priority queue — who should I respond to first and why?', icon: ClipboardList },
  { label: 'Inbox Audit', prompt: 'Do a full audit of my inbox. How many are waiting? What patterns do you see? What should I focus on?', icon: Inbox },
  { label: 'Draft a Reply', prompt: "I need to draft a reply. Let's start with my highest-priority unanswered contact.", icon: MessageSquare },
  { label: 'Top Opportunities', prompt: 'Who in my inbox represents the biggest strategic opportunities? Focus on S-Tier and A-Tier contacts.', icon: Sparkles },
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#1e3a5a] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-[#D4A574]" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-[#1e3a5a] text-white'
          : 'bg-white border border-slate-200 text-slate-800'
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-1 prose-ul:my-1 prose-li:my-0"
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function InboxManagerChat({ selectedContact }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When a contact is selected, inject context into the chat input
  useEffect(() => {
    if (selectedContact) {
      setInput(`Tell me about ${selectedContact.full_name} and what I should say to them next.`);
      inputRef.current?.focus();
    }
  }, [selectedContact]);

  const initConversation = async () => {
    setLoading(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) return;

      const conv = await base44.agents.createConversation({
        agent_name: 'inbox_manager',
        metadata: { name: 'LinkedIn Inbox Session' },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to init conversation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsubscribe;
  }, [conversation?.id]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || !conversation || sending) return;

    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content });
    } catch (err) {
      console.error('Send error', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const visibleMessages = messages.filter(m => m.role === 'user' || (m.role === 'assistant' && m.content));

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1e3a5a] text-white flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#D4A574]/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-[#D4A574]" />
        </div>
        <div>
          <p className="text-sm font-bold">Inbox Manager</p>
          <p className="text-xs text-slate-300">AI-powered outreach assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-300">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a5a]/10 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-[#1e3a5a]" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Inbox Manager ready</p>
            <p className="text-xs text-slate-500 mb-5 max-w-xs">
              Ask for a priority queue, draft a reply, or audit your inbox. Select a contact on the left to get a targeted brief.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => send(action.prompt)}
                  className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-[#1e3a5a] hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700"
                >
                  <action.icon className="w-3.5 h-3.5 text-[#D4A574] flex-shrink-0" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          visibleMessages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-[#1e3a5a] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[#D4A574]" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
        {selectedContact && (
          <div className="mb-2 px-2 py-1 bg-[#1e3a5a]/5 rounded-lg text-xs text-slate-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A574]" />
            Context: <strong>{selectedContact.full_name}</strong> selected
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a contact, request a draft, or get your priority queue…"
            className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/30"
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || sending || !conversation}
            className="bg-[#1e3a5a] hover:bg-[#0f2438] text-white self-end rounded-xl h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}