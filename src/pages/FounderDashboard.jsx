import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Users, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function FounderDashboard() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myStartup, isLoading } = useQuery({
    queryKey: ['my-startup', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const startups = await base44.entities.StartupProfile.filter({ founder_email: user.email });
      return startups[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['my-signals', myStartup?.id],
    queryFn: async () => {
      if (!myStartup?.id) return [];
      return await base44.entities.InterestSignal.filter({ startup_id: myStartup.id });
    },
    enabled: !!myStartup?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', myStartup?.id],
    queryFn: async () => {
      if (!myStartup?.id) return [];
      return await base44.entities.AdminReview.filter({ startup_id: myStartup.id });
    },
    enabled: !!myStartup?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 animate-pulse" style={{ color: brandColors.goldPrestige }} />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!myStartup) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center max-w-md">
          <Rocket className="w-16 h-16 mx-auto mb-6" style={{ color: brandColors.navyDeep }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            No Application Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted a startup application yet.
          </p>
          <Link to={createPageUrl('FounderApplication')}>
            <Button style={{ background: brandColors.goldPrestige }}>
              Submit Application
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending_review: { icon: Clock, label: 'Pending Review', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    under_review: { icon: Eye, label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-50' },
    approved: { icon: CheckCircle, label: 'Approved', color: 'text-green-600', bg: 'bg-green-50' },
    rejected: { icon: AlertCircle, label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
  };

  const config = statusConfig[myStartup.status] || statusConfig.pending_review;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {myStartup.company_name}
              </h1>
              <p className="text-gray-600">{myStartup.tagline}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${config.bg}`}>
              <StatusIcon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {myStartup.readiness_score || 0}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              <Progress value={myStartup.readiness_score || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Investor Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {myStartup.interest_count || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">signals received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {myStartup.view_count || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">total views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Visibility Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className="text-sm"
                style={{ background: myStartup.visibility_tier === 'spotlight' ? brandColors.goldPrestige : undefined }}
              >
                {myStartup.visibility_tier?.toUpperCase() || 'HIDDEN'}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">current tier</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interest Signals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Interest Signals</CardTitle>
            </CardHeader>
            <CardContent>
              {signals.length === 0 ? (
                <p className="text-sm text-gray-500">No investor interest yet</p>
              ) : (
                <div className="space-y-3">
                  {signals.slice(0, 5).map(signal => (
                    <div key={signal.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{signal.investor_email}</p>
                        <p className="text-xs text-gray-500">
                          {signal.signal_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                      </div>
                      <Badge variant="outline">{signal.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="pb-3 border-b last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{review.review_type.replace(/_/g, ' ')}</p>
                        <Badge variant="outline">{review.decision}</Badge>
                      </div>
                      {review.feedback && (
                        <p className="text-xs text-gray-600">{review.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link to={`${createPageUrl('ProfileView')}?id=${myStartup.id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}