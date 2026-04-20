import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Link2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function SurveyPreviewModal({ survey, onClose }) {
  const { toast } = useToast();

  const getSurveyUrl = (preview = false) => {
    const base = window.location.origin;
    return `${base}/survey?id=${survey.id}${preview ? '&preview=true' : ''}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getSurveyUrl(false));
    toast({ title: 'Link Copied', description: 'Shareable survey link copied to clipboard.' });
  };

  const openPreview = () => {
    window.open(getSurveyUrl(true), '_blank');
  };

  const handlePublish = async () => {
    await base44.entities.Survey.update(survey.id, { status: 'active' });
    toast({ title: 'Survey Published', description: 'The survey is now live and accepting responses.' });
    onClose();
  };

  return (
    <div className="space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Surveys
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">{survey.title}</h2>
          {survey.description && <p className="text-sm text-[var(--muted)] mt-1">{survey.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={survey.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
              {survey.status}
            </Badge>
            <span className="text-xs text-[var(--muted)]">{survey.questions?.length || 0} questions · {survey.response_count || 0} responses</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openPreview} className="gap-2 cursor-pointer">
            <ExternalLink className="w-4 h-4" /> Preview
          </Button>
          {survey.status === 'active' ? (
            <Button onClick={copyLink} className="gap-2 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white cursor-pointer">
              <Link2 className="w-4 h-4" /> Copy Link
            </Button>
          ) : (
            <Button onClick={handlePublish} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              <Send className="w-4 h-4" /> Publish
            </Button>
          )}
        </div>
      </div>

      {/* Share Link */}
      {survey.status === 'active' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-700 mb-1">Shareable Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm text-emerald-800 bg-white px-3 py-2 rounded-lg border border-emerald-200 truncate">
              {getSurveyUrl(false)}
            </code>
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0 cursor-pointer">
              <Link2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Question Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">Questions Preview</h3>
        {(survey.questions || []).map((q, i) => (
          <div key={q.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-[#c9a87c] bg-[#c9a87c]/10 px-2 py-0.5 rounded-full mt-0.5">Q{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text)]">
                  {q.label} {q.required && <span className="text-red-400 text-xs">Required</span>}
                </p>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-1">
                  {q.type.replace('_', ' ')}
                </p>
                {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <div className={`w-3 h-3 rounded-${q.type === 'single_choice' ? 'full' : 'sm'} border border-[var(--border)]`} />
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'rating' && (
                  <div className="flex gap-1.5 mt-2">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className="w-7 h-7 rounded bg-[var(--border)]/50 flex items-center justify-center text-[10px] text-[var(--muted)]">{n}</div>
                    ))}
                  </div>
                )}
                {q.type === 'nps' && (
                  <div className="flex gap-1 mt-2">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <div key={n} className="w-6 h-6 rounded bg-[var(--border)]/50 flex items-center justify-center text-[9px] text-[var(--muted)]">{n}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}