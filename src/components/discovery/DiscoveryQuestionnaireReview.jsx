import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';

export default function DiscoveryQuestionnaireReview({ formData, onBack }) {
  const handleDownload = () => {
    const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
    const content = JSON.stringify(formData, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `discovery-questionnaire-${timestamp}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f35] via-[#1e3a5a] to-[#0a1628] relative overflow-hidden p-4 sm:p-8">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#c9a87c] rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#4a90b8] rounded-full mix-blend-multiply filter blur-3xl" style={{ animation: 'pulse 3s infinite' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#c9a87c] to-[#d4a090] rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-8 h-8 text-[#1e3a5a]" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#faf8f5] mb-2">All Set!</h1>
          <p className="text-[#c9a87c]/60 max-w-lg mx-auto">
            Your questionnaire is complete. We have everything we need to get started. Download a copy for your records, or we'll have it on file.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-4">Your Responses Summary</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(formData).map(([key, value]) => {
              if (!value || typeof value !== 'string') return null;
              const qNum = key.replace('q', '');
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-blue-500/30 transition-colors"
                >
                  <p className="text-xs font-bold text-blue-400 mb-1">Q{qNum}</p>
                  <p className="text-sm text-slate-300 line-clamp-2">{value}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all font-bold shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4" />
            Download Responses
          </motion.button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          Questions? Reply to your onboarding email and we'll walk you through anything you need.
        </p>
      </div>
    </div>
  );
}