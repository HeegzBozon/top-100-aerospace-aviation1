import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceDraftToggle({ service }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => base44.entities.Service.update(service.id, {
      is_draft: !service.is_draft,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success(service.is_draft ? 'Service published!' : 'Service saved as draft');
    },
  });

  return (
    <div className="flex items-center gap-3">
      {service.is_draft ? (
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
          <EyeOff className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      ) : (
        <Badge className="bg-green-100 text-green-700">
          <Eye className="w-3 h-3 mr-1" />
          Published
        </Badge>
      )}
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">
          {service.is_draft ? 'Draft' : 'Live'}
        </span>
        {toggleMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Switch
            checked={!service.is_draft}
            onCheckedChange={() => toggleMutation.mutate()}
          />
        )}
      </div>
    </div>
  );
}