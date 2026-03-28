import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageCircle, ExternalLink, CheckCircle2, PenSquare, Bot, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TriageEvaluation from './TriageEvaluation';

const PIPELINE_STAGES = [
  { key: 'new',      label: 'New',      color: 'bg-slate-400',   activeColor: 'bg-slate-500',   ring: 'ring-slate-300',   dot: '⬜' },
  { key: 'engaged',  label: 'Engaged',  color: 'bg-blue-400',    activeColor: 'bg-blue-500',    ring: 'ring-blue-300',    dot: '🔵' },
  { key: 'replied',  label: 'Replied',  color: 'bg-amber-400',   activeColor: 'bg-amber-500',   ring: 'ring-amber-300',   dot: '🟡' },
  { key: 'sent',     label: 'Sent',     color: 'bg-indigo-400',  activeColor: 'bg-indigo-500',  ring: 'ring-indigo-300',  dot: '🟣' },
  { key: 'done',     label: 'Done ✓',  color: 'bg-green-500',   activeColor: 'bg-green-600',   ring: 'ring-green-300',   dot: '✅' },
];

function getPipelineStageIndex(tier, status) {
  if (status === 'done') return 4;
  if (status === 'sent') return 3;
  if (status === 'draft') return 2;
  if (tier) return 1;
  return 0;
}

