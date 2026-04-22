import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Camera, Loader2, Save, Upload, ExternalLink, CheckCircle2, MapPin,
  Briefcase, Hash, Sparkles, Linkedin, Instagram, Youtube, Globe, X, Plus, BookOpen, PenLine
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CountrySelect from '@/components/profile/CountrySelect';
import StoryBuilderModal from '@/components/profile/StoryBuilderModal';
import StoryProgressNudge from '@/components/profile/StoryProgressNudge';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

function ThreadsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.035l13.422 9.215c5.83-8.715 14.91-10.566 21.697-10.566h.233c8.378.052 14.697 2.481 18.784 7.22 2.984 3.49 4.988 8.318 5.988 14.434a100.448 100.448 0 0 0-17.407-1.13c-19.675 0-35.458 10.855-35.458 30.501 0 18.97 14.756 30.399 33.918 30.399 16.642 0 30.686-7.417 39.144-20.885 6.148-9.74 9.723-22.363 9.723-37.556v-.61c-.002-.054-.002-.109-.002-.164s0-.11.002-.164v-.61c0 0 .004-5.284.004-5.284l-.613-.042Zm-22.653 38.915c-5.792 8.503-15.245 13.565-25.744 13.565-10.014 0-16.737-4.73-16.737-12.587 0-8.65 7.92-13.436 20.907-13.436 5.848 0 11.504.769 16.756 2.27-.976 4.16-2.634 7.574-5.182 10.188Z" />
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

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 6) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {tags.length < 6 && (
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Add expertise (e.g. Propulsion, UAV)"
            className="h-8 text-sm flex-1"
          />
          <Button type="button" size="sm" variant="outline" onClick={addTag} className="h-8 px-3">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
      <p className="text-[10px] text-slate-400 mt-1">{tags.length}/6 tags</p>
    </div>
  );
}

