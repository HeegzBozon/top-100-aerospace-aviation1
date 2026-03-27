import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function MessageCard({ message }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const prompt = `Draft a professional LinkedIn response to this message from "${message.sender || 'Sender'}":

"${message.message || ''}"

Keep it concise, warm, and actionable. 2-3 sentences max.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
      });

      setDraft(response);
    } catch (err) {
      setDraft('Failed to generate draft. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Message */}
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">From</h4>
          <p className="text-lg font-semibold text-slate-900 mb-4">{message.sender || 'Unknown'}</p>

          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Message</h4>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{message.message || 'No message content'}</p>

          {message.date && (
            <>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-2">Date</h4>
              <p className="text-slate-600">{message.date}</p>
            </>
          )}
        </div>

        {/* Draft Section */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">AI Draft</h4>

          {draft ? (
            <>
              <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">{draft}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setDraft('')}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={handleGenerateDraft}
              disabled={loading}
              className="bg-slate-900 text-white hover:bg-slate-800 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Drafting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Draft Response
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}