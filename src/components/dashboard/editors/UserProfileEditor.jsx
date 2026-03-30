import { useState } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Loader2, Save, Upload, ExternalLink, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UserProfileEditor({ user }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      toast({ title: 'Photo uploaded!' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    try {
      await base44.integrations.Core.UploadFile({ file });
      setPdfUploaded(true);
      toast({ title: 'LinkedIn profile uploaded! Our team will process it shortly.' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed. Please try again.' });
    } finally {
      setPdfUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      toast({ title: 'Profile saved!' });
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-5">

      {/* ── Hero identity row ── */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                {initials}
              </div>
            )}
          </div>
          <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full border border-slate-200 shadow flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-slate-500" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>

        {/* Name + email inline */}
        <div className="flex-1 grid grid-cols-1 gap-2 min-w-0">
          <div>
            <Label htmlFor="full_name" className="text-xs text-slate-400 font-medium uppercase tracking-wide">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your full name"
              className="mt-0.5 h-9 text-sm bg-white"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs text-slate-400 font-medium uppercase tracking-wide">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              className="mt-0.5 h-9 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── LinkedIn PDF import ── */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0077b5]/5 border-b border-[#0077b5]/10">
          <div className="flex items-center gap-2">
            {/* LinkedIn "in" logo */}
            <div className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center text-white text-[11px] font-black leading-none">in</div>
            <span className="text-sm font-semibold text-slate-700">Import from LinkedIn</span>
          </div>
          <a
            href="https://www.linkedin.com/in/me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0077b5] hover:underline flex items-center gap-1"
          >
            Open LinkedIn <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Steps + upload in one compact row */}
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Steps */}
          <ol className="flex-1 space-y-1 text-xs text-slate-500">
            {[
              'Go to your LinkedIn profile',
              'Click "More" → "Save to PDF"',
              'Upload the PDF here',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          {/* Upload CTA */}
          <label className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-medium ${
            pdfUploaded
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-[#0077b5]/30 bg-[#0077b5]/5 text-[#0077b5] hover:bg-[#0077b5]/10'
          }`}>
            {pdfUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
            ) : pdfUploaded ? (
              <><CheckCircle2 className="w-4 h-4" /> Uploaded!</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload PDF</>
            )}
            <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={pdfUploading} />
          </label>
        </div>
      </div>

      {/* ── Save ── */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}