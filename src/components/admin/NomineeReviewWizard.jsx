import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Loader2, FileText, CheckCircle, Eye, Edit, Save, User, Globe, ExternalLink, Award } from 'lucide-react';

// Triage-only review surface: overview, edit, preview. All status changes route
// through the pool resolver (approve) or direct status transitions (activate/reject).
export default function NomineeReviewWizard({ nominee, onApprove, onClose, onSuccess }) {
  const [current, setCurrent] = useState(nominee);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => { setCurrent(nominee); setHasUnsavedChanges(false); }, [nominee]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'edit', label: 'Profile Editor', icon: Edit },
    { id: 'preview', label: 'Preview', icon: FileText },
  ];

  const handleFieldUpdate = (field, value) => { setCurrent(p => ({ ...p, [field]: value })); setHasUnsavedChanges(true); };

  const handleSave = async (andClose = true) => {
    setIsProcessing(true);
    try {
      await base44.entities.Nominee.update(current.id, {
        name: current.name, title: current.title, company: current.company, bio: current.bio,
        description: current.description, professional_role: current.professional_role,
        six_word_story: current.six_word_story, linkedin_profile_url: current.linkedin_profile_url,
        linkedin_follow_reason: current.linkedin_follow_reason, linkedin_proudest_achievement: current.linkedin_proudest_achievement,
        website_url: current.website_url, country: current.country, industry: current.industry, status: current.status,
      });
      setHasUnsavedChanges(false);
      toast({ title: "Profile Saved", description: "Nominee profile has been successfully updated." });
      onSuccess?.();
      if (andClose) onClose();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the profile. Please try again.' });
    } finally { setIsProcessing(false); }
  };

  const handleQuickAction = async (action) => {
    setIsProcessing(true);
    try {
      if (action === 'approve') {
        const res = await onApprove?.(current);
        if (!res) return; // aborted or conflict-cancelled
        setCurrent(prev => ({ ...prev, status: 'approved' }));
        toast({ title: 'Nominee Approved', description: `${current.name} approved to the pool.` });
      } else {
        const newStatus = action === 'activate' ? 'active' : 'rejected';
        await base44.entities.Nominee.update(current.id, { status: newStatus });
        setCurrent(prev => ({ ...prev, status: newStatus }));
        toast({ title: `Nominee ${action}d` });
      }
      onSuccess?.();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
    } finally { setIsProcessing(false); }
  };

  const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    active: 'bg-[var(--brand-navy)]/10 text-[var(--brand-navy)] border-[var(--brand-navy-20)]',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    winner: 'bg-amber-100 text-amber-800 border-amber-300',
    finalist: 'bg-sky-100 text-sky-800 border-sky-200',
  };

  const renderOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Nominee Overview</CardTitle>
        <CardDescription>Current profile status and basic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">Name</label><p className="text-lg font-semibold">{current.name || 'Not provided'}</p></div>
          <div><label className="text-sm font-medium text-gray-700">Status</label><Badge className={STATUS_COLORS[current.status] || 'bg-gray-100'}>{current.status || 'pending'}</Badge></div>
          <div><label className="text-sm font-medium text-gray-700">Title</label><p>{current.title || 'Not provided'}</p></div>
          <div><label className="text-sm font-medium text-gray-700">Company</label><p>{current.company || 'Not provided'}</p></div>
        </div>
        <div><label className="text-sm font-medium text-gray-700">Description</label><p className="text-sm text-gray-600 mt-1">{current.description || 'No description provided'}</p></div>
        <div><label className="text-sm font-medium text-gray-700">Bio</label><p className="text-sm text-gray-600 mt-1">{current.bio ? current.bio.substring(0, 200) + '…' : 'No bio provided'}</p></div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center"><div className="text-2xl font-bold" style={{ color: current.bio ? 'var(--brand-navy)' : 'var(--brand-navy-20)' }}>{current.bio ? '✓' : '✗'}</div><div className="text-sm text-gray-500">Bio</div></div>
          <div className="text-center"><div className="text-2xl font-bold" style={{ color: current.six_word_story ? 'var(--brand-navy)' : 'var(--brand-navy-20)' }}>{current.six_word_story ? '✓' : '✗'}</div><div className="text-sm text-gray-500">Six-Word Story</div></div>
          <div className="text-center"><div className="text-2xl font-bold" style={{ color: current.linkedin_profile_url ? 'var(--brand-navy)' : 'var(--brand-navy-20)' }}>{current.linkedin_profile_url ? '✓' : '✗'}</div><div className="text-sm text-gray-500">LinkedIn</div></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEdit = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700">Name *</label><Input value={current.name || ''} onChange={e => handleFieldUpdate('name', e.target.value)} className="h-9" /></div>
            <div><label className="text-xs font-medium text-gray-700">Email</label><Input value={current.nominee_email || ''} onChange={e => handleFieldUpdate('nominee_email', e.target.value)} className="h-9" type="email" /></div>
            <div><label className="text-xs font-medium text-gray-700">Title</label><Input value={current.title || ''} onChange={e => handleFieldUpdate('title', e.target.value)} className="h-9" /></div>
            <div><label className="text-xs font-medium text-gray-700">Company</label><Input value={current.company || ''} onChange={e => handleFieldUpdate('company', e.target.value)} className="h-9" /></div>
            <div><label className="text-xs font-medium text-gray-700">Country</label><Input value={current.country || ''} onChange={e => handleFieldUpdate('country', e.target.value)} className="h-9" /></div>
            <div><label className="text-xs font-medium text-gray-700">Industry</label><Input value={current.industry || ''} onChange={e => handleFieldUpdate('industry', e.target.value)} className="h-9" /></div>
            <div className="col-span-2"><label className="text-xs font-medium text-gray-700">Status</label>
              <Select value={current.status} onValueChange={v => handleFieldUpdate('status', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{['pending','approved','active','rejected','finalist','winner'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Profile Content</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-xs font-medium text-gray-700">Who I Am (Description)</label><Textarea value={current.description || ''} onChange={e => handleFieldUpdate('description', e.target.value)} rows={2} /></div>
          <div><label className="text-xs font-medium text-gray-700">Professional Role</label><Textarea value={current.professional_role || ''} onChange={e => handleFieldUpdate('professional_role', e.target.value)} rows={2} /></div>
          <div><label className="text-xs font-medium text-gray-700">Professional Bio</label><Textarea value={current.bio || ''} onChange={e => handleFieldUpdate('bio', e.target.value)} rows={4} /></div>
          <div><label className="text-xs font-medium text-gray-700">Six-Word Story</label><Input value={current.six_word_story || ''} onChange={e => handleFieldUpdate('six_word_story', e.target.value)} className="h-9" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="py-3"><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> LinkedIn & Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-gray-700">LinkedIn URL</label><Input value={current.linkedin_profile_url || ''} onChange={e => handleFieldUpdate('linkedin_profile_url', e.target.value)} className="h-9" /></div>
            <div><label className="text-xs font-medium text-gray-700">Website URL</label><Input value={current.website_url || ''} onChange={e => handleFieldUpdate('website_url', e.target.value)} className="h-9" /></div>
          </div>
          <div><label className="text-xs font-medium text-gray-700">Why Follow Me on LinkedIn</label><Textarea value={current.linkedin_follow_reason || ''} onChange={e => handleFieldUpdate('linkedin_follow_reason', e.target.value)} rows={2} /></div>
          <div><label className="text-xs font-medium text-gray-700">Proudest Achievement</label><Textarea value={current.linkedin_proudest_achievement || ''} onChange={e => handleFieldUpdate('linkedin_proudest_achievement', e.target.value)} rows={2} /></div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreview = () => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Profile Preview</CardTitle><CardDescription>How this nominee's profile appears to the community</CardDescription></CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-[var(--brand-navy-18)] p-6">
            <div className="flex items-center gap-4 mb-4">
              {current.avatar_url ? <img src={current.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-[var(--brand-gold)]" style={{ background: 'var(--brand-navy)' }}>{(current.name || '?').charAt(0)}</div>}
              <div><h3 className="font-bold text-lg text-[var(--brand-navy)]">{current.name || 'No Name'}</h3><p className="text-gray-600 text-sm">{current.title || 'No Title'}</p><p className="text-gray-500 text-xs">{current.company || 'No Company'}</p></div>
            </div>
            {current.six_word_story && <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--brand-cream)' }}><p className="text-sm font-medium text-center italic">"{current.six_word_story}"</p></div>}
            {current.description && <p className="text-sm text-gray-700 mb-4">{current.description}</p>}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">{current.country || 'Unknown Location'}</Badge>
              {current.industry && <Badge variant="outline" className="text-xs">{current.industry}</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                {current.avatar_url || current.photo_url ? <img src={current.avatar_url || current.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--brand-navy)' }}>{(current.name || '?').charAt(0)}</div>}
                {current.name || 'Unnamed Nominee'}
                <Badge className={`${STATUS_COLORS[current.status] || ''} text-xs ml-2`}>{current.status}</Badge>
                {hasUnsavedChanges && <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">Unsaved</Badge>}
              </DialogTitle>
              <p className="text-sm text-gray-500">{current.title}{current.company ? ` at ${current.company}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {current.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction('approve')} disabled={isProcessing} className="border-emerald-300 text-emerald-700"><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => handleQuickAction('reject')} disabled={isProcessing} className="border-rose-300 text-rose-700"><X className="w-4 h-4 mr-1" /> Reject</Button>
              </>
            )}
            {current.status === 'approved' && <Button size="sm" variant="outline" onClick={() => handleQuickAction('activate')} disabled={isProcessing} className="border-[var(--brand-navy-20)] text-[var(--brand-navy)]"><Award className="w-4 h-4 mr-1" /> Activate</Button>}
            {current.linkedin_profile_url && <a href={current.linkedin_profile_url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button></a>}
          </div>
        </DialogHeader>

        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => { const Icon = tab.icon; return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-[var(--brand-navy)] text-[var(--brand-navy)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            ); })}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'edit' && renderEdit()}
          {activeTab === 'preview' && renderPreview()}
        </div>

        <div className="border-t p-4 flex justify-between items-center bg-[var(--brand-cream)]">
          <span className="text-xs text-gray-500">Updated {current.updated_date ? new Date(current.updated_date).toLocaleDateString() : 'never'}{current.aura_score > 0 ? ` · Aura ${current.aura_score?.toFixed(0)}` : ''}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>{hasUnsavedChanges ? 'Discard' : 'Close'}</Button>
            {hasUnsavedChanges && <Button size="sm" onClick={() => handleSave(false)} disabled={isProcessing} variant="outline">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save</Button>}
            <Button size="sm" onClick={() => handleSave(true)} disabled={isProcessing} className="bg-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/90 text-[var(--brand-navy)]">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save & Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}