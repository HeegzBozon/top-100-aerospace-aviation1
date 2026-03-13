import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Users, 
  Trophy, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Vote,
  Target
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function FirstTimeUserWelcome({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to TOP 100! 🎉',
      description: 'You\'re now part of an elite community recognizing the most impactful professionals.',
      icon: Star,
      color: 'from-purple-500 to-indigo-600',
      action: null
    },
    {
      id: 'voting',
      title: 'Start Voting',
      description: 'Cast votes to discover and elevate remarkable nominees. Every vote matters!',
      icon: Vote,
      color: 'from-blue-500 to-cyan-600',
      action: { label: 'Go Vote', page: 'BallotBox' }
    },
    {
      id: 'endorse',
      title: 'Nominate & Endorse',
      description: 'Know someone amazing? Nominate them or endorse existing nominees.',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      action: { label: 'Start Endorsing', page: 'Endorse' }
    },
    {
      id: 'profile',
      title: 'Build Your Profile',
      description: 'Join the HypeSquad and create an enhanced profile to showcase your impact.',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      action: { label: 'Build Profile', page: 'HypeSquad' }
    },
    {
      id: 'quests',
      title: 'Complete Quests',
      description: 'Earn Stardust and Clout by completing daily and seasonal quests.',
      icon: Zap,
      color: 'from-indigo-500 to-purple-600',
      action: { label: 'View Quests', page: 'Quests' }
    }
  ];

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await User.updateMyUserData({ onboarding_completed: true });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-lg`}>
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {currentStepData.title}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {currentStepData.action ? (
              <Link to={createPageUrl(currentStepData.action.page)}>
                <Button 
                  className={`w-full bg-gradient-to-r ${currentStepData.color} text-white shadow-lg hover:shadow-xl transition-all`}
                  onClick={handleComplete}
                >
                  {currentStepData.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={handleNext}
                className={`w-full bg-gradient-to-r ${currentStepData.color} text-white shadow-lg hover:shadow-xl transition-all`}
              >
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="w-full text-gray-600"
              >
                Back
              </Button>
            )}

            {currentStep === 0 && (
              <Button
                variant="ghost"
                onClick={handleComplete}
                className="w-full text-gray-500 text-sm"
              >
                Skip intro
              </Button>
            )}
          </div>

          {/* Current stats preview */}
          {user && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Your Current Stats</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--score-aura)' }}>
                    {Math.round(user.aura_score || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Aura</div>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--score-stardust)' }}>
                    {user.stardust_points || 0}
                  </div>
                  <div className="text-xs text-gray-500">Stardust</div>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--score-clout)' }}>
                    {user.clout || 0}
                  </div>
                  <div className="text-xs text-gray-500">Clout</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}