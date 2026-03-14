import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Briefcase, Lightbulb, Users, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function SMEEvaluationForm({ nominee, onComplete }) {
  const [formData, setFormData] = useState({
    impact_score: 5,
    leadership_score: 5,
    innovation_score: 5,
    community_score: 5,
    trajectory_score: 5,
    risk_effort_analysis: '',
    significance_notes: '',
    verification_notes: '',
    overall_recommendation: 'neutral',
    confidence_level: 0.7
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.SMEEvaluation.create({
        ...data,
        nominee_id: nominee.id,
        evaluator_email: user.email,
        status: 'submitted'
      });
    },
    onSuccess: () => {
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  const criteria = [
    { key: 'impact_score', label: 'Impact', icon: Award, description: 'Patents, missions, research output, programs led' },
    { key: 'leadership_score', label: 'Leadership', icon: Briefcase, description: 'Team size, budget, roles, awards' },
    { key: 'innovation_score', label: 'Innovation', icon: Lightbulb, description: 'Patents, startups, tech commercialized' },
    { key: 'community_score', label: 'Community', icon: Users, description: 'Mentorship, speaking, volunteer work' },
    { key: 'trajectory_score', label: 'Trajectory', icon: TrendingUp, description: 'Growth velocity, momentum, potential' }
  ];

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
          SME Evaluation: {nominee.name}
        </h2>
        <p className="text-sm text-gray-600">Rate each criterion on a scale of 1-10</p>
      </div>

      <div className="space-y-6">
        {criteria.map(criterion => {
          const Icon = criterion.icon;
          return (
            <div key={criterion.key} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
                    {criterion.label}
                  </h3>
                  <p className="text-xs text-gray-600">{criterion.description}</p>
                </div>
                <span className="text-2xl font-bold" style={{ color: brandColors.goldPrestige }}>
                  {formData[criterion.key]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData[criterion.key]}
                onChange={(e) => setFormData({ ...formData, [criterion.key]: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: brandColors.goldPrestige }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (1)</span>
                <span>High (10)</span>
              </div>
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Risk/Effort Analysis
          </label>
          <textarea
            value={formData.risk_effort_analysis}
            onChange={(e) => setFormData({ ...formData, risk_effort_analysis: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Assess difficulty and risk of achievements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Significance Notes
          </label>
          <textarea
            value={formData.significance_notes}
            onChange={(e) => setFormData({ ...formData, significance_notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Context on importance of contributions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Verification Notes
          </label>
          <textarea
            value={formData.verification_notes}
            onChange={(e) => setFormData({ ...formData, verification_notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Notes on verification of claims..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Overall Recommendation
          </label>
          <select
            value={formData.overall_recommendation}
            onChange={(e) => setFormData({ ...formData, overall_recommendation: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="strongly_recommend">Strongly Recommend</option>
            <option value="recommend">Recommend</option>
            <option value="neutral">Neutral</option>
            <option value="not_recommend">Not Recommend</option>
            <option value="flag_for_review">Flag for Review</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: brandColors.navyDeep }}>
            Confidence Level: {(formData.confidence_level * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.confidence_level}
            onChange={(e) => setFormData({ ...formData, confidence_level: parseFloat(e.target.value) })}
            className="w-full"
            style={{ accentColor: brandColors.skyBlue }}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={createMutation.isPending}
        className="w-full mt-6 py-6"
        style={{ background: brandColors.goldPrestige, color: 'white' }}
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting Evaluation...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Submit SME Evaluation
          </>
        )}
      </Button>
    </Card>
  );
}