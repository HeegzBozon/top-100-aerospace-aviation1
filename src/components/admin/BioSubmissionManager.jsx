import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2, CheckCircle2, XCircle, Eye, Send, Search,
  Clock, Sparkles, FileText, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  ready: { label: 'Ready for Review', color: 'bg-purple-100 text-purple-700', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

function SubmissionCard({ submission, onUpdate, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editBio, setEditBio] = useState(submission.final_bio || submission.generated_bio || '');
  const [notes, setNotes] = useState(submission.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const { toast } = useToast();

  const statusCfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.submitted;
  const StatusIcon = statusCfg.icon;

  const handleApprove = async () => {
    setSaving(true);
    const bio = editBio.trim();

    // 1. Mark submission as approved
    await base44.entities.BioSubmission.update(submission.id, {
      status: 'approved',
      final_bio: bio,
      admin_notes: notes,
      notified_user: true,
    });

    // 2. Auto-publish to user profile
    const users = await base44.entities.User.filter({ email: submission.user_email });
    if (users[0]) {
      await base44.entities.User.update(users[0].id, { bio });
    }

    // 3. Auto-publish to nominee if linked
    if (submission.nominee_id) {
      await base44.entities.Nominee.update(submission.nominee_id, { bio });
    } else {
      // Try to find nominee by email
      const nominees = await base44.entities.Nominee.filter({ nominee_email: submission.user_email }, '-created_date', 1);
      if (nominees[0]) {
        await base44.entities.Nominee.update(nominees[0].id, { bio });
      }
    }

    // 4. Send notification email
    await base44.integrations.Core.SendEmail({
      to: submission.user_email,
      from_name: 'TOP 100 Aerospace & Aviation',
      subject: '✨ Your Biography is Ready!',
      body: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5a;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h2 style="color:#c9a87c;margin:0;font-size:20px">Your Story is Ready</h2>
          <p style="color:#ffffff99;margin:8px 0 0;font-size:13px">TOP 100 Aerospace & Aviation</p>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px;color:#334155">Hi ${submission.user_name},</p>
          <p style="margin:0 0 16px;color:#334155">Our editorial team has reviewed your story and crafted your biography. It's now live on your profile!</p>
          <div style="background:#faf8f5;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:16px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;font-style:italic">${bio}</p>
          </div>
          <p style="margin:0 0 8px;color:#64748b;font-size:13px">You can view and edit your bio anytime from your profile page.</p>
        </div>
      </div>`,
    });

    toast({ title: 'Bio approved, published & user notified!' });
    setSaving(false);
    onRefresh();
  };

  const handleReject = async () => {
    setSaving(true);
    await base44.entities.BioSubmission.update(submission.id, {
      status: 'rejected',
      admin_notes: notes,
    });
    toast({ title: 'Bio rejected' });
    setSaving(false);
    onRefresh();
  };

  const answers = submission.answers || {};

  return (
    <Card className="overflow-hidden border-slate-200">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-800">{submission.user_name}</span>
            <Badge className={`${statusCfg.color} text-[10px] gap-1`}>
              <StatusIcon className="w-3 h-3" /> {statusCfg.label}
            </Badge>
            {submission.notified_user && (
              <Badge className="bg-green-50 text-green-600 text-[10px]">Notified</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{submission.user_email} · {new Date(submission.created_date).toLocaleDateString()}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Story answers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Story Answers</h4>
            <div className="space-y-2">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{key}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated bio */}
          {submission.generated_bio && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">AI-Generated Bio</h4>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-sm text-slate-700 leading-relaxed italic">{submission.generated_bio}</p>
              </div>
            </div>
          )}

          {/* Editable final bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Final Bio (editable)</h4>
            <Textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="min-h-[120px] text-sm"
              placeholder="Edit the bio before approving..."
            />
          </div>

          {/* Admin notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Admin Notes</h4>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {submission.status !== 'approved' && (
              <Button onClick={handleApprove} disabled={saving || !editBio.trim()} size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve, Publish & Notify
              </Button>
            )}
            {submission.status !== 'rejected' && submission.status !== 'approved' && (
              <Button onClick={handleReject} disabled={saving} size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 rounded-lg">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            )}
            {submission.status === 'approved' && (
              <Badge className="bg-green-50 text-green-700 text-xs gap-1.5 py-1.5 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Published & Notified
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function BioSubmissionManager() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await base44.entities.BioSubmission.list('-created_date', 200);
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => { loadSubmissions(); }, []);

  const filtered = submissions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (s.user_name || '').toLowerCase().includes(q) || (s.user_email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    processing: submissions.filter(s => s.status === 'processing').length,
    ready: submissions.filter(s => s.status === 'ready').length,
    approved: submissions.filter(s => s.status === 'approved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a87c]" /> Bio Submissions
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Review AI-generated biographies from StoryBuilder</p>
        </div>
        <Button onClick={loadSubmissions} size="sm" variant="outline" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { key: 'all', label: 'Total', count: counts.all },
          { key: 'submitted', label: 'Submitted', count: counts.submitted },
          { key: 'processing', label: 'Processing', count: counts.processing },
          { key: 'ready', label: 'Ready', count: counts.ready },
          { key: 'approved', label: 'Approved', count: counts.approved },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`p-3 rounded-xl text-center transition-all border ${filter === s.key ? 'border-[#1e3a5a] bg-[#1e3a5a]/5' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="text-lg font-bold text-slate-800">{s.count}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 text-sm"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No bio submissions found</p>
          </div>
        ) : (
          filtered.map(s => (
            <SubmissionCard key={s.id} submission={s} onRefresh={loadSubmissions} />
          ))
        )}
      </div>
    </div>
  );
}