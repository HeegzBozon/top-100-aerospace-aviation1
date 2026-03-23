import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
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

const sectors = [
  'launch_systems', 'satellites', 'ground_infrastructure', 'space_robotics',
  'in_space_manufacturing', 'lunar_infrastructure', 'mars_missions', 'space_tourism',
  'propulsion', 'materials', 'data_analytics', 'communications', 'other'
];

const stages = ['idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth'];
const revenueStatuses = ['pre_revenue', 'revenue_generating', 'profitable'];

export default function FounderApplication() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    tagline: '',
    description: '',
    sector: '',
    stage: '',
    country: '',
    website_url: '',
    pitch_deck_url: '',
    demo_video_url: '',
    team_size: '',
    funding_target: '',
    funding_raised_to_date: 0,
    revenue_status: 'pre_revenue',
    logo_url: '',
    contact_email: '',
    linkedin_url: '',
    key_differentiator: '',
    traction_metrics: {},
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.StartupProfile.create({
        ...data,
        founder_email: user.email,
        contact_email: data.contact_email || user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-startup']);
      toast.success('Application submitted successfully!');
      navigate(createPageUrl('MissionControl') + '?module=founder');
    },
    onError: (error) => {
      toast.error('Failed to submit application');
      console.error(error);
    },
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.company_name && formData.tagline && formData.description;
    }
    if (step === 2) {
      return formData.sector && formData.stage && formData.country;
    }
    return true;
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Founder Application
            </h1>
          </div>
          <p className="text-gray-600" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Step {step} of 3 — Tell us about your startup
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-2 rounded-full transition-all"
              style={{ background: s <= step ? brandColors.goldPrestige : '#e2e8f0' }}
            />
          ))}
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Basics */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Company Basics
                </h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Company Name *
                  </label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="e.g., Acme Space Systems"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tagline *
                  </label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="One sentence describing what you do"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your mission, vision, and what makes you unique..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Key Differentiator
                  </label>
                  <Textarea
                    value={formData.key_differentiator}
                    onChange={(e) => handleChange('key_differentiator', e.target.value)}
                    placeholder="What makes your startup unique?"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Market & Stage */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Market & Stage
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Sector *
                  </label>
                  <Select value={formData.sector} onValueChange={(val) => handleChange('sector', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Stage *
                  </label>
                  <Select value={formData.stage} onValueChange={(val) => handleChange('stage', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your funding stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Country *
                  </label>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="e.g., United States"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Team Size
                  </label>
                  <Input
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => handleChange('team_size', parseInt(e.target.value))}
                    placeholder="Current number of team members"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Revenue Status
                  </label>
                  <Select value={formData.revenue_status} onValueChange={(val) => handleChange('revenue_status', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueStatuses.map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Funding & Links */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
                  Funding & Resources
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Funding Target ($USD)
                  </label>
                  <Input
                    type="number"
                    value={formData.funding_target}
                    onChange={(e) => handleChange('funding_target', parseInt(e.target.value))}
                    placeholder="e.g., 1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Funding Raised to Date ($USD)
                  </label>
                  <Input
                    type="number"
                    value={formData.funding_raised_to_date}
                    onChange={(e) => handleChange('funding_raised_to_date', parseInt(e.target.value))}
                    placeholder="e.g., 250000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Website URL
                  </label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    LinkedIn URL
                  </label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Pitch Deck URL
                  </label>
                  <Input
                    value={formData.pitch_deck_url}
                    onChange={(e) => handleChange('pitch_deck_url', e.target.value)}
                    placeholder="Link to your pitch deck (Google Drive, Dropbox, etc.)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ensure sharing permissions are set appropriately</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Demo Video URL (Optional)
                  </label>
                  <Input
                    value={formData.demo_video_url}
                    onChange={(e) => handleChange('demo_video_url', e.target.value)}
                    placeholder="YouTube, Vimeo, or Loom link"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
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
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
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