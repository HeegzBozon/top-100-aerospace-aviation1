import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Download, Search, Eye, StickyNote, Loader2, RefreshCw,
  FileText, Users, CheckCircle2, Clock, ArrowUpRight, Mail, Calendar, MessageSquare
} from 'lucide-react';

const STATUS_CONFIG = {
  new:         { label: 'New',         color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',      dot: 'bg-sky-400' },
  reviewed:    { label: 'Reviewed',    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  in_progress: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', dot: 'bg-violet-400' },
  completed:   { label: 'Completed',   color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
};

const QUESTION_LABELS = {
  q1: 'Business name & tagline', q2: 'Brand in three words', q3: 'Feeling on landing',
  q4: 'Existing brand guidelines', q5: 'Brand aesthetic inspiration', q6: 'Ideal client',
  q7: 'Problem they solve', q8: 'Client you don\'t want', q9: 'Best work source',
  q10: 'Core services', q11: 'Project size / price range', q12: 'Differentiation',
  q13: 'One thing every visitor should know', q14: 'Competitors you respect',
  q15: 'Websites you love', q16: 'Better than competitors at', q17: 'Primary CTA',
  q18: 'Pages needed', q19: 'Features wanted', q20: 'Keep or leave behind',
  q21: 'Google search query', q22: 'City / region served', q23: 'Target neighborhoods',
  q24: 'Google Business Profile', q25: 'Active social platforms', q26: 'What\'s working socially',
  q27: 'Social media challenges', q28: 'Social links on site', q29: 'Logo files',
  q30: 'Professional photos', q31: 'Written content', q32: 'Anything else',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-white/40 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Status Pill ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Response Row ─────────────────────────────────────────────────────────────
function ResponseRow({ response, onReview }) {
  const filledCount = Object.values(response.responses ?? {}).filter(v => v && String(v).trim()).length;
  const preview = Object.entries(response.responses ?? {}).find(([, v]) => v && String(v).trim());
  const initials = (response.submitter_name || response.submitter_email || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a87c]/30 to-[#4a90b8]/30 border border-white/10 flex items-center justify-center shrink-0 text-sm font-bold text-white/80">
        {initials}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-white text-sm">
            {response.submitter_name || response.submitter_email || 'Anonymous'}
          </span>
          {response.submitter_name && response.submitter_email && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {response.submitter_email}
            </span>
          )}
          <StatusPill status={response.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(response.created_date).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {filledCount} answer{filledCount !== 1 ? 's' : ''}
          </span>
          {preview && (
            <span className="truncate max-w-xs italic text-white/20">
              "{String(preview[1]).substring(0, 60)}…"
            </span>
          )}
        </div>
        {response.admin_notes && (
          <p className="text-xs text-[#c9a87c]/60 mt-1.5 flex items-center gap-1 truncate">
            <StickyNote className="w-3 h-3 shrink-0" />
            {response.admin_notes.substring(0, 80)}
          </p>
        )}
      </div>

      {/* Action */}
      <Button
        size="sm"
        onClick={() => onReview(response)}
        className="shrink-0 gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
        variant="ghost"
      >
        <Eye className="w-3.5 h-3.5" />
        Review
        <ArrowUpRight className="w-3 h-3 opacity-50" />
      </Button>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ResponseDetailModal({ response, onClose, onSave }) {
  const [notes, setNotes] = useState(response?.admin_notes ?? '');
  const [status, setStatus] = useState(response?.status ?? 'new');
  const [saving, setSaving] = useState(false);

  if (!response) return null;

  const entries = Object.entries(response.responses ?? {}).filter(
    ([, v]) => v && typeof v === 'string' && v.trim()
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.DiscoveryResponse.update(response.id, { admin_notes: notes, status });
      onSave({ ...response, admin_notes: notes, status });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d1c2e] border border-white/10 text-white rounded-2xl">
        <DialogHeader className="pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a87c]/30 to-[#4a90b8]/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white/80">
              {(response.submitter_name || response.submitter_email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-[#e8d4b8] font-semibold">
                {response.submitter_name || response.submitter_email || 'Anonymous'}
              </DialogTitle>
              {response.submitter_email && (
                <p className="text-xs text-white/40 mt-0.5">{response.submitter_email}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Meta */}
        <div className="flex items-center gap-4 py-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(response.created_date).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {entries.length} answers
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm text-white/50 whitespace-nowrap">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 bg-white/[0.06] border-white/10 text-white rounded-xl h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1c2e] border-white/10 rounded-xl">
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <SelectItem key={val} value={val} className="text-white rounded-lg">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responses */}
        <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <p className="text-sm text-white/30 italic text-center py-6">No answers submitted yet.</p>
          ) : entries.map(([key, value]) => (
            <div key={key} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-[10px] font-bold text-[#c9a87c] uppercase tracking-widest mb-1.5">
                {QUESTION_LABELS[key] ?? key}
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </div>

        {/* Admin notes */}
        <div className="mb-5">
          <label className="text-sm text-white/50 mb-2 flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            Admin Notes
          </label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes..."
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 rounded-xl min-h-[80px] focus:border-[#c9a87c]/40 focus:ring-0"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
          <Button variant="ghost" onClick={onClose} className="text-white/50 hover:text-white rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#c9a87c] to-[#d4a090] text-[#0f1f35] hover:brightness-110 font-bold rounded-xl gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiscoveryResponsesManager() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.DiscoveryResponse.list('-created_date', 200);
      setResponses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return responses.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.submitter_email?.toLowerCase().includes(q) ||
        r.submitter_name?.toLowerCase().includes(q) ||
        Object.values(r.responses ?? {}).some(v => String(v).toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [responses, search, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: responses.length,
    newCount: responses.filter(r => r.status === 'new').length,
    completed: responses.filter(r => r.status === 'completed').length,
    withAnswers: responses.filter(r =>
      Object.values(r.responses ?? {}).some(v => v && String(v).trim())
    ).length,
  }), [responses]);

  const handleExportCSV = () => {
    const allKeys = [...new Set(filtered.flatMap(r => Object.keys(r.responses ?? {})))].sort();
    const headers = ['Submitted', 'Email', 'Name', 'Status', ...allKeys.map(k => QUESTION_LABELS[k] ?? k)];
    const rows = filtered.map(r => [
      new Date(r.created_date).toLocaleString(),
      r.submitter_email ?? '',
      r.submitter_name ?? '',
      r.status ?? '',
      ...allKeys.map(k => `"${String(r.responses?.[k] ?? '').replace(/"/g, '""')}"`)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `discovery-responses-${Date.now()}.csv`;
    a.click();
  };

  const handleSaved = (updated) => {
    setResponses(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#c9a87c]" />
            Discovery Responses
          </h2>
          <p className="text-sm text-white/40 mt-1">Client questionnaire submissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={load}
            disabled={loading}
            className="rounded-xl w-9 h-9 border border-white/10 text-white/50 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="bg-[#c9a87c] hover:bg-[#e8d4b8] text-[#0f1f35] font-bold rounded-xl gap-2 px-4"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Submissions" value={stats.total} icon={FileText} color="bg-sky-500/20 text-sky-300" />
        <StatCard label="New / Unread" value={stats.newCount} icon={Clock} color="bg-amber-500/20 text-amber-300" />
        <StatCard label="With Answers" value={stats.withAnswers} icon={Users} color="bg-violet-500/20 text-violet-300" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-500/20 text-emerald-300" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, answer…"
            className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-9 focus:border-[#c9a87c]/40 focus:ring-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/[0.04] border-white/10 text-white rounded-xl h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0d1c2e] border-white/10 rounded-xl">
            <SelectItem value="all" className="text-white rounded-lg">All statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val} className="text-white rounded-lg">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-xs text-white/30">
        Showing {filtered.length} of {responses.length} submission{responses.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#c9a87c]" />
            <p className="text-sm text-white/30">Loading submissions…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <ResponseRow key={r.id} response={r} onReview={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <ResponseDetailModal
          response={selected}
          onClose={() => setSelected(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}