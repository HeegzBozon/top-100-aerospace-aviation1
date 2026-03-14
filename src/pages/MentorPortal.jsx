import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, Plus, TrendingUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function MentorPortal() {
  const queryClient = useQueryClient();
  const [showCheckInForm, setShowCheckInForm] = useState(null);
  const [checkInData, setCheckInData] = useState({
    duration_minutes: '',
    topics_discussed: [],
    progress_notes: '',
    blockers: '',
    action_items: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myEnrollments = [] } = useQuery({
    queryKey: ['mentor-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.AcceleratorEnrollment.filter({ mentor_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['mentored-startups'],
    queryFn: async () => {
      if (myEnrollments.length === 0) return [];
      const startupIds = myEnrollments.map(e => e.startup_id);
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => startupIds.includes(s.id));
    },
    enabled: myEnrollments.length > 0,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['my-checkins', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.MentorCheckIn.filter({ mentor_email: user.email }, '-check_in_date');
    },
    enabled: !!user?.email,
  });

  const checkInMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      await base44.entities.MentorCheckIn.create({
        enrollment_id: enrollmentId,
        mentor_email: user.email,
        check_in_date: new Date().toISOString().split('T')[0],
        ...checkInData,
        topics_discussed: checkInData.topics_discussed.filter(t => t),
        action_items: checkInData.action_items.filter(a => a),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-checkins']);
      toast.success('Check-in logged!');
      setShowCheckInForm(null);
      setCheckInData({
        duration_minutes: '',
        topics_discussed: [],
        progress_notes: '',
        blockers: '',
        action_items: [],
      });
    },
  });

  const getStartupName = (enrollmentId) => {
    const enrollment = myEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return 'Unknown';
    const startup = startups.find(s => s.id === enrollment.startup_id);
    return startup?.company_name || 'Unknown';
  };

  const totalCheckIns = checkIns.length;
  const thisWeekCheckIns = checkIns.filter(c => {
    const checkInDate = new Date(c.check_in_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return checkInDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Mentor Portal
          </h1>
          <p className="text-gray-600">Guide your startups to success</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                {myEnrollments.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                {totalCheckIns}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                {thisWeekCheckIns}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Avg / Startup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: brandColors.goldPrestige }}>
                {myEnrollments.length > 0 ? (totalCheckIns / myEnrollments.length).toFixed(1) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Startups */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {myEnrollments.map(enrollment => {
            const startup = startups.find(s => s.id === enrollment.startup_id);
            const enrollmentCheckIns = checkIns.filter(c => c.enrollment_id === enrollment.id);
            
            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{startup?.company_name || 'Loading...'}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{startup?.tagline}</p>
                    </div>
                    <Badge style={{ background: enrollment.status === 'active' ? brandColors.goldPrestige : undefined }}>
                      {enrollment.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{enrollment.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage || 0} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-500">Check-ins</div>
                      <div className="font-medium">{enrollmentCheckIns.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Milestones</div>
                      <div className="font-medium">{enrollment.milestones_completed || 0} / {enrollment.total_milestones || 8}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowCheckInForm(enrollment.id)}
                    style={{ background: brandColors.goldPrestige }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Check-in
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Check-in Form Modal */}
        {showCheckInForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                  Log Check-in: {getStartupName(showCheckInForm)}
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={checkInData.duration_minutes}
                    onChange={(e) => setCheckInData({...checkInData, duration_minutes: parseInt(e.target.value)})}
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Progress Notes</label>
                  <Textarea
                    value={checkInData.progress_notes}
                    onChange={(e) => setCheckInData({...checkInData, progress_notes: e.target.value})}
                    placeholder="What progress has the startup made since last check-in?"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Blockers / Challenges</label>
                  <Textarea
                    value={checkInData.blockers}
                    onChange={(e) => setCheckInData({...checkInData, blockers: e.target.value})}
                    placeholder="What's blocking progress?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => checkInMutation.mutate(showCheckInForm)}
                    disabled={checkInMutation.isPending}
                    style={{ background: brandColors.goldPrestige }}
                  >
                    {checkInMutation.isPending ? 'Saving...' : 'Save Check-in'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCheckInForm(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Recent Check-ins */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Recent Check-ins
          </h2>
          <div className="space-y-4">
            {checkIns.slice(0, 10).map(checkIn => (
              <Card key={checkIn.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{getStartupName(checkIn.enrollment_id)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(checkIn.check_in_date).toLocaleDateString()} • {checkIn.duration_minutes} min
                      </div>
                    </div>
                  </div>
                  {checkIn.progress_notes && (
                    <p className="text-sm text-gray-700 mt-2">{checkIn.progress_notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}