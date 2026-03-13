import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Trophy, Calendar, Target, Gift, PartyPopper, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  festiveRed: '#c41e3a',
  festiveGreen: '#165b33',
  festiveGold: '#ffd700',
};

const steps = [
  {
    id: 1,
    icon: Sparkles,
    header: 'Welcome Back',
    subheader: 'Redesigned. Expanded. Future-ready.',
    body: [
      "We've rebuilt the TOP 100 experience from the ground up.",
      "Cleaner navigation. A new evaluation engine. Streamlined voting. Richer honoree profiles.",
      "A platform worthy of the people shaping the future of flight."
    ],
    primaryAction: 'Continue',
    showSecondary: false,
  },
  {
    id: 2,
    icon: Trophy,
    header: 'A Fully Upgraded Recognition Engine',
    subheader: 'Built for clarity, credibility, and community.',
    highlights: [
      'New global categories (Women + Men)',
      'Real-time rankings with enhanced transparency',
      'Improved pairwise + ranked-choice evaluations',
      'New community architecture + visibility features',
      'Upgraded honoree profile design'
    ],
    primaryAction: 'Next',
  },
  {
    id: 3,
    icon: Calendar,
    header: 'The Roadmap Ahead',
    subheader: 'The TOP 100 now runs on a structured, repeatable, annual operating cycle.',
    timeline: [
      { quarter: 'Q1', phase: 'Nomination window opens' },
      { quarter: 'Q2', phase: 'Evaluation + voting phases' },
      { quarter: 'Q3', phase: 'Rankings analysis + honoree review' },
      { quarter: 'Q4', phase: 'Final playoffs → publication → global celebration' }
    ],
    body: ["This rhythm ensures consistency, credibility, and industry-wide continuity."],
    primaryAction: "See This Season's Status",
  },
  {
    id: 4,
    icon: Target,
    header: 'Season 3 — The Final Act',
    subheader: 'We are in the endgame of the 2025 recognition cycle.',
    currentPhase: [
      'Final pairwise matchups',
      'Lightning sprint ranked-choice round',
      'Final honoree verification',
      'Preparation for New Year\'s Eve publication'
    ],
    body: ["Your participation during this final stretch helps shape the definitive list of the year."],
    primaryAction: 'Begin Final Voting',
    primaryLink: 'Home',
    primaryLinkParams: '?tab=nominations',
  },
  {
    id: 5,
    icon: Star,
    header: 'Your Tasks & Activities',
    subheader: "Here's what's available to you right now.",
    tasks: [
      { label: 'Submit final pairwise votes', link: 'Home', linkParams: '?tab=nominations' },
      { label: 'Complete ranked-choice sprint', link: 'RankedChoice' },
      { label: 'Nominate for Season 4 (Women + Men)', link: 'Submit' },
      { label: 'Update your profile', link: 'UserProfile' },
      { label: 'Explore new honoree pages', link: 'Arena' },
    ],
    primaryAction: 'Go to Dashboard',
    primaryLink: 'Home',
  },
  {
    id: 6,
    icon: Gift,
    header: 'The 12 Days of Christmas Campaign',
    subheader: 'Daily Reveals Begin Now',
    body: [
      "From Dec 12–24, expect daily spotlights, new features, collaborations, and community moments.",
      "This is our signature year-end momentum push."
    ],
    primaryAction: 'Follow the Campaign',
    primaryLink: 'Calendar',
  },
  {
    id: 7,
    icon: PartyPopper,
    header: 'New Year\'s Eve Global Launch Party',
    subheader: '10 hours. 10 time zones. The official Season 3 reveal at midnight PT.',
    body: [
      "Join the live broadcast on Whatnot, LinkedIn, YouTube, and Instagram.",
      "Celebrate the honorees. Participate in the live auction. Witness the official 2025 list go live."
    ],
    primaryAction: 'Save Your Spot',
    secondaryAction: 'Add to Calendar',
    primaryLink: 'Home',
  },
  {
    id: 8,
    icon: Sparkles,
    header: 'Want to Accelerate Your Visibility?',
    subheader: 'Optional — For Honorees & Rising Leaders',
    body: [
      "Our new Honoree Visibility Accelerator is designed to help you refine your professional presence, strengthen your storytelling, and amplify your industry impact."
    ],
    primaryAction: 'Learn More',
    secondaryAction: 'No thanks',
    isOptional: true,
  }
];

