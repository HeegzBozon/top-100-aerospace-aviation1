import { useState, useRef, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, Inbox, Sparkles, ClipboardList, MessageSquare, Building2, Star, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateThreeTensCertainty, calculateActionThreshold, calculatePainThreshold, identifyLowestTen } from '@/lib/straightLineScoring';

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
  const [showEvalModal, setShowEvalModal] = useState(false);
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

  const certainties = useMemo(() => calculateThreeTensCertainty(selectedContact), [selectedContact]);
  const actionThreshold = useMemo(() => calculateActionThreshold(selectedContact), [selectedContact]);
  const painThreshold = useMemo(() => calculatePainThreshold(selectedContact), [selectedContact]);
  const lowestTen = useMemo(() => identifyLowestTen(certainties), [certainties]);

  const tierColors = {
    'S-Tier': 'bg-purple-100 text-purple-700 border-purple-200',
    'A-Tier': 'bg-blue-100 text-blue-700 border-blue-200',
    'B-Tier': 'bg-green-100 text-green-700 border-green-200',
    'C-Tier': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Contact Header Card */}
      {selectedContact && (
        <button
          onClick={() => setShowEvalModal(true)}
          className="flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0 hover:bg-slate-50 transition-colors text-left w-full"
        >
          {selectedContact.avatar_url ? (
            <img src={selectedContact.avatar_url} alt={selectedContact.full_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1e3a5a] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {selectedContact.full_name?.[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">{selectedContact.full_name}</p>
              {selectedContact.tier_classification && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tierColors[selectedContact.tier_classification] || tierColors['C-Tier']}`}>
                  {selectedContact.tier_classification}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{selectedContact.headline}</p>
            {selectedContact.current_company && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" /> {selectedContact.current_company}
              </p>
            )}
          </div>
          {selectedContact.tier_score > 0 && (
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-sm font-bold text-slate-700">{selectedContact.tier_score}</span>
              </div>
              <p className="text-xs text-slate-400">TIER-S</p>
            </div>
          )}
        </button>
      )}

      {/* Evaluation Modal */}
      <Dialog open={showEvalModal} onOpenChange={setShowEvalModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5a]">Straight Line Evaluation</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Intro */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
                {selectedContact.avatar_url ? (
                  <img src={selectedContact.avatar_url} alt={selectedContact.full_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1e3a5a] flex items-center justify-center text-white font-bold text-xl">
                    {selectedContact.full_name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">{selectedContact.full_name}</h2>
                    {selectedContact.tier_classification && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColors[selectedContact.tier_classification] || tierColors['C-Tier']}`}>
                        {selectedContact.tier_classification}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{selectedContact.headline}</p>
                  {selectedContact.current_company && (
                    <p className="text-sm text-slate-500 mt-1">{selectedContact.current_company}</p>
                  )}
                </div>
              </div>

              {/* THREE TENS CERTAINTIES */}
              <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-lg">📊</span> The Three Tens Certainty
                </h3>
                <p className="text-xs text-slate-600 mb-3">All three must be 8+ before they commit. Lowest bottleneck: <strong>{lowestTen.lowest}</strong></p>
                <div className="grid grid-cols-3 gap-3">
                  {/* Product Certainty */}
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Product Certainty</p>
                    <p className="text-xs text-slate-600 mb-2">Do they understand how this solves their problem?</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(certainties.product / 10) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-blue-600">{certainties.product.toFixed(1)}/10</span>
                    </div>
                  </div>

                  {/* Personal Certainty */}
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Personal Certainty</p>
                    <p className="text-xs text-slate-600 mb-2">Do they trust you? See you as sharp & invested?</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(certainties.personal / 10) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-green-600">{certainties.personal.toFixed(1)}/10</span>
                    </div>
                  </div>

                  {/* Entity Certainty */}
                  <div className="p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Entity Certainty</p>
                    <p className="text-xs text-slate-600 mb-2">Do they trust your organization? See credibility?</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${(certainties.entity / 10) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-purple-600">{certainties.entity.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION & PAIN THRESHOLDS */}
              <div className="grid grid-cols-2 gap-4">
                {/* Action Threshold */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span>🎯</span> Action Threshold
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">How much certainty do they need before they move?</p>
                  <div className="inline-block px-3 py-1.5 bg-white border border-amber-300 rounded-lg">
                    <span className="text-sm font-bold text-amber-700">
                      {actionThreshold.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-600 ml-1">/10</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    {selectedContact.tier_classification === 'S-Tier' || selectedContact.tier_classification === 'A-Tier'
                      ? 'High-value contact. They move faster. Lower their threshold with smaller commitments.'
                      : 'Needs more certainty before committing. Focus on removing objections.'}
                  </p>
                </div>

                {/* Pain Threshold */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span>📍</span> Pain Threshold
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">How much discomfort are they feeling about their situation?</p>
                  <div className="inline-block px-3 py-1.5 bg-white border border-red-300 rounded-lg capitalize">
                    <span className="text-sm font-bold text-red-700">
                      {painThreshold}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    {selectedContact.response_status === 'done'
                      ? 'They moved forward. Follow up to maintain momentum.'
                      : selectedContact.response_status === 'sent'
                      ? 'Waiting for their reply. Use future pacing to increase urgency.'
                      : 'Actively seeking a solution. Now is the time to move them forward.'}
                  </p>
                </div>
              </div>

              {/* RECOMMENDED NEXT ACTION */}
              <div className="p-4 bg-slate-900 text-white rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span>⚡</span> Recommended Next Action
                </h4>
                <p className="text-sm leading-relaxed">
                  {selectedContact.response_status === 'done'
                    ? '✅ This contact has committed. Send a follow-up to confirm next steps and maintain momentum.'
                    : selectedContact.response_status === 'sent'
                    ? '⏳ Your reply is waiting for their response. If 48+ hours, send a light loop addressing one unstated objection.'
                    : selectedContact.response_status === 'draft'
                    ? '📝 You have a draft reply. Review it for the Straight Line: does it move them from their current certainty to the next level?'
                    : '🎯 They just reached out. Strike now. Draft a reply that addresses their lowest Ten (Product, Personal, or Entity certainty) and moves them toward commitment.'}
                </p>
              </div>

              {/* TIER-S DIMENSION SCORES */}
              {(selectedContact.talent_graph_score || selectedContact.institutional_revenue_score || selectedContact.ecosystem_gravity_score || selectedContact.rigor_scalability_score) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900">TIER-S Dimensions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedContact.talent_graph_score > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-slate-600 font-semibold">Talent Graph Authority</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedContact.talent_graph_score}/5</p>
                      </div>
                    )}
                    {selectedContact.institutional_revenue_score > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-slate-600 font-semibold">Institutional Revenue</p>
                        <p className="text-2xl font-bold text-green-600">{selectedContact.institutional_revenue_score}/5</p>
                      </div>
                    )}
                    {selectedContact.ecosystem_gravity_score > 0 && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-xs text-slate-600 font-semibold">Ecosystem Gravity</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedContact.ecosystem_gravity_score}/5</p>
                      </div>
                    )}
                    {selectedContact.rigor_scalability_score > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-slate-600 font-semibold">Rigor & Scalability</p>
                        <p className="text-2xl font-bold text-amber-600">{selectedContact.rigor_scalability_score}/5</p>
                      </div>
                    )}
                  </div>
                  {selectedContact.triage_reasoning && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold mb-2">Evaluation Reasoning</p>
                      <p className="text-sm text-slate-700">{selectedContact.triage_reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {selectedContact.mutual_connections_count > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Mutual Connections</span>
                    <span className="font-semibold text-slate-900">{selectedContact.mutual_connections_count}</span>
                  </div>
                )}
                {selectedContact.followers && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">LinkedIn Followers</span>
                    <span className="font-semibold text-slate-900">{selectedContact.followers.toLocaleString()}</span>
                  </div>
                )}
                {selectedContact.connections_count && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Connections</span>
                    <span className="font-semibold text-slate-900">{selectedContact.connections_count.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Header */}
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