import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CancelBookingModal({ booking, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  // Calculate refund preview
  const startTime = new Date(booking?.start_time);
  const now = new Date();
  const hoursUntil = (startTime - now) / (1000 * 60 * 60);
  
  let refundPercent = 0;
  let refundMessage = '';
  if (hoursUntil >= 24) {
    refundPercent = 100;
    refundMessage = 'Full refund (24+ hours notice)';
  } else if (hoursUntil >= 2) {
    refundPercent = 50;
    refundMessage = '50% refund (2-24 hours notice)';
  } else {
    refundPercent = 0;
    refundMessage = 'No refund (less than 2 hours notice)';
  }

  const cancelMutation = useMutation({
    mutationFn: () => base44.functions.invoke('cancelBooking', {
      bookingId: booking.id,
      reason
    }),
    onSuccess: (res) => {
      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }
      toast.success(`Booking cancelled. ${res.data.refund_percent}% refunded.`);
      queryClient.invalidateQueries(['client-bookings']);
      queryClient.invalidateQueries(['provider-bookings']);
      onClose();
    },
    onError: (err) => toast.error(err.message)
  });

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Refund Preview */}
          <div className={`p-4 rounded-lg ${refundPercent === 100 ? 'bg-green-50' : refundPercent === 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Refund: {refundPercent}%</span>
            </div>
            <p className="text-sm text-slate-600">{refundMessage}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              placeholder="Let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Keep Booking</Button>
          <Button 
            variant="destructive" 
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cancel Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}