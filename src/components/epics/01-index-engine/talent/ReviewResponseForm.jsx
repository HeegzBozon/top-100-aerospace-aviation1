import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewResponseForm({ review, onClose }) {
  const queryClient = useQueryClient();
  const [response, setResponse] = useState(review.provider_response || '');

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Review.update(review.id, {
      provider_response: response,
      provider_response_date: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Response saved');
      queryClient.invalidateQueries(['service-reviews']);
      onClose?.();
    }
  });

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          {review.provider_response ? 'Edit Response' : 'Add Response'}
        </span>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Thank the reviewer and address their feedback..."
        rows={3}
        className="mb-2"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button 
          size="sm" 
          onClick={() => saveMutation.mutate()}
          disabled={!response.trim() || saveMutation.isPending}
        >
          {saveMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          Save Response
        </Button>
      </div>
    </div>
  );
}