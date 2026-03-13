import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { RRFStageSelector } from '@/components/epics/05-rapid-response-cells/rrf';
import { RRFQuickActions } from '@/components/epics/05-rapid-response-cells/rrf';

export default function PerryRRFRouter({ 
  conversationId, 
  contactName, 
  threadContext, 
  currentStage = 'FORM' 
}) {
  const [stage, setStage] = useState(currentStage);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Call backend function via SDK
      const response = await window.__base44?.integrations?.Core?.InvokeLLM({
        prompt: `You are Lt. Perry in ${stage} stage analyzing: ${contactName}\n\nContext:\n${threadContext}\n\nUser asks: ${prompt}`,
        model: 'gpt_5',
      });

      setResponse(response);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Failed to analyze');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prefix) => {
    setPrompt(prefix);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Stage Selector */}
      <RRFStageSelector currentStage={stage} onStageChange={setStage} />

      {/* Quick Actions */}
      <RRFQuickActions stage={stage} onActionSelect={handleQuickAction} isPerry={true} />

      {/* Response Display */}
      {response && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="p-4 rounded-lg bg-white border border-blue-100/50 shadow-sm">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-blue-100/30">
        <div className="flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAnalyze();
              }
            }}
            placeholder={`Ask Lt. Perry about ${contactName}... (Ctrl+Enter to send)`}
            className="w-full p-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
            rows={3}
            disabled={isLoading}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isLoading}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Analyzing...' : 'Analyze with Perry'}
          </button>
        </div>
      </div>
    </div>
  );
}