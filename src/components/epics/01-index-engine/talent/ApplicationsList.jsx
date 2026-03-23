import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Star, FileText, ExternalLink, Award } from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const statusConfig = {
  submitted: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Reviewing', color: 'bg-amber-100 text-amber-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700' },
  interviewing: { label: 'Interviewing', color: 'bg-indigo-100 text-indigo-700' },
  offer_extended: { label: 'Offer Extended', color: 'bg-green-100 text-green-700' },
  hired: { label: 'Hired', color: 'bg-green-500 text-white' },
  rejected: { label: 'Rejected', color: 'bg-slate-100 text-slate-600' },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-500' },
};

export default function ApplicationsList({ applications, jobs, compact = false }) {
  const getJob = (jobId) => jobs.find(j => j.id === jobId);

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="font-semibold text-slate-600">No applications yet</h3>
        <p className="text-sm text-slate-500 mt-1">Applications will appear here when candidates apply</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const job = getJob(app.job_id);
        const status = statusConfig[app.status] || statusConfig.submitted;

        return (
          <div 
            key={app.id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-all"
            style={{ borderColor: '#e2e8f0' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${brandColors.navyDeep}10` }}>
                  <User className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium" style={{ color: brandColors.navyDeep }}>
                      {app.applicant_email}
                    </h4>
                    {app.is_top100_nominee && (
                      <Badge className="text-xs" style={{ background: brandColors.goldPrestige, color: 'white' }}>
                        <Award className="w-3 h-3 mr-1" /> TOP 100
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Applied for <span className="font-medium">{job?.title || 'Unknown Position'}</span>
                  </p>
                  {!compact && app.created_date && (
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(app.created_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {app.match_score && (
                  <div className="flex items-center gap-1 text-sm" style={{ color: brandColors.goldPrestige }}>
                    <Star className="w-4 h-4" />
                    <span className="font-medium">{app.match_score}%</span>
                  </div>
                )}
                <Badge className={status.color}>{status.label}</Badge>
              </div>
            </div>

            {!compact && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {app.resume_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" /> Resume
                    </a>
                  </Button>
                )}
                {app.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" /> LinkedIn
                    </a>
                  </Button>
                )}
                <div className="ml-auto">
                  <Button size="sm" style={{ background: brandColors.navyDeep, color: 'white' }}>
                    Review
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}