import { useState } from 'react';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Loader2, Save, AlertTriangle, ExternalLink, Linkedin, Globe, Instagram, Youtube, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

const brand = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  cream: '#faf8f5',
};

// Threads icon (no lucide equivalent)
function ThreadsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.035l13.422 9.215c5.83-8.715 14.91-10.566 21.697-10.566h.233c8.378.052 14.697 2.481 18.784 7.22 2.984 3.49 4.988 8.318 5.988 14.434a100.448 100.448 0 0 0-17.407-1.13c-19.675 0-35.458 10.855-35.458 30.501 0 18.97 14.756 30.399 33.918 30.399 16.642 0 30.686-7.417 39.144-20.885 6.148-9.74 9.723-22.363 9.723-37.556v-.61c-.002-.054-.002-.109-.002-.164s0-.11.002-.164v-.61c0 0 .004-5.284.004-5.284l-.613-.042Zm-22.653 38.915c-5.792 8.503-15.245 13.565-25.744 13.565-10.014 0-16.737-4.73-16.737-12.587 0-8.65 7.92-13.436 20.907-13.436 5.848 0 11.504.769 16.756 2.27-.976 4.16-2.634 7.574-5.182 10.188Z"/>
    </svg>
  );
}

const SOCIAL_FIELDS = [
  { key: 'linkedin_profile_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
  { key: 'instagram_url', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { key: 'threads_url', label: 'Threads', icon: ThreadsIcon, placeholder: 'https://threads.net/@...' },
  { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/...' },
  { key: 'website_url', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
];

export default function NomineeProfileEditor({ user, nominee, onUpdate }) {
  const [formData, setFormData] = useState({
    name: nominee?.name || '',
    bio: nominee?.bio || '',
    six_word_story: nominee?.six_word_story || '',
    avatar_url: nominee?.avatar_url || '',
    linkedin_profile_url: nominee?.linkedin_profile_url || '',
    instagram_url: nominee?.instagram_url || '',
    threads_url: nominee?.threads_url || '',
    youtube_url: nominee?.youtube_url || '',
    website_url: nominee?.website_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!nominee) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Nominee Profile</h3>
        <p className="text-sm text-slate-500 mb-4">You haven't claimed a nominee profile yet.</p>
        <Link to={createPageUrl('ClaimProfile')}>
          <Button>Check for Nominations</Button>
        </Link>
      </div>
    );
  }

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await Nominee.update(nominee.id, formData);
      onUpdate?.({ ...nominee, ...formData });
      toast({ title: 'Flightography saved!' });
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6">

      {/* ── Hero Identity Card ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0d2137 100%)` }}
      >
        {/* Subtle gold glow top-right */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: brand.gold }}
        />

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-xl"
              style={{ borderColor: `${brand.gold}60` }}
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-bold"
                  style={{ background: `${brand.gold}20`, color: brand.gold, fontFamily: "'Playfair Display', serif" }}
                >
                  {initials}
                </div>
              )}
            </div>
            <label
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110"
              style={{ background: brand.gold }}
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                : <Camera className="w-3.5 h-3.5 text-white" />
              }
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>

          {/* Name + Story */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Display Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-white/30 text-base font-semibold focus:outline-none focus:border-white/40 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">
                <Sparkles className="w-3 h-3 inline mr-1" style={{ color: brand.gold }} />
                Six-Word Story
              </label>
              <input
                value={formData.six_word_story}
                onChange={(e) => setFormData(prev => ({ ...prev, six_word_story: e.target.value }))}
                placeholder="Describe yourself in six words…"
                maxLength={100}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30"
                style={{ color: brand.gold }}
              />
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="relative mt-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}40` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {nominee.status === 'active' ? 'Active Nominee' : nominee.status || 'Nominee'}
          </span>
          <Link
            to={createPageUrl('ProfileView') + `?id=${nominee.id}`}
            className="ml-auto flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Public Profile
          </Link>
        </div>
      </div>

      {/* ── Biography ── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biography</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell your story — your mission, your impact, what drives you…"
          className="min-h-[130px] text-sm bg-white border-slate-200 rounded-xl resize-none focus:border-slate-400 transition-colors leading-relaxed"
        />
      </div>

      {/* ── Social Links ── */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Links & Social</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <div
              key={key}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors group"
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">{label}</div>
                <input
                  value={formData[key]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Save ── */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-6 text-white font-semibold rounded-xl"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #2a5080)` }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Flightography
        </Button>
      </div>
    </div>
  );
}