export default function UserProfileEditor({ user, nominee, onNomineeUpdate }) {
  // User fields
  const [userData, setUserData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    location: user?.location || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    industry_role: user?.industry_role || '',
    expertise_tags: user?.expertise_tags || [],
    linkedin_url: user?.linkedin_url || '',
    website_url: user?.website_url || '',
  });

  // Nominee fields (only if nominee exists)
  const [nomineeData, setNomineeData] = useState({
    name: nominee?.name || '',
    six_word_story: nominee?.six_word_story || '',
    bio: nominee?.bio || '',
    avatar_url: nominee?.avatar_url || '',
    linkedin_profile_url: nominee?.linkedin_profile_url || '',
    instagram_url: nominee?.instagram_url || '',
    threads_url: nominee?.threads_url || '',
    youtube_url: nominee?.youtube_url || '',
    website_url: nominee?.website_url || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [storyBuilderOpen, setStoryBuilderOpen] = useState(false);
  const [storyDraft, setStoryDraft] = useState(null); // { answers, step }
  const { toast } = useToast();

  // Load story builder draft to show progress nudge
  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      const draft = me?.story_builder_draft;
      if (draft?.answers && Object.keys(draft.answers).length > 0) {
        setStoryDraft(draft);
      }
    })();
  }, [storyBuilderOpen]); // re-check when modal closes

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUserData(prev => ({ ...prev, avatar_url: file_url }));
      if (nominee) setNomineeData(prev => ({ ...prev, avatar_url: file_url }));
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
      // Save user data
      await User.updateMyUserData(userData);

      // Save nominee data if nominee exists
      if (nominee) {
        await Nominee.update(nominee.id, nomineeData);
        onNomineeUpdate?.({ ...nominee, ...nomineeData });
      }

      toast({ title: 'Profile saved!' });
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const initials = userData.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const displayAvatar = userData.avatar_url;

  return (
    <div className="space-y-6">

      {/* ── 1. Identity Hero ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: `linear-gradient(135deg, ${brand.navy} 0%, #0d2137 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: brand.gold }} />

        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-xl" style={{ borderColor: `${brand.gold}60` }}>
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ background: `${brand.gold}20`, color: brand.gold, fontFamily: "'Playfair Display', serif" }}>
                  {initials}
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110" style={{ background: brand.gold }}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>

          {/* Name + headline */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Full Name</label>
              <input
                value={userData.full_name}
                onChange={(e) => {
                  setUserData(prev => ({ ...prev, full_name: e.target.value }));
                  if (nominee) setNomineeData(prev => ({ ...prev, name: e.target.value }));
                }}
                placeholder="Your full name"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-white/30 text-base font-semibold focus:outline-none focus:border-white/40 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Professional Headline</label>
              <input
                value={userData.headline}
                onChange={(e) => setUserData(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g. Aerospace Engineer at NASA"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>
            {nominee && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">
                  <Sparkles className="w-3 h-3 inline mr-1" style={{ color: brand.gold }} />
                  Six-Word Story
                </label>
                <input
                  value={nomineeData.six_word_story}
                  onChange={(e) => setNomineeData(prev => ({ ...prev, six_word_story: e.target.value }))}
                  placeholder="Describe yourself in six words…"
                  maxLength={100}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30"
                  style={{ color: brand.gold }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Nominee badge row */}
        {nominee && (
          <div className="relative mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}40` }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {nominee.status === 'active' ? 'Active Nominee' : nominee.status || 'Nominee'}
            </span>
            <Link
              to={`/ProfileView?id=${nominee.id}`}
              className="ml-auto flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Public Profile
            </Link>
          </div>
        )}
      </div>

      {/* ── 2. About / Bio ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bio / About</label>
          {userData.bio && (
            <button
              type="button"
              onClick={() => setStoryBuilderOpen(true)}
              className="flex items-center gap-1 text-[10px] font-semibold transition-colors hover:opacity-80"
              style={{ color: brand.gold }}
            >
              <Sparkles className="w-3 h-3" /> Rewrite with AI
            </button>
          )}
        </div>

        {userData.bio ? (
          <div className="relative group">
            <Textarea
              value={userData.bio}
              onChange={(e) => {
                setUserData(prev => ({ ...prev, bio: e.target.value }));
                if (nominee) setNomineeData(prev => ({ ...prev, bio: e.target.value }));
              }}
              className="min-h-[120px] text-sm bg-white border-slate-200 rounded-xl resize-none focus:border-slate-400 transition-colors leading-relaxed"
            />
          </div>
        ) : storyDraft ? (
          <StoryProgressNudge draft={storyDraft} onResume={() => setStoryBuilderOpen(true)} />
        ) : (
          <button
            type="button"
            onClick={() => setStoryBuilderOpen(true)}
            className="w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:shadow-md cursor-pointer group"
            style={{ borderColor: `${brand.gold}40`, background: `${brand.cream}` }}
          >
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${brand.gold}15` }}>
              <BookOpen className="w-6 h-6" style={{ color: brand.gold }} />
            </div>
            <h4 className="text-sm font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
              Build Your Story
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Let our personal biographer help you craft a compelling bio through a fun, guided conversation.
            </p>
            <span
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: `${brand.navy}`, color: 'white' }}
            >
              <Sparkles className="w-3 h-3" /> Start My Story
            </span>
          </button>
        )}
      </div>

      <StoryBuilderModal
        open={storyBuilderOpen}
        onClose={() => setStoryBuilderOpen(false)}
        userName={userData.full_name}
        onBioGenerated={(bio) => {
          setUserData(prev => ({ ...prev, bio }));
          if (nominee) setNomineeData(prev => ({ ...prev, bio }));
        }}
      />

      {/* ── 3. Professional Details Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Country</Label>
          </div>
          <CountrySelect
            value={userData.location}
            onChange={(val) => setUserData(prev => ({ ...prev, location: val }))}
          />
        </div>
        {/* Industry Role */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Industry Role</Label>
          </div>
          <Input
            value={userData.industry_role}
            onChange={(e) => setUserData(prev => ({ ...prev, industry_role: e.target.value }))}
            placeholder="e.g. Propulsion Engineer, Test Pilot"
            className="h-9 text-sm bg-white"
          />
        </div>
      </div>

      {/* ── 4. Expertise Tags ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expertise Tags</Label>
        </div>
        <TagInput tags={userData.expertise_tags} onChange={(tags) => setUserData(prev => ({ ...prev, expertise_tags: tags }))} />
      </div>

      {/* ── 5. Social Links ── */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Links & Social</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => {
            // LinkedIn and website sync to both user and nominee
            const isLinkedIn = key === 'linkedin_profile_url';
            const isWebsite = key === 'website_url';
            const value = nominee ? nomineeData[key] : (isLinkedIn ? userData.linkedin_url : isWebsite ? userData.website_url : '');

            const handleChange = (val) => {
              if (nominee) {
                setNomineeData(prev => ({ ...prev, [key]: val }));
              }
              // Also sync linkedin_url and website_url to user entity
              if (isLinkedIn) setUserData(prev => ({ ...prev, linkedin_url: val }));
              if (isWebsite) setUserData(prev => ({ ...prev, website_url: val }));
            };

            // Hide nominee-only social fields if no nominee
            if (!nominee && !isLinkedIn && !isWebsite) return null;

            return (
              <div key={key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors group">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">{label}</div>
                  <input
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. LinkedIn PDF import ── */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0077b5]/5 border-b border-[#0077b5]/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0077b5] flex items-center justify-center text-white text-[11px] font-black leading-none">in</div>
            <span className="text-sm font-semibold text-slate-700">Import from LinkedIn</span>
          </div>
          <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0077b5] hover:underline flex items-center gap-1">
            Open LinkedIn <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ol className="flex-1 space-y-1 text-xs text-slate-500">
            {['Go to your LinkedIn profile', 'Click "More" → "Save to PDF"', 'Upload the PDF here'].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <label className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-medium ${pdfUploaded ? 'border-green-400 bg-green-50 text-green-700' : 'border-[#0077b5]/30 bg-[#0077b5]/5 text-[#0077b5] hover:bg-[#0077b5]/10'}`}>
            {pdfUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : pdfUploaded ? <><CheckCircle2 className="w-4 h-4" /> Uploaded!</> : <><Upload className="w-4 h-4" /> Upload PDF</>}
            <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={pdfUploading} />
          </label>
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
          Save Profile
        </Button>
      </div>
    </div>
  );
}