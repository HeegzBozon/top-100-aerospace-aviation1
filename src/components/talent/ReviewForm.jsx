import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const brandColors = {
  goldPrestige: '#c9a87c',
};

export default function ReviewForm({ booking, service, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Review.create({
        booking_id: booking.id,
        service_id: booking.service_id,
        reviewer_email: booking.client_user_email,
        provider_email: booking.provider_user_email,
        rating,
        title,
        comment,
        is_verified: true
      });
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['my-bookings']);
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to submit review');
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review: {service?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className="w-8 h-8 transition-colors"
                    fill={(hoverRating || rating) >= star ? brandColors.goldPrestige : 'transparent'}
                    stroke={(hoverRating || rating) >= star ? brandColors.goldPrestige : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Headline</label>
            <Input
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your Review</label>
            <Textarea
              placeholder="Share details of your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || !rating}
            style={{ background: brandColors.goldPrestige }}
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}