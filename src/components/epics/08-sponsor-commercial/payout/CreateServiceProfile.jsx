import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function CreateServiceProfile({ onSuccess }) {
  const [formData, setFormData] = useState({
    headline: '',
    organization: '',
    location: '',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Profile.create({
        user_email: user.email,
        ...data,
      });
    },
    onSuccess: () => {
      toast.success('Profile created successfully!');
      queryClient.invalidateQueries(['my-profile']);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to create profile: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Create Service Profile
        </CardTitle>
        <CardDescription>
          Set up your profile to receive payouts for services you provide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Professional Headline
            </label>
            <Input
              placeholder="e.g. Senior Aviation Consultant"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Organization
            </label>
            <Input
              placeholder="Your company or organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <Input
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full"
            style={{ background: brandColors.navyDeep }}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Create Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}