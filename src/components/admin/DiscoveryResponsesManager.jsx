import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Download, Search, Eye, StickyNote, Loader2, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  reviewed: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f1f35] border-[#2a4f7c]/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#e8d4b8]">
            {response.submitter_name || response.submitter_email || 'Anonymous'} — Submission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-white/50">
            Submitted: {new Date(response.created_date).toLocaleString()}
            {response.submitter_email && ` · ${response.submitter_email}`}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-white/70 whitespace-nowrap">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 bg-[#1e3a5a]/60 border-[#2a4f7c]/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e3a5a] border-[#2a4f7c]/50">
              {['new', 'reviewed', 'in_progress', 'completed'].map(s => (
                <SelectItem key={s} value={s} className="text-white capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responses */}
        <div className="space-y-3 mb-5">
          {entries.map(([key, value]) => (
            <div key={key} className="p-3 bg-[#1e3a5a]/40 rounded-lg border border-[#2a4f7c]/30">
              <p className="text-[10px] font-bold text-[#c9a87c] uppercase tracking-wider mb-1">
                {QUESTION_LABELS[key] ?? key}
              </p>
              <p className="text-sm text-white/80 whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </div>

        {/* Admin notes */}
        <div className="mb-4">
          <label className="text-sm text-white/70 mb-1 block">Admin Notes</label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes..."
            className="bg-[#1e3a5a]/60 border-[#2a4f7c]/50 text-white placeholder:text-white/30 min-h-[80px]"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="border-[#2a4f7c]/50 text-white/70">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#c9a87c] text-[#0f1f35] hover:bg-[#e8d4b8] font-semibold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, answer…"
              className="pl-9 bg-[#1e3a5a]/40 border-[#2a4f7c]/50 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-[#1e3a5a]/40 border-[#2a4f7c]/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e3a5a] border-[#2a4f7c]/50">
              <SelectItem value="all" className="text-white">All statuses</SelectItem>
              {['new', 'reviewed', 'in_progress', 'completed'].map(s => (
                <SelectItem key={s} value={s} className="text-white capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="border-[#2a4f7c]/50 text-white/70"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="bg-[#c9a87c] text-[#0f1f35] hover:bg-[#e8d4b8] font-semibold gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-white/40">
        {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
        {statusFilter !== 'all' ? ` · filtered by "${statusFilter}"` : ''}
      </p>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#c9a87c]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40 text-sm">No submissions found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const filledCount = Object.values(r.responses ?? {}).filter(v => v && String(v).trim()).length;
            const preview = Object.entries(r.responses ?? {}).find(([, v]) => v && String(v).trim());
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#1e3a5a]/30 border border-[#2a4f7c]/30 hover:border-[#c9a87c]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm truncate">
                      {r.submitter_name || r.submitter_email || 'Anonymous'}
                    </span>
                    {r.submitter_name && r.submitter_email && (
                      <span className="text-xs text-white/40 truncate">{r.submitter_email}</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[r.status] ?? STATUS_COLORS.new}`}>
                      {r.status?.replace('_', ' ') ?? 'new'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">
                    {new Date(r.created_date).toLocaleString()} · {filledCount} answers
                    {preview ? ` · "${String(preview[1]).substring(0, 60)}…"` : ''}
                  </p>
                  {r.admin_notes && (
                    <p className="text-xs text-[#c9a87c]/60 mt-1 flex items-center gap-1">
                      <StickyNote className="w-3 h-3" /> {r.admin_notes.substring(0, 80)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(r)}
                  className="border-[#2a4f7c]/50 text-white/70 hover:text-white gap-1.5 shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </Button>
              </div>
            );
          })}
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