// Snowflake component
const Snowflake = ({ delay = 0, duration = 10 }) => {
  const randomX = Math.random() * 100;
  const randomSize = 4 + Math.random() * 8;
  
  return (
    <motion.div
      className="absolute text-white/40"
      style={{
        left: `${randomX}%`,
        top: '-20px',
        fontSize: `${randomSize}px`,
      }}
      animate={{
        y: ['0vh', '120vh'],
        x: [0, Math.random() * 100 - 50],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    >
      ❄
    </motion.div>
  );
};

export default function Season3ReOnboarding({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrimary = () => {
    if (step.primaryLink) {
      const url = createPageUrl(step.primaryLink) + (step.primaryLinkParams || '');
      window.location.href = url;
    } else {
      handleNext();
    }
  };

  const handleSecondary = () => {
    if (step.isOptional) {
      onComplete();
    } else {
      handleNext();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-hidden"
      onClick={onComplete}
    >
      {/* Festive Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <Snowflake key={i} delay={i * 0.5} duration={8 + Math.random() * 4} />
        ))}
        
        {/* Festive Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${10 + (i % 3) * 30}%`,
              fontSize: '20px',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{ 
            border: `3px solid ${brandColors.festiveGold}`,
            boxShadow: `0 0 40px ${brandColors.festiveGold}40, 0 20px 60px rgba(0,0,0,0.3)`
          }}
        >
          {/* Festive Border Decoration */}
          <div className="absolute top-0 left-0 right-0 h-3 flex justify-around" style={{ background: `linear-gradient(90deg, ${brandColors.festiveRed}, ${brandColors.festiveGreen}, ${brandColors.festiveRed})` }}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative p-8 pb-6 text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.goldPrestige}, ${brandColors.festiveRed}20)` }}>
            {/* Festive Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute text-2xl"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 2) * 40}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                ⭐
              </motion.div>
            ))}
            
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 relative"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.festiveGold}, ${brandColors.festiveRed})`,
                boxShadow: `0 0 30px ${brandColors.festiveGold}60`
              }}
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="w-10 h-10 text-white" />
              {/* Festive Ribbon */}
              <motion.div
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🎀
              </motion.div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {step.header}
            </h2>
            
            {step.subheader && (
              <p className="text-lg text-white/90">{step.subheader}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Body paragraphs */}
            {step.body && (
              <div className="space-y-3 mb-6">
                {step.body.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Highlights */}
            {step.highlights && (
              <div className="space-y-2 mb-6">
                {step.highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg relative overflow-hidden"
                    style={{ background: `${brandColors.cream}`, border: `1px solid ${brandColors.festiveGold}30` }}
                  >
                    <motion.div 
                      className="w-3 h-3 rounded-full" 
                      style={{ background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.festiveGreen})` }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    />
                    <span className="text-gray-800">{highlight}</span>
                    {idx === 0 && <span className="ml-auto text-xl">🎄</span>}
                    {idx === 2 && <span className="ml-auto text-xl">🎁</span>}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Timeline */}
            {step.timeline && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {step.timeline.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="p-4 rounded-xl text-center"
                    style={{ background: brandColors.cream, border: `1px solid ${brandColors.goldPrestige}` }}
                  >
                    <div className="text-2xl font-bold mb-1" style={{ color: brandColors.navyDeep }}>
                      {item.quarter}
                    </div>
                    <div className="text-sm text-gray-600">{item.phase}</div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Current Phase */}
            {step.currentPhase && (
              <div className="space-y-2 mb-6 p-5 rounded-xl" style={{ background: brandColors.cream }}>
                <div className="font-semibold mb-3" style={{ color: brandColors.navyDeep }}>Current Phase:</div>
                {step.currentPhase.map((phase, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                    <span className="text-gray-700">{phase}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks */}
            {step.tasks && (
              <div className="space-y-2 mb-6">
                {step.tasks.map((task, idx) => (
                  <motion.a
                    key={idx}
                    href={createPageUrl(task.link) + (task.linkParams || '')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-all"
                    style={{ background: brandColors.cream, border: `1px solid ${brandColors.goldPrestige}20` }}
                  >
                    <span className="text-gray-800">{task.label}</span>
                    <ChevronRight className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  </motion.a>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePrimary}
                size="lg"
                className="flex-1 text-white relative overflow-hidden group"
                style={{ 
                  background: `linear-gradient(135deg, ${brandColors.festiveRed}, ${brandColors.goldPrestige})`,
                  boxShadow: `0 4px 20px ${brandColors.festiveRed}40`
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative z-10">{step.primaryAction}</span>
                <ChevronRight className="w-5 h-5 ml-2 relative z-10" />
              </Button>
              
              {(step.secondaryAction || step.showSecondary !== false) && (
                <Button
                  onClick={handleSecondary}
                  size="lg"
                  variant="outline"
                  className="flex-1"
                >
                  {step.secondaryAction || 'Skip'}
                </Button>
              )}
            </div>

            {/* Progress - Festive Style */}
            <div className="flex justify-center gap-2 mt-6 relative">
              {steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-2 rounded-full transition-all relative"
                  style={{
                    width: idx === currentStep ? '32px' : '8px',
                    background: idx === currentStep 
                      ? `linear-gradient(90deg, ${brandColors.festiveRed}, ${brandColors.festiveGreen}, ${brandColors.festiveGold})` 
                      : `${brandColors.goldPrestige}30`,
                    boxShadow: idx === currentStep ? `0 0 10px ${brandColors.festiveGold}60` : 'none'
                  }}
                  animate={idx === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}