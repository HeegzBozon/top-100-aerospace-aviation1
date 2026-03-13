import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#b8860b',
  cream: '#faf8f5',
};

const OnboardingSteps = ({ isMobile }) => [
  {
    title: '⚠️ Alpha Version',
    subtitle: 'Under Construction',
    content: (
      <div className="space-y-4 md:space-y-6 text-center">
        <div className="text-6xl md:text-8xl mb-4">🚧</div>
        <div className="space-y-3 md:space-y-4">
          <p className="text-white text-lg md:text-2xl font-bold">
            Expect Rough Air
          </p>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            This is an early alpha version of Runway to Orbit. You may encounter bugs, performance issues, or incomplete features.
          </p>
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 md:p-6">
            <p className="text-amber-200 text-xs md:text-sm font-semibold mb-2">
              🛠️ ALPHA STATUS
            </p>
            <p className="text-white/60 text-xs md:text-sm">
              Your feedback helps us improve. Report issues or suggestions as you explore.
            </p>
          </div>
          <p className="text-white/50 text-xs md:text-sm mt-6">
            Thank you for being an early tester! 🚀
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Welcome to The Hangar',
    subtitle: 'Your Aerospace Command Center',
    content: (
      <div className="space-y-3 md:space-y-4">
        <p className="text-white/80 text-sm md:text-lg leading-relaxed">
          Welcome, Sky Cadet! You've been selected for the TOP 100 Aerospace & Aviation research program.
        </p>
        <p className="text-white/70 text-sm md:text-base leading-relaxed">
          Your mission: Explore the hangar, collect artifacts, complete missions, and rise through the prestige ranks.
        </p>
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl md:text-5xl flex-shrink-0">💡</div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm md:text-base">Intellectual Property (IP)</div>
              <div className="text-white/60 text-xs md:text-sm">Knowledge gained from exploring, missions, and artifacts</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl md:text-5xl flex-shrink-0">💼</div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm md:text-base">Equity Points (EP)</div>
              <div className="text-white/60 text-xs md:text-sm">Sweat equity earned through contributions and achievements</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Movement Controls',
    subtitle: 'Navigate the Hangar',
    content: isMobile ? (
      <div className="space-y-3">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">👆</div>
            <div className="text-white font-semibold text-lg">Tap to Move</div>
          </div>
          <div className="text-white/60 text-sm">
            Tap anywhere on the ground to walk to that location
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🔄</div>
            <div className="text-white font-semibold text-lg">Touch & Drag</div>
          </div>
          <div className="text-white/60 text-sm">
            Touch and drag anywhere to rotate the camera view
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">🎯</div>
            <div className="text-white font-semibold text-lg">Tap Objects</div>
          </div>
          <div className="text-white/60 text-sm">
            Tap on highlighted objects to interact with them
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">W</span>
              </div>
              <span className="text-white/80">Move Forward</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">S</span>
              </div>
              <span className="text-white/80">Move Backward</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">A</span>
              </div>
              <span className="text-white/80">Move Left</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">D</span>
              </div>
              <span className="text-white/80">Move Right</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-mono text-xl">Mouse Drag</span>
              </div>
              <span className="text-white/80">Rotate Camera View</span>
            </div>
          </div>
        </div>
        <p className="text-white/60 text-sm text-center mt-4">
          💡 You can also click anywhere to move to that location
        </p>
      </div>
    ),
  },
  {
    title: 'Interactions',
    subtitle: 'Discover and Collect',
    content: (
      <div className="space-y-3 md:space-y-4">
        <p className="text-white/80 text-sm md:text-base">
          As you explore, you'll encounter interactive objects, artifacts, and terminals.
        </p>
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            {isMobile ? (
              <div className="text-3xl">👆</div>
            ) : (
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-mono text-xl">X</span>
              </div>
            )}
            <div className="flex-1">
              <div className="text-white font-semibold">Interact</div>
              <div className="text-white/60 text-sm">
                {isMobile ? 'Tap to collect artifacts, read terminals, open doors' : 'Collect artifacts, read terminals, open doors'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl">💎</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Artifacts</div>
              <div className="text-white/60 text-sm">Collect to earn IP and unlock lore</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Terminals & NPCs</div>
              <div className="text-white/60 text-sm">Learn aerospace history and stories</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Research Missions',
    subtitle: 'Your Primary Objectives',
    content: (
      <div className="space-y-3 md:space-y-4">
        <p className="text-white/80 text-sm md:text-base">
          Complete missions to earn substantial IP/EP and unlock new areas.
        </p>
        <div className="space-y-2 md:space-y-3">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-400/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📅</div>
              <div className="text-white font-semibold">Daily Missions</div>
            </div>
            <div className="text-white/70 text-sm">
              Quick objectives that reset every 24 hours. Great for steady IP gains.
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-400/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📆</div>
              <div className="text-white font-semibold">Weekly Missions</div>
            </div>
            <div className="text-white/70 text-sm">
              Larger challenges with bigger rewards. Reset every Monday.
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-400/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🔬</div>
              <div className="text-white font-semibold">Research Missions</div>
            </div>
            <div className="text-white/70 text-sm">
              Special deep-dive missions. Complete once for permanent rewards.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-4">
          <div className="text-2xl">📜</div>
          <div>
            <div className="text-white font-semibold">Press the Missions button</div>
            <div className="text-white/60 text-sm">Access your mission board anytime from the HUD</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Advanced Features',
    subtitle: 'Tools & Navigation',
    content: isMobile ? (
      <div className="space-y-3">
        <p className="text-white/70 text-sm mb-4">
          Access powerful features from the HUD buttons at the top of your screen:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl">📜</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Missions Button</div>
              <div className="text-white/60 text-sm">Track objectives and progress</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl">🔬</div>
            <div className="flex-1">
              <div className="text-white font-semibold">R&D Lab Button</div>
              <div className="text-white/60 text-sm">Access mini-games and evaluations</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl">🌎</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Outside Toggle</div>
              <div className="text-white/60 text-sm">Switch between interior/exterior</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl">⚙️</div>
            <div className="flex-1">
              <div className="text-white font-semibold">Control Buttons</div>
              <div className="text-white/60 text-sm">Audio, layers, and fullscreen</div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">I</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Inventory</div>
                <div className="text-white/60 text-sm">View collected artifacts and badges</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">O</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Outside View</div>
                <div className="text-white/60 text-sm">Toggle between hangar interior and campus exterior</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">L</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Layer Navigator</div>
                <div className="text-white/60 text-sm">Jump between different hangar sections</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">R</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">R&D Lab</div>
                <div className="text-white/60 text-sm">Access mini-games and evaluations</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-center min-w-[3rem]">
                <span className="text-white font-mono text-xl">ESC</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Pause Menu</div>
                <div className="text-white/60 text-sm">Access settings and help</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Prestige Ranks',
    subtitle: 'Your Progression Path',
    content: (
      <div className="space-y-3 md:space-y-4">
        <p className="text-white/80 text-sm md:text-base">
          As you earn Intellectual Property and Equity Points, you'll advance through prestige ranks.
        </p>
        <div className="space-y-2">
          {[
            { rank: 'Bronze', ip: '0 IP', color: '#cd7f32' },
            { rank: 'Silver', ip: '500 IP', color: '#c0c0c0' },
            { rank: 'Gold', ip: '2,000 IP', color: '#ffd700' },
            { rank: 'BlackBox', ip: '5,000 IP', color: '#1a1a1a' },
            { rank: 'Platinum', ip: '10,000 IP', color: '#e5e4e2' },
          ].map((tier) => (
            <div 
              key={tier.rank}
              className="flex items-center justify-between p-3 rounded-xl border border-white/10"
              style={{ background: `linear-gradient(90deg, ${tier.color}15, transparent)` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2"
                  style={{ borderColor: tier.color, background: `${tier.color}30` }}
                />
                <span className="text-white font-semibold">{tier.rank}</span>
              </div>
              <span className="text-white/60 text-sm">{tier.ip}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <div className="text-white font-semibold">Higher ranks unlock exclusive areas</div>
              <div className="text-white/60 text-sm">Keep exploring and completing missions!</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Ready for Takeoff!',
    subtitle: 'You\'re All Set',
    content: (
      <div className="space-y-4 md:space-y-6 text-center">
        <div className="text-5xl md:text-7xl mb-2 md:mb-4">✈️</div>
        <p className="text-white/80 text-base md:text-lg">
          You're ready to begin your aerospace journey!
        </p>
        <div className="space-y-2 text-left bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-xl">✓</span>
            <span>{isMobile ? 'Tap to move and interact' : 'Use WASD to move around'}</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-xl">✓</span>
            <span>{isMobile ? 'Tap glowing objects to interact' : 'Press X to interact with objects'}</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-xl">✓</span>
            <span>Check your missions regularly</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-xl">✓</span>
            <span>Collect artifacts to earn IP</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-xl">✓</span>
            <span>Rise through the prestige ranks</span>
          </div>
        </div>
        <p className="text-white/60 text-sm mt-6">
          {isMobile ? 'Use the HUD buttons to access help and controls' : 'Press ESC anytime to access help or view controls again'}
        </p>
      </div>
    ),
  },
];

export default function OnboardingSequence({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  const steps = OnboardingSteps({ isMobile });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto"
    >
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-slate-900 to-black rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-2xl w-full relative my-auto"
        style={{ border: `2px solid ${brandColors.goldPrestige}40` }}
      >
        {/* Skip button */}
        {!isLastStep && (
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 md:top-6 md:right-6 text-white/40 hover:text-white/70 transition-colors z-10"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        )}

        {/* Progress indicator */}
        <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: index <= currentStep ? brandColors.goldPrestige : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-4 md:mb-6">
          <h2 
            className="text-2xl md:text-4xl mb-1 md:mb-2 font-bold px-8 md:px-0"
            style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              color: brandColors.goldPrestige
            }}
          >
            {step.title}
          </h2>
          <p className="text-white/50 text-xs md:text-sm uppercase tracking-wider md:tracking-widest">
            {step.subtitle}
          </p>
        </div>

        <div className="mb-6 md:mb-8 max-h-[50vh] md:max-h-96 overflow-y-auto px-1">
          {step.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="ghost"
            className="text-white disabled:opacity-30 text-xs md:text-sm px-2 md:px-4"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 md:mr-1" />
            <span className="hidden md:inline">Previous</span>
          </Button>

          <div className="text-white/40 text-xs md:text-sm">
            {currentStep + 1} / {steps.length}
          </div>

          <Button
            onClick={handleNext}
            className="text-white font-semibold px-3 md:px-6 text-xs md:text-sm"
            style={{ 
              background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
            }}
          >
            {isLastStep ? 'Begin' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4 md:w-5 md:h-5 md:ml-1" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}