import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const investorTypes = ['angel', 'vc', 'corporate', 'family_office', 'accelerator', 'strategic'];
const sectors = [
  'launch_systems', 'satellites', 'ground_infrastructure', 'space_robotics',
  'in_space_manufacturing', 'lunar_infrastructure', 'mars_missions', 'space_tourism',
  'propulsion', 'materials', 'data_analytics', 'communications', 'other'
];
const stages = ['idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth'];

export default function InvestorOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    investor_type: '',
    organization_name: '',
    focus_sectors: [],
    focus_stages: [],
    check_size_min: '',
    check_size_max: '',
    geographic_focus: [],
    bio: '',
    linkedin_url: '',
    website_url: '',
    logo_url: '',
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.InvestorProfile.create({
        ...data,
        user_email: user.email,
        active: true,
        verified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-investor-profile']);
      toast.success('Investor profile created!');
      navigate(createPageUrl('MissionControl') + '?module=investor');
    },
    onError: (error) => {
      toast.error('Failed to create profile');
      console.error(error);
    },
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      handleChange(field, current.filter(v => v !== value));
    } else {
      handleChange(field, [...current, value]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.investor_type && formData.organization_name;
    }
    if (step === 2) {
      return formData.focus_sectors.length > 0 && formData.focus_stages.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Investor Onboarding
            </h1>
          </div>
          <p className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Step {step} of 3 — Tell us about your investment criteria
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-2 rounded-full transition-all"
              style={{ background: s <= step ? brandColors.goldPrestige : '#e2e8f0' }}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Investor Profile
                </h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Investor Type *
                  </label>
                  <Select value={formData.investor_type} onValueChange={(val) => handleChange('investor_type', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your investor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {investorTypes.map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Organization Name *
                  </label>
                  <Input
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    placeholder="e.g., Acme Ventures"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Bio / Investment Thesis
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Describe your background and what you're looking for..."
                    rows={6}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Investment Focus
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Focus Sectors * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sectors.map(sector => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => handleMultiSelect('focus_sectors', sector)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          formData.focus_sectors.includes(sector)
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {sector.replace(/_/g, ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Focus Stages * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {stages.map(stage => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleMultiSelect('focus_stages', stage)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          formData.focus_stages.includes(stage)
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {stage.replace(/_/g, ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Check Size & Links
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Min Check Size ($USD)
                    </label>
                    <Input
                      type="number"
                      value={formData.check_size_min}
                      onChange={(e) => handleChange('check_size_min', parseInt(e.target.value))}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Max Check Size ($USD)
                    </label>
                    <Input
                      type="number"
                      value={formData.check_size_max}
                      onChange={(e) => handleChange('check_size_max', parseInt(e.target.value))}
                      placeholder="e.g., 500000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    LinkedIn URL
                  </label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Website URL
                  </label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://yourfirm.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Logo URL (Optional)
                  </label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://yourfirm.com/logo.png"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step + 1)} 
                  disabled={!canProceed()}
                  className="ml-auto"
                  style={{ background: brandColors.navyDeep }}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="ml-auto"
                  style={{ background: brandColors.goldPrestige }}
                >
                  {submitMutation.isPending ? 'Creating...' : 'Complete Profile'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}