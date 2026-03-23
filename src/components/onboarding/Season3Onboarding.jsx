import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Shield, Calculator, Users, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const steps = [
  {
    title: 'Welcome to Season 3',
    subtitle: 'TOP 100 Women in Aerospace & Aviation',
    icon: Sparkles,
    color: brandColors.goldPrestige,
    content: (
      <div className="space-y-4 text-center">
        <p className="text-lg">
          We're excited to introduce our most comprehensive evaluation system yet.
        </p>
        <p className="text-base text-gray-600">
          Season 3 features a revolutionary <strong>holistic scoring model</strong> that goes beyond popularity—measuring real impact, innovation, and leadership.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-6">
          <p className="text-sm font-semibold text-gray-800">
            🚀 5 Scoring Layers | ✅ Verification System | 👥 SME Reviews | 📊 Transparent Metrics
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Holistic Scoring v3.0',
    subtitle: 'Five Powerful Evaluation Layers',
    icon: Calculator,
    color: brandColors.skyBlue,
    content: (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
          <div>
            <h4 className="font-semibold text-gray-900">Perception Layer (30%)</h4>
            <p className="text-sm text-gray-600">Community voting, pairwise comparisons, and ranked-choice ballots.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
          <div>
            <h4 className="font-semibold text-gray-900">Objective Achievement (30%)</h4>
            <p className="text-sm text-gray-600">Patents, publications, missions flown, quantifiable impact.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
          <div>
            <h4 className="font-semibold text-gray-900">SME Evaluation (20%)</h4>
            <p className="text-sm text-gray-600">Expert validation from industry subject matter experts.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
          <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
          <div>
            <h4 className="font-semibold text-gray-900">Narrative & Influence (10%)</h4>
            <p className="text-sm text-gray-600">Story quality, thought leadership, domain mastery.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
          <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">5</div>
          <div>
            <h4 className="font-semibold text-gray-900">Representation (10%)</h4>
            <p className="text-sm text-gray-600">Fair normalization across disciplines and career stages.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Verification & Trust',
    subtitle: 'Multi-Checkpoint Validation',
    icon: Shield,
    color: brandColors.navyDeep,
    content: (
      <div className="space-y-4">
        <p className="text-base text-gray-700">
          Every nominee goes through rigorous verification to ensure authenticity and accuracy.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">LinkedIn Verified</h4>
          </div>
          <div className="bg-white border-2 border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Employer Verified</h4>
          </div>
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Metrics Validated</h4>
          </div>
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-semibold text-sm">SME Reviewed</h4>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center mt-4">
          This multi-layer approach prevents gaming and ensures fair, accurate rankings.
        </p>
      </div>
    ),
  },
  {
    title: 'How You Can Participate',
    subtitle: 'Get Involved in Season 3',
    icon: Users,
    color: brandColors.goldPrestige,
    content: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🗳️ Vote & Evaluate</h4>
          <p className="text-sm text-gray-700">
            Participate in pairwise voting, ranked-choice ballots, and spotlight selections.
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Submit Your Metrics</h4>
          <p className="text-sm text-gray-700">
            If you're a nominee, submit your quantitative achievements for objective scoring.
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">👥 Become an SME</h4>
          <p className="text-sm text-gray-700">
            Industry experts can apply to evaluate nominees and contribute to the scoring process.
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">📣 Spread the Word</h4>
          <p className="text-sm text-gray-700">
            Share nominee profiles, engage with content, and help amplify diverse voices.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Let\'s Get Started!',
    subtitle: 'Ready to Experience Season 3',
    icon: Award,
    color: brandColors.goldPrestige,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center">
          <Award className="w-10 h-10 text-white" />
        </div>
        <p className="text-lg font-semibold text-gray-900">
          You're all set to explore the most transparent, comprehensive evaluation system in the industry.
        </p>
        <p className="text-base text-gray-600">
          Head to the Arena to start voting, check the Leaderboard for live rankings, or explore individual profiles to see the holistic scores in action.
        </p>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mt-6">
          <p className="font-semibold text-lg mb-2">🎯 Season 3 is Live</p>
          <p className="text-sm opacity-90">
            Every vote matters. Every metric counts. Every voice is heard.
          </p>
        </div>
      </div>
    ),
  },
];

export default function Season3Onboarding({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsExiting(true);
    // Mark onboarding as complete in user profile
    try {
      await base44.auth.updateMe({ seen_season3_onboarding: true });
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  const handleSkipNow = async () => {
    setIsExiting(true);
    try {
      await base44.auth.updateMe({ seen_season3_onboarding: true });
    } catch (error) {
      console.error('Failed to save onboarding skip:', error);
    }
    setTimeout(() => {
      onSkip?.();
    }, 300);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleSkipNow()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ borderTop: `4px solid ${currentStepData.color}` }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${currentStepData.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: currentStepData.color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
                    <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={handleSkipNow}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: currentStepData.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-96">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2"
                  style={{
                    backgroundColor: currentStepData.color,
                    color: 'white',
                  }}
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}