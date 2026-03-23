import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Award, Briefcase, Lightbulb, Users, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function MetricsSubmissionForm({ nominee, onComplete }) {
  const [formData, setFormData] = useState({
    impact_metrics: nominee?.impact_metrics || {
      patents_count: 0,
      citations_count: 0,
      missions_flown: 0,
      flight_hours: 0,
      research_publications: 0,
      programs_led: [],
      tech_deployed: [],
      teams_influenced_size: 0
    },
    leadership_metrics: nominee?.leadership_metrics || {
      team_size_managed: 0,
      budget_responsibility: 0,
      leadership_roles: [],
      awards: [],
      promotions_count: 0
    },
    innovation_metrics: nominee?.innovation_metrics || {
      patents_filed: 0,
      startups_founded: 0,
      tech_commercialized: [],
      trl_advancement: '',
      breakthrough_classifications: []
    },
    community_metrics: nominee?.community_metrics || {
      mentorship_hours: 0,
      speaking_engagements: 0,
      volunteer_hours: 0,
      board_memberships: [],
      open_source_contributions: 0
    },
    trajectory_metrics: nominee?.trajectory_metrics || {
      promotion_velocity: 0,
      funding_raised: 0,
      company_growth_rate: 0,
      follower_count_weighted: 0,
      career_stage: 'mid',
      momentum_score: 0
    },
    discipline: nominee?.discipline || 'engineering'
  });

  const [step, setStep] = useState(0);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Nominee.update(nominee.id, data),
    onSuccess: () => {
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const steps = [
    {
      title: 'Impact Metrics',
      icon: Award,
      color: brandColors.goldPrestige,
      fields: [
        { key: 'patents_count', label: 'Patents', type: 'number' },
        { key: 'citations_count', label: 'Citations', type: 'number' },
        { key: 'missions_flown', label: 'Missions Flown', type: 'number' },
        { key: 'flight_hours', label: 'Flight Hours', type: 'number' },
        { key: 'research_publications', label: 'Publications', type: 'number' },
        { key: 'teams_influenced_size', label: 'Team Size Influenced', type: 'number' }
      ],
      section: 'impact_metrics'
    },
    {
      title: 'Leadership Metrics',
      icon: Briefcase,
      color: brandColors.navyDeep,
      fields: [
        { key: 'team_size_managed', label: 'Team Size Managed', type: 'number' },
        { key: 'budget_responsibility', label: 'Budget Responsibility ($)', type: 'number' },
        { key: 'promotions_count', label: 'Promotions Received', type: 'number' }
      ],
      section: 'leadership_metrics'
    },
    {
      title: 'Innovation Metrics',
      icon: Lightbulb,
      color: brandColors.skyBlue,
      fields: [
        { key: 'patents_filed', label: 'Patents Filed', type: 'number' },
        { key: 'startups_founded', label: 'Startups Founded', type: 'number' },
        { key: 'trl_advancement', label: 'TRL Advancement', type: 'text' }
      ],
      section: 'innovation_metrics'
    },
    {
      title: 'Community Contribution',
      icon: Users,
      color: brandColors.goldPrestige,
      fields: [
        { key: 'mentorship_hours', label: 'Mentorship Hours', type: 'number' },
        { key: 'speaking_engagements', label: 'Speaking Engagements', type: 'number' },
        { key: 'volunteer_hours', label: 'Volunteer Hours', type: 'number' },
        { key: 'open_source_contributions', label: 'Open Source Contributions', type: 'number' }
      ],
      section: 'community_metrics'
    },
    {
      title: 'Trajectory & Career',
      icon: TrendingUp,
      color: brandColors.navyDeep,
      fields: [
        { key: 'promotion_velocity', label: 'Promotion Velocity', type: 'number' },
        { key: 'funding_raised', label: 'Funding Raised ($)', type: 'number' },
        { key: 'company_growth_rate', label: 'Company Growth Rate (%)', type: 'number' },
        { key: 'career_stage', label: 'Career Stage', type: 'select', options: ['early', 'mid', 'senior', 'executive'] }
      ],
      section: 'trajectory_metrics'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: currentStep.color + '20' }}>
            <Icon className="w-6 h-6" style={{ color: currentStep.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
              {currentStep.title}
            </h2>
            <p className="text-sm text-gray-600">Step {step + 1} of {steps.length}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full"
              style={{ background: i <= step ? brandColors.goldPrestige : '#e5e7eb' }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {currentStep.fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={formData[currentStep.section][field.key]}
                onChange={(e) => setFormData({
                  ...formData,
                  [currentStep.section]: {
                    ...formData[currentStep.section],
                    [field.key]: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                value={formData[currentStep.section][field.key]}
                onChange={(e) => setFormData({
                  ...formData,
                  [currentStep.section]: {
                    ...formData[currentStep.section],
                    [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  }
                })}
                className="border-2"
                style={{ borderColor: brandColors.navyDeep + '20' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Previous
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            style={{ background: brandColors.skyBlue, color: 'white' }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            style={{ background: brandColors.goldPrestige, color: 'white' }}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Metrics
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}