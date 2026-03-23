import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap } from 'lucide-react';

export default function NomineeCareerHistorySection({ nominee }) {
  if (!nominee) return null;

  const hasCareerHistory = nominee.career_history && nominee.career_history.length > 0;
  const hasEducation = nominee.education && nominee.education.length > 0;

  return (
    <div className="space-y-6">
      {/* Career History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Career History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCareerHistory ? (
            <div className="space-y-6">
              {nominee.career_history.map((job, idx) => (
                <div key={idx} className="border-l-2 border-slate-300 pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{job.role_title}</h4>
                      <p className="text-sm text-slate-600">{job.company_name}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {job.start_date && (
                        <>
                          {new Date(job.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          {job.end_date && ` - ${new Date(job.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`}
                        </>
                      )}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-slate-600 mt-2">{job.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No career history added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasEducation ? (
            <div className="space-y-4">
              {nominee.education.map((edu, idx) => (
                <div key={idx} className="pb-4 last:pb-0 border-b last:border-b-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                      <p className="text-sm text-slate-600">{edu.institution_name}</p>
                      {edu.field_of_study && (
                        <p className="text-sm text-slate-600">{edu.field_of_study}</p>
                      )}
                    </div>
                    {edu.graduation_date && (
                      <div className="text-right text-sm text-slate-500">
                        {new Date(edu.graduation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No education added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Skills & Affiliations */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Affiliations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(nominee.skills?.length > 0 || nominee.affiliations?.length > 0) ? (
            <>
              {nominee.skills?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {nominee.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nominee.affiliations?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-2">Affiliations</h4>
                  <div className="flex flex-wrap gap-2">
                    {nominee.affiliations.map((aff, idx) => (
                      <Badge key={idx} variant="outline">{aff}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-center py-8">No skills or affiliations added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}