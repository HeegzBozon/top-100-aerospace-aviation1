import React, { useState } from 'react';
import { Employer } from '@/entities/Employer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Save, Building2, Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

const INDUSTRY_SEGMENTS = [
  'Commercial Aviation', 'Aerospace Manufacturing', 'Space', 'Defense', 
  'MRO', 'UAS/Drones', 'eVTOL/AAM', 'Avionics', 'Airports/Infrastructure', 
  'R&D', 'Education/Academia', 'Venture Capital', 'Government/Policy', 'Other'
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const COMPANY_TYPES = ['Private', 'Public', 'Government', 'NGO', 'Research', 'Startup', 'Enterprise'];

export default function EmployerProfileEditor({ user, employer, onUpdate }) {
  const [formData, setFormData] = useState({
    company_name: employer?.company_name || '',
    overview_short: employer?.overview_short || '',
    overview_long: employer?.overview_long || '',
    headquarters_location: employer?.headquarters_location || '',
    website_url: employer?.website_url || '',
    linkedin_url: employer?.linkedin_url || '',
    logo_url: employer?.logo_url || '',
    industry_segments: employer?.industry_segments || [],
    company_size: employer?.company_size || '',
    company_type: employer?.company_type || '',
    primary_contact_email: employer?.primary_contact_email || user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
      toast({ title: 'Logo uploaded!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.company_name || !formData.headquarters_location) {
      toast({ variant: 'destructive', title: 'Company name and location required' });
      return;
    }
    
    setCreating(true);
    try {
      const newEmployer = await Employer.create({
        ...formData,
        owner_email: user.email,
        industry_segments: formData.industry_segments.length > 0 ? formData.industry_segments : ['Other'],
      });
      onUpdate?.(newEmployer);
      toast({ title: 'Employer profile created!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!employer) {
      handleCreate();
      return;
    }
    
    setSaving(true);
    try {
      await Employer.update(employer.id, formData);
      onUpdate?.({ ...employer, ...formData });
      toast({ title: 'Employer profile saved!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const toggleIndustry = (ind) => {
    setFormData(prev => ({
      ...prev,
      industry_segments: prev.industry_segments.includes(ind)
        ? prev.industry_segments.filter(i => i !== ind)
        : [...prev.industry_segments, ind]
    }));
  };

  if (!employer) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Building2 className="w-6 h-6 text-purple-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Employer Profile</h2>
            <p className="text-sm text-slate-500">Represent your company on the platform</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 space-y-4">
          <div className="text-center mb-4">
            <Plus className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium text-slate-800 mb-1">Create Employer Profile</h3>
            <p className="text-sm text-slate-500">
              Post jobs and connect with talent
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hq_location">Headquarters Location *</Label>
              <Input
                id="hq_location"
                value={formData.headquarters_location}
                onChange={(e) => setFormData(prev => ({ ...prev, headquarters_location: e.target.value }))}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Employer Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Building2 className="w-6 h-6 text-purple-500 mt-1" />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Employer Profile</h2>
          <p className="text-sm text-slate-500">Your company's presence</p>
        </div>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 rounded-lg border-2 border-purple-200">
            <AvatarImage src={formData.logo_url} className="object-contain" />
            <AvatarFallback className="bg-purple-50 text-purple-600 text-xl rounded-lg">
              {formData.company_name?.charAt(0) || '?'}
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
              onChange={handleLogoUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">Company Logo</p>
          <p className="text-xs text-slate-500">Square format recommended</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            placeholder="Company name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="overview_short">Short Description</Label>
          <Input
            id="overview_short"
            value={formData.overview_short}
            onChange={(e) => setFormData(prev => ({ ...prev, overview_short: e.target.value }))}
            placeholder="250 character summary"
            maxLength={250}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="overview_long">Full Description</Label>
          <Textarea
            id="overview_long"
            value={formData.overview_long}
            onChange={(e) => setFormData(prev => ({ ...prev, overview_long: e.target.value }))}
            placeholder="Tell the story of your company..."
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hq">Headquarters</Label>
            <Input
              id="hq"
              value={formData.headquarters_location}
              onChange={(e) => setFormData(prev => ({ ...prev, headquarters_location: e.target.value }))}
              placeholder="City, Country"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Company Size</Label>
            <Select
              value={formData.company_size}
              onValueChange={(val) => setFormData(prev => ({ ...prev, company_size: val }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map(size => (
                  <SelectItem key={size} value={size}>{size} employees</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Company Type</Label>
            <Select
              value={formData.company_type}
              onValueChange={(val) => setFormData(prev => ({ ...prev, company_type: val }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Industry Segments</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INDUSTRY_SEGMENTS.map(ind => (
              <Badge
                key={ind}
                variant={formData.industry_segments.includes(ind) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors text-xs"
                onClick={() => toggleIndustry(ind)}
              >
                {ind}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn Company Page</Label>
          <Input
            id="linkedin"
            value={formData.linkedin_url}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
            placeholder="https://linkedin.com/company/..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link 
          to={createPageUrl('MissionControl') + '?module=employer'}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Manage Jobs
        </Link>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}