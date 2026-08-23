import { Briefcase, MapPin, Building2, ExternalLink, Mail } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { JOB_TYPE_LABELS, EXP_LABELS, REMOTE_LABELS, labelOf } from './jobBoardConfig';

// One job posting card. Editorial Chamber styling. Shows company, location,
// type, remote policy, experience, and an apply link (URL or mailto).
export default function JobCard({ job, accent = B.navy }) {
  const company = job.company_name || 'Member-posted';
  const apply = job.application_url || (job.application_email ? `mailto:${job.application_email}` : null);

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: B.border }}>
      <div className="h-1" style={{ background: accent }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-bold leading-tight truncate" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{job.title}</h4>
            <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: B.muted }}>
              <Building2 className="w-3 h-3" /> {company}
            </p>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: `${accent}14`, color: accent }}>
            {labelOf(JOB_TYPE_LABELS, job.job_type)}
          </span>
        </div>
        {job.summary && (
          <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: B.muted }}>{job.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: B.muted }}>
          {job.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>}
          {job.remote_policy && <span>{labelOf(REMOTE_LABELS, job.remote_policy)}</span>}
          {job.experience_level && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {labelOf(EXP_LABELS, job.experience_level)}</span>}
        </div>
        {apply && (
          <a
            href={apply}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ background: accent, color: '#fff' }}
          >
            {job.application_url ? <><ExternalLink className="w-3.5 h-3.5" /> Apply</> : <><Mail className="w-3.5 h-3.5" /> Apply</>}
          </a>
        )}
      </div>
    </div>
  );
}