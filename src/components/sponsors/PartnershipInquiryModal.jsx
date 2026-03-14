import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { X, ArrowRight, ArrowLeft, CheckCircle, Send } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const steps = [
  {
    id: 'company',
    question: 'What company or organization do you represent?',
    placeholder: 'Enter company name',
    type: 'text'
  },
  {
    id: 'name',
    question: 'What\'s your name?',
    placeholder: 'Enter your full name',
    type: 'text'
  },
  {
    id: 'email',
    question: 'What\'s your email address?',
    placeholder: 'you@company.com',
    type: 'email'
  },
  {
    id: 'role',
    question: 'What\'s your role?',
    placeholder: 'e.g., Marketing Director, CEO',
    type: 'text'
  },
  {
    id: 'tier',
    question: 'Which partnership tier interests you most?',
    type: 'choice',
    options: ['Bronze ($5K)', 'Silver ($15K)', 'Gold ($35K)', 'Platinum ($75K+)', 'Custom Solution']
  },
  {
    id: 'goals',
    question: 'What are your primary partnership goals?',
    type: 'multiselect',
    options: ['Brand Awareness', 'Talent Acquisition', 'Thought Leadership', 'Community Engagement', 'Lead Generation', 'Industry Positioning']
  },
  {
    id: 'timeline',
    question: 'When would you like to start?',
    type: 'choice',
    options: ['Immediately', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Just exploring']
  },
  {
    id: 'message',
    question: 'Anything else we should know?',
    placeholder: 'Share any additional details or questions...',
    type: 'textarea',
    optional: true
  }
];

export default function PartnershipInquiryModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await base44.entities.PartnershipInquiry.create({
        company: formData.company || '',
        name: formData.name || '',
        email: formData.email || '',
        role: formData.role || '',
        tier: formData.tier || '',
        goals: formData.goals || [],
        timeline: formData.timeline || '',
        message: formData.message || '',
        status: 'new'
      });

      setIsSubmitting(false);
      setIsComplete(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      setIsSubmitting(false);
      alert('Failed to submit inquiry. Please try again.');
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({});
    setIsComplete(false);
    onClose();
  };

  const updateFormData = (value) => {
    setFormData({ ...formData, [step.id]: value });
  };

  const canProceed = () => {
    if (step.optional) return true;
    const value = formData[step.id];
    if (step.type === 'multiselect') return value && value.length > 0;
    return value && value.trim().length > 0;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canProceed() && !isSubmitting) {
      handleNext();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          style={{ background: 'white' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: brandColors.cream }}>
            <motion.div
              className="h-full"
              style={{ background: brandColors.goldPrestige }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
          >
            <X className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          </button>

          {/* Content */}
          <div className="p-12 md:p-16">
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Counter */}
                  <div className="text-sm font-medium mb-6" style={{ color: brandColors.goldPrestige }}>
                    Question {currentStep + 1} of {steps.length}
                  </div>

                  {/* Question */}
                  <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ 
                    color: brandColors.navyDeep,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    {step.question}
                  </h2>

                  {/* Input Field */}
                  {step.type === 'text' && (
                    <Input
                      type="text"
                      placeholder={step.placeholder}
                      value={formData[step.id] || ''}
                      onChange={(e) => updateFormData(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="text-xl p-6 border-2 rounded-xl"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  )}

                  {step.type === 'email' && (
                    <Input
                      type="email"
                      placeholder={step.placeholder}
                      value={formData[step.id] || ''}
                      onChange={(e) => updateFormData(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="text-xl p-6 border-2 rounded-xl"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  )}

                  {step.type === 'textarea' && (
                    <textarea
                      placeholder={step.placeholder}
                      value={formData[step.id] || ''}
                      onChange={(e) => updateFormData(e.target.value)}
                      autoFocus
                      rows={4}
                      className="w-full text-xl p-6 border-2 rounded-xl resize-none"
                      style={{ borderColor: brandColors.navyDeep + '20' }}
                    />
                  )}

                  {step.type === 'choice' && (
                    <div className="space-y-3">
                      {step.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateFormData(option)}
                          className="w-full text-left p-5 border-2 rounded-xl transition-all hover:scale-[1.02]"
                          style={{
                            borderColor: formData[step.id] === option ? brandColors.goldPrestige : brandColors.navyDeep + '20',
                            background: formData[step.id] === option ? brandColors.goldPrestige + '10' : 'transparent',
                            color: brandColors.navyDeep
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium">{option}</span>
                            {formData[step.id] === option && (
                              <CheckCircle className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step.type === 'multiselect' && (
                    <div className="space-y-3">
                      {step.options.map((option) => {
                        const selected = formData[step.id]?.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              const current = formData[step.id] || [];
                              const updated = selected
                                ? current.filter(item => item !== option)
                                : [...current, option];
                              updateFormData(updated);
                            }}
                            className="w-full text-left p-5 border-2 rounded-xl transition-all hover:scale-[1.02]"
                            style={{
                              borderColor: selected ? brandColors.goldPrestige : brandColors.navyDeep + '20',
                              background: selected ? brandColors.goldPrestige + '10' : 'transparent',
                              color: brandColors.navyDeep
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-medium">{option}</span>
                              {selected && (
                                <CheckCircle className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                      <p className="text-sm mt-2" style={{ color: brandColors.navyDeep + '60' }}>
                        Select all that apply
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center gap-4 mt-10">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        size="lg"
                        className="px-6"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                      size="lg"
                      className="flex-1 px-8 py-6 text-lg"
                      style={{ 
                        background: canProceed() ? brandColors.goldPrestige : brandColors.navyDeep + '20',
                        color: canProceed() ? 'white' : brandColors.navyDeep + '60'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
                      {!isSubmitting && (currentStep === steps.length - 1 ? (
                        <Send className="w-5 h-5 ml-2" />
                      ) : (
                        <ArrowRight className="w-5 h-5 ml-2" />
                      ))}
                    </Button>
                  </div>

                  {/* Hint */}
                  {!step.optional && (
                    <p className="text-sm mt-4" style={{ color: brandColors.navyDeep + '60' }}>
                      Press <kbd className="px-2 py-1 rounded bg-black/5 font-mono text-xs">Enter ↵</kbd>
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: brandColors.goldPrestige + '20' }}>
                    <CheckCircle className="w-10 h-10" style={{ color: brandColors.goldPrestige }} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4" style={{ 
                    color: brandColors.navyDeep,
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Thank You!
                  </h2>
                  <p className="text-xl" style={{ color: brandColors.navyDeep + '80' }}>
                    We'll be in touch within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}