import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Download, Search, Eye, StickyNote, Loader2, RefreshCw,
  FileText, Users, CheckCircle2, Clock, Mail, Calendar, MessageSquare, ChevronRight
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:         { label: 'New',         classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',      dot: 'bg-blue-500' },
  reviewed:    { label: 'Reviewed',    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', classes: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200', dot: 'bg-purple-500' },
  completed:   { label: 'Completed',   classes: 'bg-green-50 text-green-700 ring-1 ring-green-200',   dot: 'bg-green-500' },
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
function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, email }) {
  const initials = (name || email || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600 select-none"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ─── Response Row ─────────────────────────────────────────────────────────────
function ResponseRow({ response, onReview }) {
  const filledCount = Object.values(response.responses ?? {}).filter(v => v && String(v).trim()).length;
  const preview = Object.entries(response.responses ?? {}).find(([, v]) => v && String(v).trim());
  const displayName = response.submitter_name || response.submitter_email || 'Anonymous';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150 p-4 flex items-center gap-3">
      <Avatar name={response.submitter_name} email={response.submitter_email} />

      <div className="flex-1 min-w-0">
        {/* Name + status */}
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-slate-900 text-sm">{displayName}</span>
          <StatusBadge status={response.status} />
        </div>

        {/* Email + date + count */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          {response.submitter_name && response.submitter_email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" aria-hidden="true" />
              {response.submitter_email}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            {new Date(response.created_date).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" aria-hidden="true" />
            {filledCount} answer{filledCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Preview answer */}
        {preview && (
          <p className="text-xs text-slate-400 italic mt-1 truncate max-w-md">
            "{String(preview[1]).substring(0, 80)}…"
          </p>
        )}

        {/* Admin note */}
        {response.admin_notes && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 truncate max-w-md">
            <StickyNote className="w-3 h-3 shrink-0" aria-hidden="true" />
            {response.admin_notes.substring(0, 80)}
          </p>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onReview(response)}
        aria-label={`Review submission from ${displayName}`}
        className="shrink-0 gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium text-xs"
      >
        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
        Review
        <ChevronRight className="w-3 h-3 opacity-40" aria-hidden="true" />
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl">
        {/* Header */}
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name={response.submitter_name} email={response.submitter_email} />
            <div>
              <DialogTitle className="text-slate-900 font-semibold text-base">
                {response.submitter_name || response.submitter_email || 'Anonymous'}
              </DialogTitle>
              {response.submitter_email && (
                <p className="text-xs text-slate-500 mt-0.5">{response.submitter_email}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Meta row */}
        <div className="flex items-center gap-4 py-3 text-xs text-slate-400 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden="true" />
            {new Date(response.created_date).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" aria-hidden="true" />
            {entries.length} answer{entries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Status picker */}
        <div className="flex items-center gap-3 py-3">
          <Label htmlFor="modal-status" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="modal-status" className="w-44 rounded-xl border-slate-200 text-slate-800 bg-white h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 bg-white shadow-lg">
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <SelectItem key={val} value={val} className="text-slate-800 rounded-lg text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Answers */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No answers submitted yet.</div>
          ) : entries.map(([key, value]) => (
            <div key={key} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {QUESTION_LABELS[key] ?? key}
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </div>

        {/* Admin notes */}
        <div className="mt-4">
          <Label htmlFor="admin-notes" className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
            <StickyNote className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            Admin Notes
          </Label>
          <Textarea
            id="admin-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes about this submission…"
            className="border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl min-h-[80px] bg-white focus-visible:ring-slate-400 text-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-semibold gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  const filtered = useMemo(() => responses.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.submitter_email?.toLowerCase().includes(q)
      || r.submitter_name?.toLowerCase().includes(q)
      || Object.values(r.responses ?? {}).some(v => String(v).toLowerCase().includes(q));
    return matchStatus && matchSearch;
  }), [responses, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      responses.length,
    newCount:   responses.filter(r => r.status === 'new' || !r.status).length,
    completed:  responses.filter(r => r.status === 'completed').length,
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

  const handleSaved = updated => setResponses(prev => prev.map(r => r.id === updated.id ? updated : r));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-500" aria-hidden="true" />
            Discovery Responses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Client questionnaire submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={load}
            disabled={loading}
            aria-label="Refresh submissions"
            className="w-9 h-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-semibold gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="region" aria-label="Submission statistics">
        <StatCard label="Total Submissions"  value={stats.total}       icon={FileText}     iconClass="bg-slate-100 text-slate-600" />
        <StatCard label="New / Unread"        value={stats.newCount}    icon={Clock}        iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="With Answers"        value={stats.withAnswers} icon={Users}        iconClass="bg-purple-50 text-purple-600" />
        <StatCard label="Completed"           value={stats.completed}   icon={CheckCircle2} iconClass="bg-green-50 text-green-600" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or answer…"
            aria-label="Search submissions"
            className="pl-9 rounded-xl border-slate-200 text-slate-900 placeholder:text-slate-400 bg-white h-9 text-sm focus-visible:ring-slate-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-44 rounded-xl border-slate-200 text-slate-800 bg-white h-9 text-sm"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 bg-white shadow-lg">
            <SelectItem value="all" className="text-slate-800 rounded-lg text-sm">All statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <SelectItem key={val} value={val} className="text-slate-800 rounded-lg text-sm">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                  {cfg.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-400" aria-live="polite">
        Showing {filtered.length} of {responses.length} submission{responses.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Loading submissions">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" aria-hidden="true" />
            <p className="text-sm text-slate-400">Loading submissions…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-500">No submissions found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Submission list">
          {filtered.map(r => (
            <li key={r.id}>
              <ResponseRow response={r} onReview={setSelected} />
            </li>
          ))}
        </ul>
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