import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';
import { Employer } from '@/entities/Employer';
import { Job } from '@/entities/Job';
import { Application } from '@/entities/Application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Briefcase, Users, Eye, FileText, Plus, 
  Settings, BarChart3, CheckCircle, Clock, AlertCircle, Inbox
} from 'lucide-react';
import EmployerOnboarding from '@/components/epics/01-index-engine/talent/EmployerOnboarding';
import JobPostForm from '@/components/epics/01-index-engine/talent/JobPostForm';
import ApplicationsList from '@/components/epics/01-index-engine/talent/ApplicationsList';
import FeatureJobButton from '@/components/epics/01-index-engine/talent/FeatureJobButton';
import IntroRequestsDashboard from '@/components/epics/01-index-engine/talent/IntroRequestsDashboard';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const employerProfiles = await Employer.filter({ owner_email: currentUser.email });
        if (employerProfiles.length > 0) {
          const emp = employerProfiles[0];
          setEmployer(emp);

          const [jobList, appList] = await Promise.all([
            Job.filter({ employer_id: emp.id }),
            Application.filter({ employer_id: emp.id })
          ]);
          setJobs(jobList);
          setApplications(appList);
        }
      } catch (error) {
        console.error('Error loading employer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEmployerCreated = (newEmployer) => {
    setEmployer(newEmployer);
  };

  const handleJobCreated = async (newJob) => {
    setJobs([newJob, ...jobs]);
    setShowJobForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!employer) {
    return <EmployerOnboarding user={user} onComplete={handleEmployerCreated} />;
  }

  const stats = {
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalApplications: applications.length,
    newApplications: applications.filter(a => a.status === 'submitted').length,
    totalViews: jobs.reduce((sum, j) => sum + (j.views_count || 0), 0),
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'intros', label: 'Intro Requests', icon: Inbox },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Header */}
      <header className="bg-white border-b py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {employer.logo_url ? (
                <img src={employer.logo_url} alt={employer.company_name} className="w-16 h-16 rounded-xl object-contain border" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
                  <Building2 className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{employer.company_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {employer.verification_status === 'verified' ? (
                      <><CheckCircle className="w-3 h-3 mr-1 text-green-500" /> Verified</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1 text-amber-500" /> Pending Verification</>
                    )}
                  </Badge>
                  {employer.sponsor_status !== 'none' && (
                    <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
                      {employer.sponsor_status.charAt(0).toUpperCase() + employer.sponsor_status.slice(1)} Sponsor
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowJobForm(true)}
              style={{ background: brandColors.goldPrestige, color: 'white' }}
            >
              <Plus className="w-4 h-4 mr-2" /> Post a Job
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{
                  background: activeTab === tab.id ? `${brandColors.navyDeep}10` : 'transparent',
                  color: activeTab === tab.id ? brandColors.navyDeep : '#64748b',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ background: `${brandColors.navyDeep}10` }}>
                      <Briefcase className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stats.activeJobs}</p>
                      <p className="text-sm text-slate-500">Active Jobs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ background: `${brandColors.goldPrestige}20` }}>
                      <FileText className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stats.totalApplications}</p>
                      <p className="text-sm text-slate-500">Applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-50">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stats.newApplications}</p>
                      <p className="text-sm text-slate-500">New</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stats.totalViews}</p>
                      <p className="text-sm text-slate-500">Job Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
                  <FileText className="w-5 h-5" />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <ApplicationsList applications={applications.slice(0, 5)} jobs={jobs} compact />
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <Card key={job.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>{job.title}</h3>
                        <p className="text-sm text-slate-500">{job.location} · {job.job_type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {job.applications_count || 0} applicants
                        </Badge>
                        <Badge className={
                          job.status === 'active' ? 'bg-green-100 text-green-700' :
                          job.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {job.status}
                        </Badge>
                        {!job.featured && job.status === 'active' && (
                          <FeatureJobButton jobId={job.id} jobTitle={job.title} />
                        )}
                        {job.featured && (
                          <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-600">No jobs posted yet</h3>
                  <p className="text-sm text-slate-500 mt-1">Create your first job posting to start receiving applications</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowJobForm(true)}
                    style={{ background: brandColors.goldPrestige, color: 'white' }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <ApplicationsList applications={applications} jobs={jobs} />
        )}

        {activeTab === 'intros' && (
          <IntroRequestsDashboard userEmail={user?.email} />
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: brandColors.navyDeep }}>Company Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Job Post Modal */}
      {showJobForm && (
        <JobPostForm 
          employer={employer} 
          onClose={() => setShowJobForm(false)} 
          onSave={handleJobCreated}
        />
      )}
    </div>
  );
}