import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket, Users, Award, CheckCircle, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function AcceleratorHub() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myStartup } = useQuery({
    queryKey: ['my-startup', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const startups = await base44.entities.StartupProfile.filter({ founder_email: user.email });
      return startups[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: myEnrollment } = useQuery({
    queryKey: ['my-enrollment', myStartup?.id],
    queryFn: async () => {
      if (!myStartup?.id) return null;
      const enrollments = await base44.entities.AcceleratorEnrollment.filter({ startup_id: myStartup.id });
      return enrollments[0] || null;
    },
    enabled: !!myStartup?.id,
  });

  const { data: cohort } = useQuery({
    queryKey: ['cohort', myEnrollment?.cohort_id],
    queryFn: async () => {
      if (!myEnrollment?.cohort_id) return null;
      const cohorts = await base44.entities.AcceleratorCohort.list();
      return cohorts.find(c => c.id === myEnrollment.cohort_id);
    },
    enabled: !!myEnrollment?.cohort_id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', myEnrollment?.id],
    queryFn: async () => {
      if (!myEnrollment?.id) return [];
      return await base44.entities.AcceleratorMilestone.filter({ enrollment_id: myEnrollment.id }, 'week');
    },
    enabled: !!myEnrollment?.id,
  });

  const { data: activeCohorts = [] } = useQuery({
    queryKey: ['active-cohorts'],
    queryFn: async () => {
      const all = await base44.entities.AcceleratorCohort.list();
      return all.filter(c => c.status === 'recruiting' || c.status === 'active');
    },
  });

  if (!myStartup) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center max-w-md">
          <Rocket className="w-16 h-16 mx-auto mb-6" style={{ color: brandColors.navyDeep }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Apply as a Founder First
          </h2>
          <p className="text-gray-600 mb-6">
            You need a startup profile to access the accelerator program.
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

  if (!myEnrollment) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Micro-Accelerator Program
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              4-8 week intensive program to sharpen your pitch, GTM strategy, and fundraising readiness.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  Structured Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Week-by-week milestones covering pitch refinement, GTM strategy, and investor readiness.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  Expert Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  1:1 guidance from aerospace industry veterans and successful founders.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                  Demo Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Present to a curated audience of investors actively seeking aerospace opportunities.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Available Cohorts */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: brandColors.navyDeep }}>
              Available Cohorts
            </h2>
            {activeCohorts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No cohorts currently recruiting. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {activeCohorts.map(cohort => (
                  <Card key={cohort.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{cohort.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{cohort.description}</p>
                        </div>
                        <Badge style={{ background: cohort.status === 'recruiting' ? brandColors.goldPrestige : brandColors.skyBlue }}>
                          {cohort.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500">Start Date</div>
                          <div className="font-medium">{new Date(cohort.start_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="font-medium">
                            {Math.ceil((new Date(cohort.end_date) - new Date(cohort.start_date)) / (7 * 24 * 60 * 60 * 1000))} weeks
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Capacity</div>
                          <div className="font-medium">{cohort.enrolled_count} / {cohort.max_startups}</div>
                        </div>
                      </div>
                      {cohort.status === 'recruiting' && (
                        <Button disabled className="w-full">
                          Application by Invitation Only
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enrolled view
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const upcomingMilestones = milestones.filter(m => m.status === 'not_started' || m.status === 'in_progress').slice(0, 3);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {cohort?.name || 'Accelerator Program'}
              </h1>
              <p className="text-gray-600">{myStartup.company_name}</p>
            </div>
            <Badge style={{ background: brandColors.goldPrestige }} className="text-lg px-4 py-2">
              {myEnrollment.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2" style={{ color: brandColors.navyDeep }}>
                {myEnrollment.progress_percentage || 0}%
              </div>
              <Progress value={myEnrollment.progress_percentage || 0} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {completedMilestones}
                </span>
                <span className="text-gray-500">/ {milestones.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {myEnrollment.mentor_email || 'To be assigned'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Demo Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {cohort?.demo_day_date ? new Date(cohort.demo_day_date).toLocaleDateString() : 'TBD'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Milestones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.navyDeep }}>
            Upcoming Milestones
          </h2>
          <div className="space-y-4">
            {upcomingMilestones.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-600">All milestones completed! 🎉</p>
                </CardContent>
              </Card>
            ) : (
              upcomingMilestones.map(milestone => (
                <Link key={milestone.id} to={`${createPageUrl('MilestoneDetail')}?id=${milestone.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">Week {milestone.week}</Badge>
                            <h3 className="font-semibold">{milestone.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="text-xs text-gray-500">
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge style={{ background: milestone.status === 'in_progress' ? brandColors.skyBlue : undefined }}>
                          {milestone.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}