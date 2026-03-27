import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CSVUpload from '@/components/LinkedInInboxManager/CSVUpload';
import MessageCard from '@/components/LinkedInInboxManager/MessageCard';

export default function LinkedInInboxManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCSVUpload = (parsedMessages) => {
    setMessages(parsedMessages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">LinkedIn Inbox Manager</h1>
          <p className="text-slate-600">Upload CSV, analyze messages, and draft responses with AI assistance.</p>
        </motion.div>

        {/* Upload Section */}
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <CSVUpload onUpload={handleCSVUpload} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Messages ({messages.length})</h2>
              <Button
                onClick={() => setMessages([])}
                variant="outline"
                size="sm"
              >
                Upload New CSV
              </Button>
            </div>
          </motion.div>
        )}

        {/* Messages Grid */}
        {messages.length > 0 && (
          <div className="grid gap-6">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MessageCard message={message} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Upload a CSV to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}