function PipelineStage({ tier, status, onStageClick }) {
  const activeIdx = getPipelineStageIndex(tier, status);
  const activeStage = PIPELINE_STAGES[activeIdx];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pipeline</span>
      <div className="flex items-center gap-1">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = idx === activeIdx;
          const isPast = idx < activeIdx;
          const isFuture = idx > activeIdx;
          return (
            <button
              key={stage.key}
              onClick={() => onStageClick(idx)}
              title={stage.label}
              className={`group relative transition-all duration-200 rounded-full focus:outline-none
                ${isActive ? `w-8 h-3 ${stage.activeColor} ring-2 ${stage.ring} ring-offset-1 scale-110` :
                  isPast ? `w-6 h-2.5 ${stage.color} opacity-70 hover:opacity-100 hover:scale-105` :
                  `w-5 h-2 bg-slate-200 hover:bg-slate-300 hover:scale-105`}
              `}
            >
              {/* Tooltip */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
      <motion.span
        key={activeStage.key}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-bold text-slate-700"
      >
        {activeStage.label}
      </motion.span>
    </div>
  );
}

export default function ContactDetail({ contact, onUpdate }) {
  const [response, setResponse] = useState(contact.generated_response || '');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [linkedEntity, setLinkedEntity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentContact, setCurrentContact] = useState(contact);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [agentSkills, setAgentSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');

  useEffect(() => {
    setCurrentContact(contact);
    detectLinkedEntity();
  }, [contact]);

  useEffect(() => {
    base44.entities.AgentSkill.filter({ is_active: true }, '-updated_date', 20)
      .then(skills => setAgentSkills(skills))
      .catch(() => {});
  }, []);

  const detectLinkedEntity = async () => {
    setLoading(true);
    try {
      // Try to find in Nominee by email or LinkedIn URL
      const nominees = await base44.entities.Nominee.filter({
        $or: [
          { linkedin_profile_url: contact.linkedin_profile_url },
          { email_domain: contact.linkedin_profile_url?.includes('@') ? contact.linkedin_profile_url.split('@')[1] : '' }
        ]
      }, undefined, 5);

      if (nominees.length > 0) {
        setLinkedEntity({ type: 'nominee', data: nominees[0] });
        return;
      }

      // Try to find in User entity by email patterns
      const users = await base44.entities.User.list(undefined, 100);
      const matched = users.find(u => 
        u.email?.includes(contact.full_name?.toLowerCase().replace(/\s+/g, '.')) ||
        contact.linkedin_profile_url?.includes(u.email?.split('@')[0])
      );
      if (matched) {
        setLinkedEntity({ type: 'user', data: matched });
        return;
      }
    } catch (err) {
      console.error('Error detecting entity:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async () => {
    setGeneratingResponse(true);
    try {
      const selectedSkill = agentSkills.find(s => s.id === selectedSkillId);
      const agentContext = selectedSkill
        ? `You are acting as: ${selectedSkill.display_name || selectedSkill.name} (${selectedSkill.persona_role}).
Agent instructions: ${selectedSkill.instructions || selectedSkill.description || ''}

`
        : `You are a professional networking assistant for TOP 100 Women in Aerospace.

`;

      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `${agentContext}Generate a thoughtful, personalized LinkedIn reply to ${contact.full_name} (${contact.headline}${contact.current_company ? `, ${contact.current_company}` : ''}).

Their message: "${contact.last_received_message}"

${contact.tier_classification ? `Contact tier: ${contact.tier_classification} (score: ${contact.tier_score}/20). Calibrate your tone accordingly.` : ''}

Keep it warm, professional, and 2-3 sentences. Focus on continuing the conversation naturally. Do not use generic filler phrases.`
      });

      setResponse(llmResult);
      await base44.entities.LinkedInContact.update(contact.id, {
        generated_response: llmResult,
        response_status: 'draft'
      });
    } catch (err) {
      console.error('Error generating response:', err);
    } finally {
      setGeneratingResponse(false);
    }
  };

  const saveResponse = async () => {
    try {
      const updated = await base44.entities.LinkedInContact.update(currentContact.id, {
        generated_response: response,
        response_status: 'draft'
      });
      setCurrentContact(updated);
      onUpdate(updated);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const markAsSent = async () => {
    try {
      const updated = await base44.entities.LinkedInContact.update(currentContact.id, {
        response_status: 'sent',
        last_sent_message: response,
        last_sent_date: new Date().toISOString(),
        has_unread: false
      });
      setCurrentContact(updated);
      onUpdate(updated);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const markAsDone = async () => {
    try {
      const updated = await base44.entities.LinkedInContact.update(currentContact.id, {
        response_status: 'done',
        has_unread: false
      });
      setCurrentContact(updated);
      onUpdate(updated);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handlePipelineStageClick = async (idx) => {
    const statusMap = ['pending', 'pending', 'draft', 'sent', 'done'];
    const newStatus = statusMap[idx];
    try {
      const updated = await base44.entities.LinkedInContact.update(currentContact.id, {
        response_status: newStatus,
        ...(newStatus === 'done' ? { has_unread: false } : {}),
        ...(newStatus === 'sent' ? { has_unread: false } : {}),
      });
      setCurrentContact(updated);
      onUpdate(updated);
    } catch (err) {
      console.error('Pipeline update error:', err);
    }
  };

  const handleEvaluated = (evaluatedContact) => {
    setCurrentContact(evaluatedContact);
    onUpdate(evaluatedContact);
  };

  const handleQuickEvaluate = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('evaluateLinkedInMessage', {
        contactId: currentContact.id,
        headline: currentContact.headline || '',
        theirMessage: currentContact.last_received_message || 'No message provided',
        yourMessage: currentContact.generated_response || currentContact.last_sent_message || 'No response yet',
        company: currentContact.current_company || '',
        position: currentContact.current_position || '',
      });

      const updatedContact = result.data?.contact || result.contact;
      if (updatedContact) {
        handleEvaluated(updatedContact);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Contact Header with Integrated Evaluation */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          {currentContact.avatar_url && (
            <img
              src={currentContact.avatar_url}
              alt={currentContact.full_name}
              className="w-16 h-16 rounded-full bg-slate-200"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a5a]">{currentContact.full_name}</h2>
                <p className="text-sm text-slate-600">{currentContact.headline}</p>
              </div>
              {/* Tier Badge + Pipeline Stage */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {currentContact.tier_classification && (
                  <button
                    onClick={() => setShowEvaluationModal(true)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <div className="inline-flex flex-col items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:border-purple-400 cursor-pointer">
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">{currentContact.tier_classification}</span>
                      <span className="text-lg font-bold text-purple-700">{currentContact.tier_score || 0}/20</span>
                    </div>
                  </button>
                )}
                {/* Pipeline Stage Indicator */}
                <PipelineStage
                  tier={currentContact.tier_classification}
                  status={currentContact.response_status}
                  onStageClick={handlePipelineStageClick}
                />
                {/* Done Checkbox */}
                <button
                  onClick={markAsDone}
                  title={currentContact.response_status === 'done' ? 'Marked Done' : 'Mark as Done'}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200
                    ${currentContact.response_status === 'done'
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'bg-white border-slate-300 text-slate-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                >
                  <CheckCircle2 className={`w-4 h-4 transition-transform duration-200 ${currentContact.response_status === 'done' ? 'scale-110' : ''}`} />
                  {currentContact.response_status === 'done' ? 'Done!' : 'Mark Done'}
                </button>
              </div>
            </div>
            
            {currentContact.current_company && (
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold">Current:</span> {currentContact.current_position} at {currentContact.current_company}
              </p>
            )}
            {currentContact.location && (
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold">Location:</span> {currentContact.location}
              </p>
            )}
            {currentContact.connection_date && (
              <p className="text-sm text-slate-600 mb-3">
                <span className="font-semibold">Connected:</span> {new Date(currentContact.connection_date).toLocaleDateString()}
              </p>
            )}
            <a
              href={currentContact.linkedin_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#C19A6B] text-sm font-semibold"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Status & Action Bar */}
        <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {currentContact.response_status && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                <CheckCircle2 className="w-3 h-3" />
                {currentContact.response_status}
              </div>
            )}
            {linkedEntity && (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                {linkedEntity.type === 'nominee' ? 'In TOP 100' : 'In System'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Composer Button */}
            <Button
              onClick={() => setShowComposer(true)}
              size="sm"
              className="bg-[#1e3a5a] text-white hover:bg-[#0f2438] text-xs font-semibold"
            >
              <PenSquare className="w-3 h-3 mr-1.5" />
              Compose
            </Button>

            {/* Quick Evaluate Button if not evaluated */}
            {currentContact.triage_status !== 'evaluated' && (
              <Button
                onClick={handleQuickEvaluate}
                disabled={loading}
                size="sm"
                className="bg-[#D4A574] text-white hover:bg-[#C19A6B] text-xs font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-1.5 w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    Evaluating...
                  </>
                ) : (
                  'Evaluate'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation thread — reverse chronological (newest first) */}
      {(() => {
        const theirName = currentContact.first_name || currentContact.full_name;
        const messages = [
          { text: currentContact.last_sent_message, date: currentContact.last_sent_date, isMe: true },
          { text: currentContact.second_received_message, date: currentContact.second_received_date, isMe: false },
          { text: currentContact.last_received_message, date: currentContact.last_received_date, isMe: false },
        ]
          .filter(m => m.text)
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        return (
          <div className="grid grid-cols-1 gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-5 border ${msg.isMe
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${msg.isMe ? 'text-blue-600' : 'text-slate-600'}`}>
                  {msg.isMe ? '✓ Me' : `💬 ${theirName}`}
                  {msg.date && (
                    <span className={`font-normal ml-2 ${msg.isMe ? 'text-blue-400' : 'text-slate-400'}`}>
                      {new Date(msg.date).toLocaleString()}
                    </span>
                  )}
                </p>
                <p className="text-slate-700 leading-relaxed text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Composer Modal */}
      <Dialog open={showComposer} onOpenChange={setShowComposer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1e3a5a]">
              <MessageCircle className="w-5 h-5" />
              Reply to {currentContact.first_name || currentContact.full_name}
            </DialogTitle>
          </DialogHeader>

          {/* Agent Skill Picker */}
          {agentSkills.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <Bot className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-700 mb-1">Agent Voice</p>
                <select
                  value={selectedSkillId}
                  onChange={e => setSelectedSkillId(e.target.value)}
                  className="w-full text-xs bg-white border border-indigo-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">Default (Networking Assistant)</option>
                  {agentSkills.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.display_name || s.name} {s.persona_role ? `· ${s.persona_role}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedSkillId && (
                <div className="text-xs text-indigo-500 flex-shrink-0">
                  {agentSkills.find(s => s.id === selectedSkillId)?.version || ''}
                </div>
              )}
            </div>
          )}

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here, or use AI Generate..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm resize-none"
            rows={6}
          />
          <div className="flex gap-3 mt-2">
            <Button
              onClick={generateResponse}
              disabled={generatingResponse}
              variant="outline"
              className="text-sm gap-1.5"
            >
              {generatingResponse ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-indigo-500" />
                  AI Generate
                </>
              )}
            </Button>
            <Button onClick={saveResponse} variant="outline" className="text-sm">
              Save Draft
            </Button>
            <Button
              onClick={() => { markAsSent(); setShowComposer(false); }}
              disabled={!response}
              className="text-sm bg-[#D4A574] text-white hover:bg-[#C19A6B] ml-auto"
            >
              Mark as Sent
            </Button>
          </div>
          {currentContact.response_status === 'sent' && (
            <p className="text-xs text-green-600 mt-1">✓ Marked as sent</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Modal */}
      <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentContact.full_name} - TIER-S Evaluation</DialogTitle>
          </DialogHeader>
          <TriageEvaluation contact={currentContact} onEvaluated={handleEvaluated} />
        </DialogContent>
      </Dialog>

      {currentContact.response_status === 'done' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-300 p-4 text-center"
        >
          <p className="text-sm font-bold text-green-700">🎉 Outreach Complete! One step closer to inbox zero.</p>
        </motion.div>
      )}
    </motion.div>
  );
}