import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function EnrollmentManagement() {
  const queryClient = useQueryClient();
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    startup_id: '',
    cohort_id: '',
    mentor_email: '',
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['all-cohorts'],
    queryFn: () => base44.entities.AcceleratorCohort.list('-created_date'),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.AcceleratorEnrollment.list('-created_date'),
  });

  const { data: startups = [] } = useQuery({
    queryKey: ['approved-startups'],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => s.status === 'approved');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const enrollment = await base44.entities.AcceleratorEnrollment.create({
        ...data,
        status: 'invited',
        enrolled_date: new Date().toISOString().split('T')[0],
      });

      // Create milestones for the enrollment (8 weeks)
      const milestones = [
        { week: 1, title: 'Pitch Deck Refinement', description: 'Polish your pitch deck based on investor feedback frameworks' },
        { week: 2, title: 'Market Analysis Deep Dive', description: 'Validate TAM/SAM/SOM with data-driven research' },
        { week: 3, title: 'GTM Strategy Workshop', description: 'Define your go-to-market strategy and customer acquisition plan' },
        { week: 4, title: 'Financial Modeling', description: 'Build 3-year projections and unit economics model' },
        { week: 5, title: 'Traction Metrics', description: 'Define and track key growth metrics' },
        { week: 6, title: 'Investor Targeting', description: 'Create targeted investor list and outreach strategy' },
        { week: 7, title: 'Demo Day Prep', description: 'Prepare and practice your 5-minute pitch' },
        { week: 8, title: 'Fundraising Execution', description: 'Launch outreach and manage investor pipeline' },
      ];

      const cohort = cohorts.find(c => c.id === data.cohort_id);
      const startDate = new Date(cohort.start_date);

      for (const milestone of milestones) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + (milestone.week * 7));
        
        await base44.entities.AcceleratorMilestone.create({
          enrollment_id: enrollment.id,
          week: milestone.week,
          title: milestone.title,
          description: milestone.description,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'not_started',
        });
      }

      // Update startup
      await base44.entities.StartupProfile.update(data.startup_id, {
        accelerator_enrolled: true,
      });

      // Notify founder
      const startup = startups.find(s => s.id === data.startup_id);
      if (startup) {
        await base44.entities.Notification.create({
          user_email: startup.founder_email,
          title: '🎉 Accelerator Invitation',
          message: `Congratulations! You've been invited to join ${cohort.name}. Check your dashboard for details.`,
          type: 'success',
          important: true,
          urgent: true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      queryClient.invalidateQueries(['approved-startups']);
      toast.success('Startup invited to accelerator!');
      setShowInviteForm(false);
      setInviteData({ startup_id: '', cohort_id: '', mentor_email: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ enrollmentId, status }) => {
      await base44.entities.AcceleratorEnrollment.update(enrollmentId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Enrollment status updated');
    },
  });

  const filteredEnrollments = selectedCohort === 'all' 
    ? enrollments 
    : enrollments.filter(e => e.cohort_id === selectedCohort);

  const getStartupName = (startupId) => {
    const startup = startups.find(s => s.id === startupId);
    return startup?.company_name || 'Unknown';
  };

  const getCohortName = (cohortId) => {
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
            Enrollment Management
          </h2>
          <p className="text-sm text-gray-600">Invite startups and manage their program participation</p>
        </div>
        <Button onClick={() => setShowInviteForm(true)} style={{ background: brandColors.goldPrestige }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Startup
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border"
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Invite Startup to Accelerator
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Startup *</label>
              <Select value={inviteData.startup_id} onValueChange={(val) => setInviteData({...inviteData, startup_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a startup" />
                </SelectTrigger>
                <SelectContent>
                  {startups.filter(s => !s.accelerator_enrolled).map(startup => (
                    <SelectItem key={startup.id} value={startup.id}>
                      {startup.company_name} ({startup.founder_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Cohort *</label>
              <Select value={inviteData.cohort_id} onValueChange={(val) => setInviteData({...inviteData, cohort_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.filter(c => c.status === 'recruiting' || c.status === 'active').map(cohort => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assign Mentor (Optional)</label>
              <Input
                type="email"
                value={inviteData.mentor_email}
                onChange={(e) => setInviteData({...inviteData, mentor_email: e.target.value})}
                placeholder="mentor@example.com"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => inviteMutation.mutate(inviteData)}
                disabled={!inviteData.startup_id || !inviteData.cohort_id || inviteMutation.isPending}
                style={{ background: brandColors.goldPrestige }}
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Cohort:</label>
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {cohorts.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Startup</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEnrollments.map(enrollment => (
              <tr key={enrollment.id}>
                <td className="px-6 py-4 text-sm font-medium">{getStartupName(enrollment.startup_id)}</td>
                <td className="px-6 py-4 text-sm">{getCohortName(enrollment.cohort_id)}</td>
                <td className="px-6 py-4">
                  <Badge style={{ 
                    background: enrollment.status === 'completed' ? '#10b981' 
                      : enrollment.status === 'active' ? brandColors.goldPrestige
                      : undefined 
                  }}>
                    {enrollment.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm">
                  {enrollment.progress_percentage || 0}% ({enrollment.milestones_completed || 0}/{enrollment.total_milestones || 8})
                </td>
                <td className="px-6 py-4 text-sm">{enrollment.mentor_email || 'Unassigned'}</td>
                <td className="px-6 py-4">
                  <Select 
                    value={enrollment.status} 
                    onValueChange={(val) => updateStatusMutation.mutate({ enrollmentId: enrollment.id, status: val })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invited">Invited</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}