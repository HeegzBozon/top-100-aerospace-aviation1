import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Quote, Eye, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NomineeCard({ nominee, onVote, isVoting, isDisabled, showSpotlightButton = true }) {
  const [showModal, setShowModal] = useState(false);

  const displayBio = nominee.bio || nominee.description || "This nominee's professional bio provides insights into their impact and career journey.";
  const displayStory = nominee.six_word_story || "A story of impact in six words.";

  return (
    <>
      <motion.div
        className="w-full"
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--card)]/90 to-[var(--card)]/70 backdrop-blur-sm border border-[var(--border)] hover:shadow-xl transition-all duration-300 group p-6 md:p-8 space-y-6 h-full flex flex-col">
          {/* Six Word Story */}
          {nominee.six_word_story && (
            <div className="text-center relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-2)]/20 blur-lg"></div>
                <p className="relative text-base md:text-lg font-semibold italic text-[var(--text)] py-3 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent-2)]/10 backdrop-blur-sm">
                  <span className="text-[var(--accent)] text-xl md:text-2xl leading-none">"</span>
                  {nominee.six_word_story}
                  <span className="text-[var(--accent)] text-xl md:text-2xl leading-none">"</span>
                </p>
              </div>
            </div>
          )}

          {/* Truncated Bio */}
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed line-clamp-4 flex-grow">{displayBio}</p>

          {/* Action Buttons */}
          <div className="space-y-3 mt-auto">
            <Button
              onClick={onVote}
              disabled={isVoting || isDisabled}
              className="w-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white font-bold text-base md:text-lg py-4 md:py-5 rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 mr-2" />
              Select
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="w-full text-sm md:text-base py-3 bg-white/5 border-white/20 text-[var(--muted)] hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Read More
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <div className="space-y-6 pr-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-800">Six Word Story</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 italic leading-relaxed">"{displayStory}"</p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-3">Professional Biography</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{displayBio}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      onVote();
                    }}
                    disabled={isVoting || isDisabled}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Select This Nominee
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}