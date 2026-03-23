import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FIELD_LABELS = {
  bio: 'Bio',
  description: 'Description',
  title: 'Title',
  company: 'Company',
  professional_role: 'Professional Role',
  industry: 'Industry',
  skills: 'Skills',
  affiliations: 'Affiliations',
  linkedin_profile_url: 'LinkedIn URL',
  instagram_url: 'Instagram URL',
  tiktok_url: 'TikTok URL',
  youtube_url: 'YouTube URL',
  website_url: 'Website',
  impact_summary: 'Impact Summary',
  nomination_reason: 'Nominated For',
  achievements: 'Achievements',
  six_word_story: 'Six-Word Story',
  professional_bio: 'Bio',
  job_title: 'Job Title',
  linkedin_url: 'LinkedIn URL',
  personal_website_url: 'Website',
};

function truncate(val, max = 120) {
  if (!val) return '—';
  const str = Array.isArray(val) ? val.join(', ') : String(val);
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function DiffRow({ field, from, to }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 last:border-0 text-xs">
      <span className="font-semibold text-slate-500 uppercase tracking-wide pt-0.5">
        {FIELD_LABELS[field] || field}
      </span>
      <span className="text-slate-400 line-through break-words">{truncate(from)}</span>
      <span className="text-slate-800 font-medium break-words">{truncate(to)}</span>
    </div>
  );
}

export default function PerryProfileConfirmCard({ pendingAction, onConfirm, onCancel, isSubmitting }) {
  if (!pendingAction) return null;

  const { type, diff, careerAction, entry, profileType } = pendingAction;

  const isCareer = type === 'career';
  const diffEntries = diff ? Object.entries(diff) : [];

  return (
    <div
      role="region"
      aria-label="Profile update confirmation"
      className="my-2 rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 bg-amber-100/60">
        <FileText className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          {isCareer ? `Career History — ${careerAction}` : `Profile Update — ${profileType === 'nominee' ? 'Nominee' : 'User'}`}
        </span>
        <Badge variant="outline" className="ml-auto text-[10px] border-amber-300 text-amber-700 bg-white/60">
          Pending Confirmation
        </Badge>
      </div>

      {/* Diff Table */}
      <div className="px-4 py-3">
        {isCareer ? (
          <div className="text-xs text-slate-700 space-y-1">
            {careerAction === 'delete' ? (
              <p className="text-red-600 font-medium">
                Remove: <span className="font-bold">{entry?.role_title}</span> at <span className="font-bold">{entry?.company_name}</span>
              </p>
            ) : (
              Object.entries(entry || {}).filter(([k]) => k !== '_id').map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-semibold text-slate-500 w-28 shrink-0 capitalize">{k.replace(/_/g, ' ')}:</span>
                  <span className="text-slate-800">{String(v || '—')}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Field</span>
              <span>Current</span>
              <span>New</span>
            </div>
            {diffEntries.length > 0 ? (
              diffEntries.map(([field, { from, to }]) => (
                <DiffRow key={field} field={field} from={from} to={to} />
              ))
            ) : (
              <p className="text-xs text-slate-400 py-2">No changes detected.</p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold gap-2"
          aria-label="Confirm profile update"
        >
          <CheckCircle className="w-4 h-4" />
          {isSubmitting ? 'Saving…' : 'Confirm'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 h-10 rounded-xl border-slate-200 text-slate-600 text-sm gap-2"
          aria-label="Cancel profile update"
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}