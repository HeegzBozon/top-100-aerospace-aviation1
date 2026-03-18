import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import DiscoveryQuestionnaireForm from '@/components/discovery/DiscoveryQuestionnaireForm';
import DiscoveryQuestionnaireReview from '@/components/discovery/DiscoveryQuestionnaireReview';

const SECTIONS = [
  { id: 1, title: 'Brand & Identity', required: true },
  { id: 2, title: 'Target Audience & Clients', required: true },
  { id: 3, title: 'Services & Offerings', required: true },
  { id: 4, title: 'Competitors & Inspiration', required: false },
  { id: 5, title: 'Website Goals & Must-Haves', required: false },
  { id: 6, title: 'SEO & Keywords', required: false },
  { id: 7, title: 'Social Media', required: false },
  { id: 8, title: 'Assets Inventory', required: false },
];

export default function DiscoveryQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const handleNext = () => {
    if (currentStep < SECTIONS.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  const handleSectionClick = (index) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const progress = useMemo(() => {
    return ((currentStep + 1) / SECTIONS.length) * 100;
  }, [currentStep]);

  if (showReview) {
    return <DiscoveryQuestionnaireReview formData={formData} onBack={() => setShowReview(false)} />;
  }

  const section = SECTIONS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f35] via-[#1e3a5a] to-[#0a1628] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a87c] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-[#d4a090] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-16 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-black tracking-widest text-blue-400 uppercase">Discovery Questionnaire</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {section.title}
          </h1>
          <p className="text-slate-400 text-sm">Step {currentStep + 1} of {SECTIONS.length}</p>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8 sm:mb-12">
          <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}% complete</p>
        </div>

        {/* Form container */}
        <div className="flex-1 mb-8 sm:mb-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.3 }}
            >
              <DiscoveryQuestionnaireForm
                sectionId={section.id}
                formData={formData}
                setFormData={setFormData}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Section navigator */}
        <div className="mb-8 sm:mb-12">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SECTIONS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSectionClick(idx)}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  idx === currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white scale-110'
                    : idx < currentStep
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-500'
                }`}
                aria-label={`Section ${s.id}: ${s.title}`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700/50 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-bold shadow-lg hover:shadow-xl"
          >
            {currentStep === SECTIONS.length - 1 ? 'Review' : 'Next'}
            {currentStep < SECTIONS.length - 1 && <ChevronRight className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Save prompt */}
        <p className="text-center text-xs text-slate-500 mt-6">Your responses are auto-saved as you go.</p>
      </div>
    </div>
  );
}