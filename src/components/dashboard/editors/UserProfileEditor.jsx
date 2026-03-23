import { useState } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Save, UserCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LinkedInConnect from '@/components/linkedin/LinkedInConnect';

export default function UserProfileEditor({ user }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
      await User.updateMyUserData(formData);
      toast({ title: 'Profile saved!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <UserCircle className="w-6 h-6 text-slate-400 mt-1" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">User Profile</h2>
          <p className="text-sm text-slate-500">Your basic account information</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-slate-200">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xl">
              {formData.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
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
          <p className="text-sm font-medium text-slate-700">Profile Photo</p>
          <p className="text-xs text-slate-500">Click the camera icon to upload</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Your full name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
            className="mt-1"
          />
        </div>
      </div>

      {/* Social Integrations */}
      <div className="pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LinkedInConnect 
            user={user}
            onProfileFetched={(linkedinData) => {
              if (!formData.avatar_url && linkedinData.picture) {
                setFormData(prev => ({ ...prev, avatar_url: linkedinData.picture }));
              }
              if (!formData.full_name && linkedinData.name) {
                setFormData(prev => ({ ...prev, full_name: linkedinData.name }));
              }
            }} 
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}