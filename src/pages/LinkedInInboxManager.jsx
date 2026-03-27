import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, FileText, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LinkedInInboxManager() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [docUrl, setDocUrl] = useState(null);
  const [error, setError] = useState(null);
  const [folderId, setFolderId] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [mode, setMode] = useState('drive'); // 'drive' or 'upload'

  const handleAnalyzeInbox = async () => {
    if (mode === 'drive' && !folderId.trim()) {
      setError('Please enter a Google Drive folder ID');
      return;
    }
    if (mode === 'upload' && !csvFile) {
      setError('Please select a CSV file');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      let payload = {};
      if (mode === 'drive') {
        payload = { folderId };
      } else {
        const text = await csvFile.text();
        payload = { csvContent: text };
      }
      const result = await base44.functions.invoke('analyzeLinkedInInbox', payload);
      setMessages(result.messages || []);
      setResponses(result.responses || []);
      if (result.docUrl) setDocUrl(result.docUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-[#1e3a5a] font-serif mb-2">
            LinkedIn Inbox Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Auto-analyze messages, generate responses, and create a shared document.
          </p>
        </motion.div>

        {/* Input Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex gap-2 bg-slate-100 p-1 rounded-lg w-fit"
        >
          <button
            onClick={() => setMode('drive')}
            className={`px-4 py-2 rounded font-medium text-sm transition-all ${
              mode === 'drive'
                ? 'bg-white text-[#1e3a5a] shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Drive
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded font-medium text-sm transition-all ${
              mode === 'upload'
                ? 'bg-white text-[#1e3a5a] shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload CSV
          </button>
        </motion.div>

        {/* Google Drive Input */}
        {mode === 'drive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white rounded-lg border border-slate-300 p-6"
          >
            <label className="block text-sm font-semibold text-[#1e3a5a] mb-2">
              Google Drive Folder ID
            </label>
            <input
              type="text"
              placeholder="Paste your Google Drive folder ID"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574] mb-4"
            />
            <p className="text-xs text-slate-600">
              Get your folder ID from the URL: drive.google.com/drive/folders/<strong>FOLDER_ID</strong>
            </p>
          </motion.div>
        )}

        {/* CSV Upload Input */}
        {mode === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white rounded-lg border border-slate-300 p-6"
          >
            <label className="block text-sm font-semibold text-[#1e3a5a] mb-2">
              LinkedIn Messages CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
            />
            <p className="text-xs text-slate-600 mt-2">
              {csvFile ? `Selected: ${csvFile.name}` : 'Upload your LinkedIn inbox CSV export'}
            </p>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <Button
            onClick={handleAnalyzeInbox}
            disabled={loading || (mode === 'drive' ? !folderId.trim() : !csvFile)}
            className="bg-[#D4A574] text-white hover:bg-[#C19A6B] transition-colors h-auto py-3 px-6 text-base rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Messages...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Pull & Analyze Inbox
              </>
            )}
          </Button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Results */}
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Doc Link */}
            {docUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-4">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 mb-2">Document Created!</p>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Google Doc with all responses
                  </a>
                </div>
              </div>
            )}

            {/* Messages & Responses */}
            <div className="grid gap-6">
              {responses.map((response, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-[#1e3a5a] text-lg mb-1">
                      From: {response.senderName}
                    </h3>
                    <p className="text-sm text-slate-500">{response.headline}</p>
                  </div>

                  {/* Original Message */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border-l-4 border-[#D4A574]">
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                      Their Message
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {response.originalMessage}
                    </p>
                  </div>

                  {/* Generated Response */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">
                      Suggested Response
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {response.generatedResponse}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && responses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-600 text-lg">
              Click the button above to pull and analyze your LinkedIn inbox.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}