import React, { useState } from 'react';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Save, Star, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import SocialStatsCard from '@/components/epics/01-index-engine/profiles/SocialStatsCard';

export default function NomineeProfileEditor({ user, nominee, onUpdate }) {
  const [formData, setFormData] = useState({
    name: nominee?.name || '',
    bio: nominee?.bio || '',
    six_word_story: nominee?.six_word_story || '',
    avatar_url: nominee?.avatar_url || '',
    linkedin_profile_url: nominee?.linkedin_profile_url || '',
    instagram_url: nominee?.instagram_url || '',
    tiktok_url: nominee?.tiktok_url || '',
    youtube_url: nominee?.youtube_url || '',
    website_url: nominee?.website_url || '',
  });
  const [nomineeData, setNomineeData] = useState(nominee);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!nominee) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Nominee Profile</h3>
        <p className="text-sm text-slate-500 mb-4">
          You haven't claimed a nominee profile yet.
        </p>
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
    } catch (error) {
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
      toast({ title: 'Nominee profile saved!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Star className="w-6 h-6 text-amber-500 mt-1" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Nominee Profile</h2>
          <p className="text-sm text-slate-500">Your TOP 100 competition profile</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-amber-200">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback className="bg-amber-50 text-amber-600 text-xl">
              {formData.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <Camera className="w-4 h-4 text-slate-500" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Nominee Photo</p>
          <p className="text-xs text-slate-500">This appears on leaderboards</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your display name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="six_word_story">Six-Word Story</Label>
          <Input
            id="six_word_story"
            value={formData.six_word_story}
            onChange={(e) => setFormData(prev => ({ ...prev, six_word_story: e.target.value }))}
            placeholder="Describe yourself in six words"
            className="mt-1"
            maxLength={100}
          />
          <p className="text-xs text-slate-400 mt-1">A memorable tagline that captures your essence</p>
        </div>

        <div>
          <Label htmlFor="bio">Biography</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell your story..."
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={formData.linkedin_profile_url}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin_profile_url: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={formData.instagram_url}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tiktok">TikTok URL</Label>
            <Input
              id="tiktok"
              value={formData.tiktok_url}
              onChange={(e) => setFormData(prev => ({ ...prev, tiktok_url: e.target.value }))}
              placeholder="https://tiktok.com/@..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube URL</Label>
            <Input
              id="youtube"
              value={formData.youtube_url}
              onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
              placeholder="https://youtube.com/..."
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Social Stats */}
      <SocialStatsCard
        nominee={nomineeData}
        user={user}
        onUpdate={(newStats) => {
          const updated = { ...nomineeData, social_stats: newStats };
          setNomineeData(updated);
          onUpdate?.(updated);
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          to={createPageUrl('ProfileView') + `?id=${nominee.id}`}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          View Public Profile
        </Link>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}