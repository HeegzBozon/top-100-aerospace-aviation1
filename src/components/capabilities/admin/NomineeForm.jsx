import { useState, useEffect } from 'react';
import { Nominee } from '@/entities/Nominee';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { X, Loader2, Camera } from 'lucide-react';

export default function NomineeForm({ nominee, seasonId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: nominee?.name || '',
    nominee_email: nominee?.nominee_email || '',
    description: nominee?.description || '',
    linkedin_profile_url: nominee?.linkedin_profile_url || '',
    company: nominee?.company || '',
    title: nominee?.title || '',
    status: nominee?.status || 'pending',
    season_id: nominee?.season_id || seasonId,
    avatar_url: nominee?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If creating a new nominee, ensure seasonId from props is set
    if (!nominee) {
      setFormData(prev => ({ ...prev, season_id: seasonId }));
    }
  }, [nominee, seasonId]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse?.file_url || uploadResponse?.data?.file_url;

      if (!fileUrl) {
        throw new Error('No file URL returned from upload');
      }

      setFormData(prev => ({ ...prev, avatar_url: fileUrl }));
      toast({
        title: 'Photo Uploaded',
        description: 'Profile photo uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.season_id) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields (Name and Season).",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (nominee) {
        await Nominee.update(nominee.id, payload);
        toast({ title: "Nominee Updated", description: `${payload.name} has been successfully updated.` });
      } else {
        await Nominee.create(payload);
        toast({ title: "Nominee Created", description: `${payload.name} has been added to the season.` });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving nominee:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: `Could not save nominee: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-gray-900">
            {nominee ? 'Edit Nominee' : 'Add New Nominee'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <Input
                type="email"
                value={formData.nominee_email}
                onChange={(e) => setFormData(prev => ({ ...prev, nominee_email: e.target.value }))}
                placeholder="e.g., jane.doe@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">One-Liner Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A brief, compelling description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nominee's company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nominee's job title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <img 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {formData.name ? formData.name.slice(0, 2).toUpperCase() : '?'}
                </div>
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {formData.avatar_url ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
              {formData.avatar_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                  disabled={uploading}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
            <Input
              type="url"
              value={formData.linkedin_profile_url}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin_profile_url: e.target.value }))}
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="winner">Winner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                nominee ? 'Update Nominee' : 'Create Nominee'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}