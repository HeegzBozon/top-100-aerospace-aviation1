import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function MilestoneReview() {
  const queryClient = useQueryClient();
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');

  const { data: milestones = [] } = useQuery({
    queryKey: ['submitted-milestones'],
    queryFn: async () => {
      const all = await base44.entities.AcceleratorMilestone.list('-submitted_date');
      return all.filter(m => m.status === 'submitted');
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.AcceleratorEnrollment.list(),
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['all-startups'],
    queryFn: () => base44.entities.StartupProfile.list(),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ milestoneId, decision }) => {
      const milestone = milestones.find(m => m.id === milestoneId);
      const enrollment = enrollments.find(e => e.id === milestone.enrollment_id);
      
      // Update milestone
      await base44.entities.AcceleratorMilestone.update(milestoneId, {
        status: decision === 'approve' ? 'completed' : 'needs_revision',
        mentor_feedback: feedback,
        score: score ? parseInt(score) : null,
      });

      // Update enrollment progress
      if (decision === 'approve') {
        const allMilestones = await base44.entities.AcceleratorMilestone.filter({ enrollment_id: enrollment.id });
        const completed = allMilestones.filter(m => m.status === 'completed' || (m.id === milestoneId && decision === 'approve')).length;
        const progress = Math.round((completed / allMilestones.length) * 100);

        await base44.entities.AcceleratorEnrollment.update(enrollment.id, {
          milestones_completed: completed,
          progress_percentage: progress,
        });
      }

      // Notify founder
      const startup = startups.find(s => s.id === enrollment.startup_id);
      if (startup) {
        await base44.entities.Notification.create({
          user_email: startup.founder_email,
          title: decision === 'approve' ? '✅ Milestone Approved' : '🔄 Revision Requested',
          message: `${milestone.title}: ${feedback}`,
          type: decision === 'approve' ? 'success' : 'warning',
          important: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['submitted-milestones']);
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Review submitted!');
      setSelectedMilestone(null);
      setFeedback('');
      setScore('');
    },
  });

  const getStartupName = (enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return 'Unknown';
    const startup = startups.find(s => s.id === enrollment.startup_id);
    return startup?.company_name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
          Milestone Review Dashboard
        </h2>
        <p className="text-sm text-gray-600">Review and provide feedback on submitted milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
              {milestones.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Pending Submissions
          </h3>
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-600">All caught up! No pending reviews.</p>
                </CardContent>
              </Card>
            ) : (
              milestones.map(milestone => (
                <Card 
                  key={milestone.id} 
                  className={`cursor-pointer transition-shadow ${selectedMilestone?.id === milestone.id ? 'ring-2 ring-[var(--accent)]' : ''}`}
                  onClick={() => setSelectedMilestone(milestone)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{milestone.title}</div>
                        <div className="text-sm text-gray-500">{getStartupName(milestone.enrollment_id)}</div>
                      </div>
                      <Badge variant="outline">Week {milestone.week}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(milestone.submitted_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Review Panel */}
        <div>
          {selectedMilestone ? (
            <motion.div
              key={selectedMilestone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border"
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
                Review Submission
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Milestone</div>
                  <div className="font-semibold">{selectedMilestone.title}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Startup</div>
                  <div>{getStartupName(selectedMilestone.enrollment_id)}</div>
                </div>

                {selectedMilestone.submission_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Submission Link</div>
                    <a 
                      href={selectedMilestone.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {selectedMilestone.submission_url}
                    </a>
                  </div>
                )}

                {selectedMilestone.submission_text && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                      {selectedMilestone.submission_text}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Score (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="85"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Feedback *</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    rows={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => reviewMutation.mutate({ milestoneId: selectedMilestone.id, decision: 'approve' })}
                    disabled={!feedback || reviewMutation.isPending}
                    style={{ background: '#10b981' }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => reviewMutation.mutate({ milestoneId: selectedMilestone.id, decision: 'revise' })}
                    disabled={!feedback || reviewMutation.isPending}
                    style={{ background: '#f59e0b' }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Revision
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a submission to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}