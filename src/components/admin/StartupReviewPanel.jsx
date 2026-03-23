import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Rocket, CheckCircle, Clock, 
  TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function StartupReviewPanel() {
  const queryClient = useQueryClient();
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [scoring, setScoring] = useState({
    team_score: 0,
    market_score: 0,
    product_score: 0,
    traction_score: 0,
    pitch_score: 0,
  });
  const [review, setReview] = useState({
    decision: 'pending',
    visibility_recommendation: 'hidden',
    feedback: '',
    internal_notes: '',
  });

  const { data: startups = [], isLoading } = useQuery({
    queryKey: ['admin-startups'],
    queryFn: () => base44.entities.StartupProfile.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const submitScoreMutation = useMutation({
    mutationFn: async () => {
      const totalScore = Object.values(scoring).reduce((a, b) => a + b, 0);
      
      // Create readiness score
      await base44.entities.ReadinessScore.create({
        startup_id: selectedStartup.id,
        reviewer_email: user.email,
        ...scoring,
        total_score: totalScore,
        recommendation: review.decision,
        notes: review.feedback,
      });

      // Create admin review
      await base44.entities.AdminReview.create({
        startup_id: selectedStartup.id,
        reviewer_email: user.email,
        review_type: 'initial_screening',
        decision: review.decision,
        visibility_recommendation: review.visibility_recommendation,
        feedback: review.feedback,
        internal_notes: review.internal_notes,
        reviewed: true,
      });

      // Update startup
      const updateData = {
        readiness_score: totalScore,
        status: review.decision === 'approve' ? 'approved' : review.decision === 'reject' ? 'rejected' : 'under_review',
      };

      if (review.decision === 'approve') {
        updateData.visibility_tier = review.visibility_recommendation;
      }

      if (review.decision === 'accelerator_invite') {
        updateData.status = 'approved';
        updateData.accelerator_enrolled = true;
      }

      await base44.entities.StartupProfile.update(selectedStartup.id, updateData);

      // Notify founder
      await base44.entities.Notification.create({
        user_email: selectedStartup.founder_email,
        title: 'Application Review Complete',
        message: `Your application for ${selectedStartup.company_name} has been reviewed. Readiness Score: ${totalScore}/100`,
        type: review.decision === 'approve' ? 'success' : 'info',
        important: true,
        action_url: createPageUrl('MissionControl') + '?module=founder',
      });

      return totalScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-startups']);
      toast.success('Review submitted successfully!');
      setSelectedStartup(null);
      setScoring({ team_score: 0, market_score: 0, product_score: 0, traction_score: 0, pitch_score: 0 });
      setReview({ decision: 'pending', visibility_recommendation: 'hidden', feedback: '', internal_notes: '' });
    },
  });

  const { data: allSignals = [] } = useQuery({
    queryKey: ['all-signals'],
    queryFn: () => base44.entities.InterestSignal.list(),
  });

  const { data: investors = [] } = useQuery({
    queryKey: ['all-investors'],
    queryFn: () => base44.entities.InvestorProfile.list(),
  });

  const pendingStartups = startups.filter(s => s.status === 'pending_review' || s.status === 'under_review');
  const approvedStartups = startups.filter(s => s.status === 'approved');
  const avgReadinessScore = startups.length > 0 
    ? Math.round(startups.reduce((sum, s) => sum + (s.readiness_score || 0), 0) / startups.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{pendingStartups.length}</div>
                <div className="text-xs text-gray-500">Pending Review</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{approvedStartups.length}</div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {startups.reduce((sum, s) => sum + (s.interest_count || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">Total Signals</div>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{startups.length}</div>
                <div className="text-xs text-gray-500">Total Applications</div>
              </div>
              <Rocket className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{investors.filter(i => i.active).length}</div>
            <div className="text-xs text-gray-500">{investors.filter(i => i.verified).length} verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{avgReadinessScore}</div>
            <div className="text-xs text-gray-500">out of 100</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Matching Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {approvedStartups.length > 0 
                ? Math.round((allSignals.length / approvedStartups.length) * 100) 
                : 0}%
            </div>
            <div className="text-xs text-gray-500">signals per startup</div>
          </CardContent>
        </Card>
      </div>

      {/* Review Interface */}
      {selectedStartup ? (
        <Card>
          <CardHeader>
            <CardTitle>Review: {selectedStartup.company_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scoring */}
            <div>
              <h3 className="font-semibold mb-4">Readiness Scoring (0-20 each)</h3>
              <div className="grid grid-cols-5 gap-4">
                {['team_score', 'market_score', 'product_score', 'traction_score', 'pitch_score'].map(key => (
                  <div key={key}>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {key.replace('_score', '').toUpperCase()}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={scoring[key]}
                      onChange={(e) => setScoring({ ...scoring, [key]: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Score</div>
                <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {Object.values(scoring).reduce((a, b) => a + b, 0)} / 100
                </div>
              </div>
            </div>

            {/* Decision */}
            <div>
              <h3 className="font-semibold mb-4">Review Decision</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Decision</label>
                  <Select value={review.decision} onValueChange={(val) => setReview({ ...review, decision: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="request_more_info">Request More Info</SelectItem>
                      <SelectItem value="accelerator_invite">Accelerator Invite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Visibility Tier</label>
                  <Select 
                    value={review.visibility_recommendation} 
                    onValueChange={(val) => setReview({ ...review, visibility_recommendation: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="listed">Listed</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="spotlight">Spotlight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Feedback for Founder</label>
              <Textarea
                value={review.feedback}
                onChange={(e) => setReview({ ...review, feedback: e.target.value })}
                rows={4}
                placeholder="This will be shared with the founder..."
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Internal Notes (Private)</label>
              <Textarea
                value={review.internal_notes}
                onChange={(e) => setReview({ ...review, internal_notes: e.target.value })}
                rows={3}
                placeholder="Internal notes for admin use only..."
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => submitScoreMutation.mutate()}
                disabled={submitScoreMutation.isPending}
                style={{ background: brandColors.navyDeep }}
              >
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setSelectedStartup(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingStartups.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending applications</p>
            ) : (
              <div className="space-y-3">
                {pendingStartups.map(startup => (
                  <div 
                    key={startup.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{startup.company_name}</h4>
                      <p className="text-sm text-gray-600">{startup.tagline}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {startup.sector?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {startup.stage?.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSelectedStartup(startup)}
                      size="sm"
                      style={{ background: brandColors.goldPrestige }}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}