import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, User as UserIcon, 
  Briefcase, Clock, DollarSign, Loader2, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const STEPS = [
  { id: 'profile', title: 'Profile Setup', icon: UserIcon },
  { id: 'service', title: 'First Service', icon: Briefcase },
  { id: 'availability', title: 'Availability', icon: Clock },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
];

export default function ProviderOnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: '',
    headline: '',
    serviceTitle: '',
    serviceDescription: '',
    serviceDuration: 60,
    servicePrice: 100,
    availability: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' },
    },
  });

  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Update user profile
      await User.updateMyUserData({
        provider_bio: formData.bio,
        provider_headline: formData.headline,
        is_provider: true,
        provider_onboarding_complete: true,
      });

      // Create first service
      const user = await User.me();
      await base44.entities.Service.create({
        title: formData.serviceTitle,
        description: formData.serviceDescription,
        provider_user_email: user.email,
        provider_type: 'community',
        price_model: 'fixed',
        base_price: formData.servicePrice,
        duration_minutes: formData.serviceDuration,
        is_active: true,
      });

      // Create availability profile
      await base44.entities.Profile.create({
        user_email: user.email,
        availability_settings: {
          weekly_hours: formData.availability,
          slot_interval: 30,
          buffer_time: 15,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
      onComplete?.();
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Professional Headline</label>
              <Input
                placeholder="e.g., Senior Aerospace Engineer & Consultant"
                value={formData.headline}
                onChange={(e) => updateField('headline', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Textarea
                placeholder="Tell potential clients about your expertise and experience..."
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service Title</label>
              <Input
                placeholder="e.g., 1-on-1 Career Coaching Session"
                value={formData.serviceTitle}
                onChange={(e) => updateField('serviceTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="What will clients get from this service?"
                value={formData.serviceDescription}
                onChange={(e) => updateField('serviceDescription', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              Set your typical weekly availability. You can adjust this later.
            </p>
            {Object.entries(formData.availability).map(([day, config]) => (
              <div key={day} className="flex items-center gap-4">
                <label className="w-24 capitalize font-medium">{day}</label>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => updateField('availability', {
                    ...formData.availability,
                    [day]: { ...config, enabled: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                {config.enabled && (
                  <>
                    <Input
                      type="time"
                      value={config.start}
                      onChange={(e) => updateField('availability', {
                        ...formData.availability,
                        [day]: { ...config, start: e.target.value }
                      })}
                      className="w-28"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={config.end}
                      onChange={(e) => updateField('availability', {
                        ...formData.availability,
                        [day]: { ...config, end: e.target.value }
                      })}
                      className="w-28"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Duration (minutes)</label>
              <Input
                type="number"
                value={formData.serviceDuration}
                onChange={(e) => updateField('serviceDuration', parseInt(e.target.value))}
                min={15}
                step={15}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price (USD)</label>
              <Input
                type="number"
                value={formData.servicePrice}
                onChange={(e) => updateField('servicePrice', parseFloat(e.target.value))}
                min={0}
                step={5}
              />
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">You're all set!</span>
              </div>
              <p className="text-sm text-amber-700">
                After completing setup, your service will be live on the marketplace.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${brandColors.goldPrestige}20` }}
          >
            <CurrentIcon className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
          </div>
          <div>
            <CardTitle style={{ color: brandColors.navyDeep }}>
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {STEPS.length}
            </CardDescription>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={completeMutation.isPending}
            style={{ backgroundColor: brandColors.navyDeep }}
          >
            {completeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === STEPS.length - 1 ? (
              <>
                Complete Setup
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}