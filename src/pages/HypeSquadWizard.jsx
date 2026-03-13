import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, Award } from 'lucide-react';
import { ReviewStandingsStep } from '@/components/epics/05-rapid-response-cells/hypesquad';
import { ShareAppStep } from '@/components/epics/05-rapid-response-cells/hypesquad';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Welcome Step Component
const WelcomeStep = ({ onNext }) => (
  <div className="text-center space-y-6 bg-[var(--glass)] p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
      <Rocket className="w-12 h-12 text-white" />
    </div>
    <h1 className="text-3xl font-bold">Join the HypeSquad!</h1>
    <p className="text-lg text-[var(--muted)]">
      Help grow the community by reviewing the latest standings and sharing the app with friends. Earn bonus Stardust and Clout for participating!
    </p>
    <Button onClick={onNext} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-shadow">
      Let's Go!
    </Button>
  </div>
);

// Completion Step Component
const CompletionStep = () => (
  <div className="text-center space-y-6 bg-[var(--glass)] p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
      <Award className="w-12 h-12 text-white" />
    </div>
    <h1 className="text-3xl font-bold">You're a Legend!</h1>
    <p className="text-lg text-[var(--muted)]">
      Thank you for being an awesome member of our community. Your rewards have been added to your account!
    </p>
    <Link to={createPageUrl('Home')}>
      <Button size="lg" variant="outline" className="text-current border-[var(--border)] hover:bg-white/20">
        Back to Home
      </Button>
    </Link>
  </div>
);

// Main HypeSquadWizard Page
export default function HypeSquadWizard() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      component: WelcomeStep,
      props: { onNext: () => setStep(1) },
    },
    {
      component: ReviewStandingsStep,
      props: { onNext: () => setStep(2) },
    },
    {
      component: ShareAppStep,
      props: { onNext: () => setStep(3) },
    },
    {
      component: CompletionStep,
      props: {},
    },
  ];

  const CurrentStep = steps[step].component;

  // The root div is transparent, allowing the Layout's background to show through.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.24))] p-4 text-[var(--text)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-full max-w-2xl"
        >
          <CurrentStep {...steps[step].props} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}