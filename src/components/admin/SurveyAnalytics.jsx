import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock, CheckCircle2, BarChart3, Loader2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1e3a5a', '#c9a87c', '#4a90b8', '#7ecda0', '#e88d67', '#a78bfa', '#f472b6', '#34d399'];

function StatCard({ icon: Icon, label, value, sub, color = '#1e3a5a' }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
          <p className="text-[11px] text-[var(--muted)]">{label}</p>
        </div>
      </div>
      {sub && <p className="text-[10px] text-[var(--muted)] mt-2">{sub}</p>}
    </div>
  );
}

function ChoiceBreakdown({ question, responses, index }) {
  const data = useMemo(() => {
    const counts = {};
    (question.options || []).forEach(opt => { counts[opt] = 0; });
    responses.forEach(r => {
      const answer = r.answers?.[question.id];
      if (Array.isArray(answer)) {
        answer.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
      } else if (answer) {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => {
      // Truncate long labels for chart
      const short = name.length > 40 ? name.slice(0, 37) + '...' : name;
      return { name: short, fullName: name, value };
    });
  }, [question, responses]);

  const total = responses.filter(r => r.answers?.[question.id] !== undefined).length;

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xs font-bold text-[#c9a87c] bg-[#c9a87c]/10 px-2 py-0.5 rounded-full mt-0.5">Q{index + 1}</span>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{question.label}</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">{total} responses · {question.type.replace('_', ' ')}</p>
        </div>
      </div>
      {data.length > 0 && total > 0 ? (
        <div className="space-y-2">
          {data.map((d, i) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text)] truncate flex-1 mr-2" title={d.fullName}>{d.fullName}</span>
                  <span className="text-[var(--muted)] shrink-0">{d.value} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--border)]/40 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)] italic">No responses yet</p>
      )}
    </div>
  );
}

function RatingBreakdown({ question, responses, index }) {
  const isNps = question.type === 'nps';
  const range = isNps ? [0,1,2,3,4,5,6,7,8,9,10] : [1,2,3,4,5];

  const data = useMemo(() => {
    const counts = {};
    range.forEach(n => { counts[n] = 0; });
    responses.forEach(r => {
      const answer = r.answers?.[question.id];
      if (answer !== undefined && answer !== null) counts[answer] = (counts[answer] || 0) + 1;
    });
    return range.map(n => ({ name: String(n), value: counts[n] || 0 }));
  }, [question, responses]);

  const answered = responses.filter(r => r.answers?.[question.id] !== undefined && r.answers?.[question.id] !== null);
  const avg = answered.length > 0 ? (answered.reduce((s, r) => s + (r.answers[question.id] || 0), 0) / answered.length).toFixed(1) : '—';

  // NPS calculation
  let npsScore = null;
  if (isNps && answered.length > 0) {
    const promoters = answered.filter(r => r.answers[question.id] >= 9).length;
    const detractors = answered.filter(r => r.answers[question.id] <= 6).length;
    npsScore = Math.round(((promoters - detractors) / answered.length) * 100);
  }

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xs font-bold text-[#c9a87c] bg-[#c9a87c]/10 px-2 py-0.5 rounded-full mt-0.5">Q{index + 1}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text)]">{question.label}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-[var(--muted)]">{answered.length} responses</p>
            <Badge variant="outline" className="text-[10px]">Avg: {avg}</Badge>
            {npsScore !== null && (
              <Badge className={`text-[10px] ${npsScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                NPS: {npsScore > 0 ? '+' : ''}{npsScore}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {answered.length > 0 ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={isNps ? (i <= 6 ? '#e88d67' : i <= 8 ? '#c9a87c' : '#7ecda0') : COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)] italic">No responses yet</p>
      )}
    </div>
  );
}

function TextResponses({ question, responses, index }) {
  const answers = responses.map(r => r.answers?.[question.id]).filter(Boolean);

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xs font-bold text-[#c9a87c] bg-[#c9a87c]/10 px-2 py-0.5 rounded-full mt-0.5">Q{index + 1}</span>
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{question.label}</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">{answers.length} responses · {question.type}</p>
        </div>
      </div>
      {answers.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {answers.map((a, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-[var(--border)]/20 text-xs text-[var(--text)]">{a}</div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)] italic">No responses yet</p>
      )}
    </div>
  );
}

function ResponseTimeline({ responses }) {
  const data = useMemo(() => {
    if (responses.length === 0) return [];
    const byDay = {};
    responses.forEach(r => {
      const day = new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay).map(([name, value]) => ({ name, value }));
  }, [responses]);

  if (data.length === 0) return null;

  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <h4 className="text-sm font-semibold text-[var(--text)] mb-4">Responses Over Time</h4>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }} />
            <Bar dataKey="value" fill="#1e3a5a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SurveyAnalytics({ survey, onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, [survey.id]);

  const loadResponses = async () => {
    setLoading(true);
    const data = await base44.entities.SurveyResponse.filter({ survey_id: survey.id }, '-created_date', 500);
    setResponses(data);
    setLoading(false);
  };

  const completionRate = responses.length > 0
    ? Math.round((responses.filter(r => r.completed).length / responses.length) * 100)
    : 0;

  const avgCompletionTime = useMemo(() => {
    // Estimate from created_date spread — first vs last question fill isn't tracked, so we show "since first response"
    if (responses.length < 2) return '—';
    const dates = responses.map(r => new Date(r.created_date).getTime()).sort();
    const spanDays = Math.round((dates[dates.length - 1] - dates[0]) / 86400000);
    if (spanDays === 0) return 'Same day';
    return `${spanDays}d collection span`;
  }, [responses]);

  const handleExportCsv = () => {
    if (responses.length === 0) return;
    const questions = survey.questions || [];
    const headers = ['Name', 'Email', 'Date', ...questions.map((q, i) => `Q${i + 1}: ${q.label}`)];
    const rows = responses.map(r => {
      return [
        r.respondent_name || '',
        r.respondent_email,
        new Date(r.created_date).toLocaleDateString(),
        ...questions.map(q => {
          const a = r.answers?.[q.id];
          if (Array.isArray(a)) return a.join('; ');
          return a ?? '';
        }),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a87c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Surveys
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#c9a87c]" />
            <h2 className="text-xl font-bold text-[var(--text)]">Analytics</h2>
          </div>
          <p className="text-sm text-[var(--muted)]">{survey.title}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={responses.length === 0} className="gap-2 cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Responses" value={responses.length} color="#1e3a5a" />
        <StatCard icon={CheckCircle2} label="Completion Rate" value={`${completionRate}%`} color="#7ecda0" />
        <StatCard icon={Clock} label="Collection Span" value={avgCompletionTime} color="#c9a87c" />
        <StatCard icon={BarChart3} label="Questions" value={survey.questions?.length || 0} color="#4a90b8" />
      </div>

      {/* Timeline */}
      <ResponseTimeline responses={responses} />

      {/* Per-Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">Question Breakdown</h3>
        {(survey.questions || []).map((q, i) => {
          if (q.type === 'single_choice' || q.type === 'multiple_choice') {
            return <ChoiceBreakdown key={q.id} question={q} responses={responses} index={i} />;
          }
          if (q.type === 'rating' || q.type === 'nps') {
            return <RatingBreakdown key={q.id} question={q} responses={responses} index={i} />;
          }
          return <TextResponses key={q.id} question={q} responses={responses} index={i} />;
        })}
      </div>

      {responses.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-[var(--muted)] opacity-40" />
          <p className="text-[var(--muted)] text-sm">No responses yet. Share the survey to start collecting data.</p>
        </div>
      )}
    </div>
  );
}