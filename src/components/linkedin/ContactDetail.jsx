import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ContactDetail({ contact, onUpdate }) {
  const [response, setResponse] = useState(contact.generated_response || '');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [sendingResponse, setSendingResponse] = useState(false);

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
      const updated = await base44.entities.LinkedInContact.update(contact.id, {
        generated_response: response,
        response_status: 'draft'
      });
      onUpdate(updated);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const markAsSent = async () => {
    try {
      const updated = await base44.entities.LinkedInContact.update(contact.id, {
        response_status: 'sent',
        last_sent_message: response,
        last_sent_date: new Date().toISOString(),
        has_unread: false
      });
      onUpdate(updated);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Contact Header */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          {contact.avatar_url && (
            <img
              src={contact.avatar_url}
              alt={contact.full_name}
              className="w-16 h-16 rounded-full bg-slate-200"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#1e3a5a] mb-1">{contact.full_name}</h2>
            <p className="text-sm text-slate-600 mb-3">{contact.headline}</p>
            {contact.current_company && (
              <p className="text-sm text-slate-700 mb-3">
                <span className="font-semibold">Current:</span> {contact.current_position} at {contact.current_company}
              </p>
            )}
            <a
              href={contact.linkedin_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#C19A6B] text-sm font-semibold"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Their Message */}
      {contact.last_received_message && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Their Message ({new Date(contact.last_received_date).toLocaleDateString()})
          </p>
          <p className="text-slate-700 leading-relaxed">{contact.last_received_message}</p>
        </div>
      )}

      {/* Response Composer */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-[#1e3a5a] mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Your Response
        </h3>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 text-sm resize-none"
          rows={5}
        />

        <div className="flex gap-3 mt-4">
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
          <Button
            onClick={saveResponse}
            className="text-sm"
            variant="outline"
          >
            Save Draft
          </Button>
          <Button
            onClick={markAsSent}
            disabled={!response}
            className="text-sm bg-[#D4A574] text-white hover:bg-[#C19A6B] ml-auto"
          >
            Mark as Sent
          </Button>
        </div>

        {contact.response_status === 'sent' && (
          <p className="text-xs text-green-600 mt-3">✓ Marked as sent</p>
        )}
      </div>
    </motion.div>
  );
}