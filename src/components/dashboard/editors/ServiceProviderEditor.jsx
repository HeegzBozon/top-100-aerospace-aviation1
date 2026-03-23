import { useState } from 'react';
import { Profile } from '@/entities/Profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Briefcase, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const SERVICE_CATEGORIES = [
  'Consulting', 'Coaching', 'Technical', 'Design', 'Marketing', 
  'Strategy', 'Operations', 'Training', 'Mentorship', 'Advisory'
];

export default function ServiceProviderEditor({ user, profile, onUpdate }) {
  const [formData, setFormData] = useState({
    headline: profile?.headline || '',
    biography: profile?.biography || '',
    service_bio: profile?.service_bio || '',
    organization: profile?.organization || '',
    location: profile?.location || '',
    linkedin_url: profile?.linkedin_url || '',
    service_areas: profile?.service_areas || [],
  });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newProfile = await Profile.create({
        user_email: user.email,
        ...formData,
      });
      onUpdate?.(newProfile);
      toast({ title: 'Service provider profile created!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      handleCreate();
      return;
    }
    
    setSaving(true);
    try {
      await Profile.update(profile.id, formData);
      onUpdate?.({ ...profile, ...formData });
      toast({ title: 'Service provider profile saved!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.includes(cat)
        ? prev.service_areas.filter(c => c !== cat)
        : [...prev.service_areas, cat]
    }));
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Briefcase className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Service Provider Profile</h2>
            <p className="text-sm text-slate-500">Offer your services on the marketplace</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <Plus className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-medium text-slate-800 mb-1">Create Provider Profile</h3>
          <p className="text-sm text-slate-500 mb-4">
            Start offering your services to the community
          </p>
          <Button onClick={handleCreate} disabled={creating} className="gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Briefcase className="w-6 h-6 text-blue-500 mt-1" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Service Provider Profile</h2>
          <p className="text-sm text-slate-500">Your marketplace presence</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            value={formData.headline}
            onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
            placeholder="e.g. Aviation Safety Consultant"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="Company or independent"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="biography">Biography</Label>
          <Textarea
            id="biography"
            value={formData.biography}
            onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
            placeholder="Your professional background..."
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="service_bio">Service Description</Label>
          <Textarea
            id="service_bio"
            value={formData.service_bio}
            onChange={(e) => setFormData(prev => ({ ...prev, service_bio: e.target.value }))}
            placeholder="What services do you offer?"
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div>
          <Label>Service Areas</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {SERVICE_CATEGORIES.map(cat => (
              <Badge
                key={cat}
                variant={formData.service_areas.includes(cat) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            value={formData.linkedin_url}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
            placeholder="https://linkedin.com/in/..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link 
          to={createPageUrl('MissionControl') + '?module=provider'}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Manage Services
        </Link>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}