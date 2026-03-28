import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageCircle, ExternalLink, CheckCircle2, Zap, PenSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TriageEvaluation from './TriageEvaluation';

export default function ContactDetail({ contact, onUpdate }) {
  const [response, setResponse] = useState(contact.generated_response || '');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [linkedEntity, setLinkedEntity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentContact, setCurrentContact] = useState(contact);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    setCurrentContact(contact);
    detectLinkedEntity();
  }, [contact]);

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
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional networking assistant. Generate a thoughtful, personalized response to this LinkedIn message from ${contact.full_name} (${contact.headline}).

Their message: "${contact.last_received_message}"

Keep it warm, professional, and 2-3 sentences. Focus on continuing the conversation naturally.`
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
              {/* Tier Badge in Header - Clickable */}
              {currentContact.tier_classification && (
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="flex-shrink-0 text-right hover:scale-105 transition-transform duration-200"
                >
                  <div className="inline-flex flex-col items-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:border-purple-400 cursor-pointer">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">{currentContact.tier_classification}</span>
                    <span className="text-lg font-bold text-purple-700">{currentContact.tier_score || 0}/20</span>
                  </div>
                </button>
              )}
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
          .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

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
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm resize-none"
            rows={6}
          />
          <div className="flex gap-3 mt-2">
            <Button
              onClick={generateResponse}
              disabled={generatingResponse}
              variant="outline"
              className="text-sm"
            >
              {generatingResponse ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'AI Generate'
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

      {/* Action Buttons */}
      {currentContact.response_status !== 'done' && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-semibold">Complete this outreach to get closer to inbox zero!</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={markAsDone}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Done
            </Button>
          </div>
        </div>
      )}

      {currentContact.response_status === 'done' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-300 p-6 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-lg font-bold text-green-700">Outreach Complete! 🎉</p>
          <p className="text-sm text-green-600 mt-1">One step closer to inbox zero.</p>
        </motion.div>
      )}
    </motion.div>
  );
}