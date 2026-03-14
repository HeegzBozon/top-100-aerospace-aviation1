import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Job } from '@/entities/Job';
import { Employer } from '@/entities/Employer';
import { Application } from '@/entities/Application';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  MapPin, Briefcase, Clock, DollarSign, Building2, Shield, 
  GraduationCap, Calendar, ArrowLeft, Star, Zap, CheckCircle,
  ExternalLink, Loader2, Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

export default function JobDetail() {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    cover_letter: '',
    resume_url: '',
    linkedin_url: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');
        
        if (!jobId) {
          setLoading(false);
          return;
        }

        const [currentUser, jobData] = await Promise.all([
          User.me().catch(() => null),
          Job.filter({ id: jobId })
        ]);
        
        setUser(currentUser);
        
        if (jobData.length > 0) {
          const foundJob = jobData[0];
          setJob(foundJob);
          
          // Increment views
          await Job.update(foundJob.id, { views_count: (foundJob.views_count || 0) + 1 });
          
          // Get employer
          if (foundJob.employer_id) {
            const employerData = await Employer.filter({ id: foundJob.employer_id });
            if (employerData.length > 0) setEmployer(employerData[0]);
          }

          // Check if already applied
          if (currentUser) {
            const existingApps = await Application.filter({ 
              job_id: foundJob.id, 
              applicant_email: currentUser.email 
            });
            if (existingApps.length > 0) setApplied(true);
          }
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApply = async () => {
    if (!user) {
      await User.loginWithRedirect(window.location.href);
      return;
    }
    setShowApplyModal(true);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setApplicationForm({ ...applicationForm, resume_url: file_url });
    }
  };

  const submitApplication = async () => {
    setApplying(true);
    try {
      await Application.create({
        job_id: job.id,
        employer_id: job.employer_id,
        applicant_email: user.email,
        cover_letter: applicationForm.cover_letter,
        resume_url: applicationForm.resume_url,
        linkedin_url: applicationForm.linkedin_url,
        source: 'direct'
      });
      
      await Job.update(job.id, { 
        applications_count: (job.applications_count || 0) + 1 
      });
      
      setApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold" style={{ color: brandColors.navyDeep }}>Job not found</h2>
          <Link to={createPageUrl('TalentExchange')}>
            <Button className="mt-4" variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const experienceLabels = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior',
    executive: 'Executive',
    intern: 'Internship'
  };

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={createPageUrl('TalentExchange')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Job Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {employer?.logo_url ? (
                      <img src={employer.logo_url} alt={employer.company_name} className="w-16 h-16 rounded-xl object-contain border" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
                        <Building2 className="w-8 h-8" style={{ color: brandColors.navyDeep }} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {job.featured && (
                          <Badge style={{ background: brandColors.goldPrestige, color: 'white' }}>
                            <Star className="w-3 h-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {job.urgent && (
                          <Badge className="bg-red-500 text-white">
                            <Zap className="w-3 h-3 mr-1" /> Urgent
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold mt-2" style={{ color: brandColors.navyDeep }}>{job.title}</h1>
                      <p className="text-lg text-slate-600">{employer?.company_name || 'Company'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {experienceLabels[job.experience_level]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {job.job_type.replace('_', ' ')}
                    </span>
                    {job.remote_policy !== 'onsite' && (
                      <Badge variant="outline">{job.remote_policy}</Badge>
                    )}
                  </div>

                  {job.salary_display === 'show' && job.salary_min && (
                    <div className="flex items-center gap-1 mt-4 text-lg font-semibold" style={{ color: brandColors.goldPrestige }}>
                      <DollarSign className="w-5 h-5" />
                      ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString() || 'DOE'}
                      <span className="text-sm font-normal text-slate-500 ml-1">/ year</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4" style={{ color: brandColors.navyDeep }}>Job Description</h2>
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                    {job.description}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  {job.required_skills?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: brandColors.navyDeep }}>Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, i) => (
                          <Badge key={i} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {job.security_clearance && job.security_clearance !== 'none' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Security:</span>
                        <span className="text-slate-600">{job.security_clearance.replace('_', ' ')}</span>
                      </div>
                    )}
                    {job.education_requirement && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Education:</span>
                        <span className="text-slate-600">{job.education_requirement}</span>
                      </div>
                    )}
                    {job.years_experience_min > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Experience:</span>
                        <span className="text-slate-600">{job.years_experience_min}+ years</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {applied ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <h3 className="font-semibold text-green-700">Application Submitted!</h3>
                    <p className="text-sm text-slate-500 mt-1">We'll notify you of any updates</p>
                  </div>
                ) : (
                  <>
                    <Button 
                      className="w-full text-lg py-6"
                      onClick={handleApply}
                      style={{ background: brandColors.goldPrestige, color: 'white' }}
                    >
                      Apply Now
                    </Button>
                    {job.posted_date && (
                      <p className="text-xs text-center text-slate-400 mt-3">
                        Posted {format(new Date(job.posted_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </>
                )}

                {employer && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-sm mb-3" style={{ color: brandColors.navyDeep }}>About {employer.company_name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{employer.overview_short}</p>
                    {employer.website_url && (
                      <a 
                        href={employer.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm mt-3 hover:underline"
                        style={{ color: brandColors.goldPrestige }}
                      >
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: brandColors.navyDeep }}>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-1">Resume</label>
              <div className="flex items-center gap-2">
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                {applicationForm.resume_url && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">LinkedIn Profile (optional)</label>
              <Input 
                value={applicationForm.linkedin_url}
                onChange={(e) => setApplicationForm({ ...applicationForm, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Cover Letter (optional)</label>
              <Textarea 
                value={applicationForm.cover_letter}
                onChange={(e) => setApplicationForm({ ...applicationForm, cover_letter: e.target.value })}
                placeholder="Why are you interested in this role?"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button 
              onClick={submitApplication}
              disabled={applying}
              style={{ background: brandColors.goldPrestige, color: 'white' }}
            >
              {applying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}