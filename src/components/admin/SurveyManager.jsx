import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Search, FileText, Trash2, Pencil, Copy, Eye,
  BarChart3, ChevronDown, ChevronUp, GripVertical, X, Archive, Link2, Send, ExternalLink
} from 'lucide-react';
import SurveyFormEditor from '@/components/admin/SurveyFormEditor';
import SurveyPreviewModal from '@/components/admin/SurveyPreviewModal';
import SurveyAnalytics from '@/components/admin/SurveyAnalytics';

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  closed: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};

const AUDIENCE_LABELS = {
  all_users: 'All Users',
  fellows: 'Fellows',
  nominees: 'Nominees',
  investors: 'Investors',
  sponsors: 'Sponsors',
  custom: 'Custom',
};

export default function SurveyManager() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState(null);
  const [analyticsSurvey, setAnalyticsSurvey] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadSurveys(); }, []);

  const loadSurveys = async () => {
    setLoading(true);
    const data = await base44.entities.Survey.list('-created_date');
    setSurveys(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingSurvey({
      title: '',
      description: '',
      status: 'draft',
      target_audience: 'all_users',
      questions: [],
    });
    setIsCreating(true);
  };

  const handleSave = async (surveyData) => {
    if (isCreating) {
      const user = await base44.auth.me();
      await base44.entities.Survey.create({ ...surveyData, created_by_email: user.email });
      toast({ title: 'Survey Created' });
    } else {
      await base44.entities.Survey.update(editingSurvey.id, surveyData);
      toast({ title: 'Survey Updated' });
    }
    setEditingSurvey(null);
    setIsCreating(false);
    loadSurveys();
  };

  const handleDuplicate = async (survey) => {
    const { id, created_date, updated_date, created_by, response_count, ...rest } = survey;
    const user = await base44.auth.me();
    await base44.entities.Survey.create({
      ...rest,
      title: `${rest.title} (Copy)`,
      status: 'draft',
      response_count: 0,
      created_by_email: user.email,
    });
    toast({ title: 'Survey Duplicated' });
    loadSurveys();
  };

  const handleDelete = async (survey) => {
    if (!confirm(`Delete "${survey.title}"? This cannot be undone.`)) return;
    await base44.entities.Survey.delete(survey.id);
    toast({ title: 'Survey Deleted' });
    loadSurveys();
  };

  const handleArchive = async (survey) => {
    await base44.entities.Survey.update(survey.id, { status: 'archived' });
    toast({ title: 'Survey Archived' });
    loadSurveys();
  };

  const handlePublish = async (survey) => {
    await base44.entities.Survey.update(survey.id, { status: 'active' });
    toast({ title: 'Survey Published', description: 'The survey is now live and accepting responses.' });
    loadSurveys();
  };

  const getSurveyUrl = (survey, preview = false) => {
    const base = window.location.origin;
    return `${base}/survey?id=${survey.id}${preview ? '&preview=true' : ''}`;
  };

  const copyLink = (survey) => {
    navigator.clipboard.writeText(getSurveyUrl(survey));
    toast({ title: 'Link Copied', description: 'Shareable survey link copied to clipboard.' });
  };

  const filtered = surveys.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (editingSurvey) {
    return (
      <SurveyFormEditor
        survey={editingSurvey}
        isNew={isCreating}
        onSave={handleSave}
        onCancel={() => { setEditingSurvey(null); setIsCreating(false); }}
      />
    );
  }

  if (previewSurvey) {
    return <SurveyPreviewModal survey={previewSurvey} onClose={() => setPreviewSurvey(null)} />;
  }

  if (analyticsSurvey) {
    return <SurveyAnalytics survey={analyticsSurvey} onBack={() => setAnalyticsSurvey(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Surveys</h2>
          <p className="text-sm text-[var(--muted)]">Create and manage surveys sent to your community.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white cursor-pointer">
          <Plus className="w-4 h-4" /> New Survey
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Input
            placeholder="Search surveys..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Survey List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c9a87c] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-xl">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[var(--muted)] opacity-40" />
          <p className="text-[var(--muted)] text-sm">
            {surveys.length === 0 ? 'No surveys yet. Create your first one!' : 'No surveys match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(survey => (
            <div
              key={survey.id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[var(--text)] truncate">{survey.title}</h3>
                    <Badge className={`text-[10px] ${STATUS_COLORS[survey.status] || STATUS_COLORS.draft}`}>
                      {survey.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {AUDIENCE_LABELS[survey.target_audience] || survey.target_audience}
                    </Badge>
                  </div>
                  {survey.description && (
                    <p className="text-sm text-[var(--muted)] line-clamp-1 mb-2">{survey.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>{survey.questions?.length || 0} questions</span>
                    <span>{survey.response_count || 0} responses</span>
                    {survey.created_date && (
                      <span>Created {new Date(survey.created_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Analytics" onClick={() => setAnalyticsSurvey(survey)}>
                    <BarChart3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Preview" onClick={() => setPreviewSurvey(survey)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {survey.status === 'active' ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Copy share link" onClick={() => copyLink(survey)}>
                      <Link2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 cursor-pointer" title="Publish" onClick={() => handlePublish(survey)}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Edit" onClick={() => { setEditingSurvey(survey); setIsCreating(false); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Duplicate" onClick={() => handleDuplicate(survey)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" title="Archive" onClick={() => handleArchive(survey)}>
                    <Archive className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 cursor-pointer" title="Delete" onClick={() => handleDelete(survey)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}