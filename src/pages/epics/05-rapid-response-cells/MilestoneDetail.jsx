import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function MilestoneDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const milestoneId = urlParams.get('id');

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');

  const { data: milestone, isLoading } = useQuery({
    queryKey: ['milestone', milestoneId],
    queryFn: async () => {
      if (!milestoneId) return null;
      const milestones = await base44.entities.AcceleratorMilestone.list();
      const found = milestones.find(m => m.id === milestoneId);
      if (found && !submissionUrl && found.submission_url) {
        setSubmissionUrl(found.submission_url);
      }
      if (found && !submissionText && found.submission_text) {
        setSubmissionText(found.submission_text);
      }
      return found;
    },
    enabled: !!milestoneId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.AcceleratorMilestone.update(milestone.id, {
        status: 'submitted',
        submission_url: submissionUrl,
        submission_text: submissionText,
        submitted_date: new Date().toISOString(),
      });

      // Create notification for mentor/admin
      await base44.entities.Notification.create({
        user_email: milestone.mentor_email || 'admin@top100aerospace.com',
        title: 'New Milestone Submission',
        message: `${milestone.title} has been submitted for review`,
        type: 'info',
        important: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['milestone']);
      queryClient.invalidateQueries(['milestones']);
      toast.success('Milestone submitted for review!');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Clock className="w-12 h-12 animate-pulse" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Milestone Not Found
          </h2>
          <Button onClick={() => navigate(createPageUrl('AcceleratorHub'))}>
            Back to Accelerator
          </Button>
        </div>
      </div>
    );
  }

  const canSubmit = milestone.status === 'not_started' || milestone.status === 'in_progress' || milestone.status === 'needs_revision';
  const isSubmitted = milestone.status === 'submitted' || milestone.status === 'reviewed' || milestone.status === 'completed';

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('AcceleratorHub'))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accelerator
        </Button>

        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge variant="outline" className="mb-2">Week {milestone.week}</Badge>
              <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                {milestone.title}
              </h1>
              <p className="text-gray-600">{milestone.description}</p>
            </div>
            <Badge 
              style={{ 
                background: milestone.status === 'completed' ? '#10b981' 
                  : milestone.status === 'submitted' ? brandColors.skyBlue
                  : milestone.status === 'needs_revision' ? '#f59e0b'
                  : undefined 
              }}
            >
              {milestone.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <div className="text-sm text-gray-500 mb-1">Due Date</div>
              <div className="font-medium">{new Date(milestone.due_date).toLocaleDateString()}</div>
            </div>
            {milestone.score && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Score</div>
                <div className="font-medium">{milestone.score} / 100</div>
              </div>
            )}
          </div>

          {/* Submission Section */}
          {canSubmit && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                Submit Your Work
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Submission URL (Optional)
                </label>
                <Input
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="Link to your deck, document, or deliverable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Notes & Context
                </label>
                <Textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Share any context, challenges, or questions for your mentor..."
                  rows={6}
                />
              </div>

              <Button 
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || (!submissionUrl && !submissionText)}
                style={{ background: brandColors.goldPrestige }}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Submitted View */}
          {isSubmitted && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                Your Submission
              </h2>

              {milestone.submission_url && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Submission Link</div>
                  <a 
                    href={milestone.submission_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {milestone.submission_url}
                  </a>
                </div>
              )}

              {milestone.submission_text && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Notes</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {milestone.submission_text}
                  </div>
                </div>
              )}

              {milestone.submitted_date && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Submitted</div>
                  <div className="text-sm">{new Date(milestone.submitted_date).toLocaleString()}</div>
                </div>
              )}

              {milestone.mentor_feedback && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="text-sm font-medium text-blue-900 mb-2">Mentor Feedback</div>
                  <div className="text-sm text-blue-700 whitespace-pre-wrap">
                    {milestone.mentor_feedback}
                  </div>
                </div>
              )}

              {milestone.status === 'needs_revision' && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <div className="text-sm font-medium text-orange-900">Revisions Requested</div>
                  </div>
                  <div className="text-sm text-orange-700">
                    Please review the mentor feedback and resubmit.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}