import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Download, Users, Mail, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

function ResponseRow({ response, questions, expanded, onToggle }) {
  return (
    <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--border)]/10 transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-[#1e3a5a]/5 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[#1e3a5a]">
            {(response.respondent_name || response.respondent_email || '?')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate">{response.respondent_name || 'Anonymous'}</p>
          <p className="text-xs text-[var(--muted)] truncate">{response.respondent_email}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(response.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Badge>
          {response.completed && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Complete</Badge>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-[var(--muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--muted)]" />}
      </button>
      {expanded && (
        <div className="border-t border-[var(--border)] p-4 space-y-3 bg-[var(--border)]/5">
          {(questions || []).map((q, i) => {
            const answer = response.answers?.[q.id];
            let displayVal = '—';
            if (Array.isArray(answer)) displayVal = answer.join(', ');
            else if (answer !== undefined && answer !== null) displayVal = String(answer);
            return (
              <div key={q.id} className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-[#c9a87c] bg-[#c9a87c]/10 px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted)] mb-0.5">{q.label}</p>
                  <p className="text-sm text-[var(--text)]">{displayVal}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SurveyResponseDashboard({ survey, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadResponses(); }, [survey.id]);

  const loadResponses = async () => {
    setLoading(true);
    const data = await base44.entities.SurveyResponse.filter({ survey_id: survey.id }, '-created_date', 500);
    setResponses(data);
    setLoading(false);
  };

  const filtered = responses.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.respondent_name || '').toLowerCase().includes(q) || (r.respondent_email || '').toLowerCase().includes(q);
  });

  const handleExportCsv = () => {
    if (responses.length === 0) return;
    const questions = survey.questions || [];
    const headers = ['Name', 'Email', 'Date', 'Completed', ...questions.map((q, i) => `Q${i + 1}: ${q.label}`)];
    const rows = responses.map(r => [
      r.respondent_name || '', r.respondent_email || '',
      new Date(r.created_date).toLocaleDateString(), r.completed ? 'Yes' : 'No',
      ...questions.map(q => { const a = r.answers?.[q.id]; return Array.isArray(a) ? a.join('; ') : (a ?? ''); }),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${survey.title.replace(/\s+/g, '_')}_responses.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-60"><Loader2 className="w-8 h-8 animate-spin text-[#c9a87c]" /></div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Surveys
      </button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#c9a87c]" />
            <h2 className="text-xl font-bold text-[var(--text)]">Responses</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">{survey.title} · {responses.length} responses</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={responses.length === 0} className="gap-2 cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center">
          <p className="text-2xl font-bold text-[var(--text)]">{responses.length}</p>
          <p className="text-[10px] text-[var(--muted)]">Total</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center">
          <p className="text-2xl font-bold text-[var(--text)]">{responses.filter(r => r.completed).length}</p>
          <p className="text-[10px] text-[var(--muted)]">Completed</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center">
          <p className="text-2xl font-bold text-[var(--text)]">{new Set(responses.map(r => r.respondent_email).filter(Boolean)).size}</p>
          <p className="text-[10px] text-[var(--muted)]">Unique Emails</p>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <Mail className="w-10 h-10 mx-auto mb-3 text-[var(--muted)] opacity-40" />
          <p className="text-[var(--muted)] text-sm">{responses.length === 0 ? 'No responses yet.' : 'No results match your search.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <ResponseRow key={r.id} response={r} questions={survey.questions || []} expanded={expandedId === r.id} onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}