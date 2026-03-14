import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

export default function RescheduleModal({ booking, service, isOpen, onClose, userEmail }) {
  const [date, setDate] = useState(addDays(new Date(), 1));
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchSlots = async () => {
      if (!service || !date) return;
      setLoadingSlots(true);
      try {
        const res = await base44.functions.invoke('checkAvailability', {
          provider_email: service.provider_user_email,
          date: date.toISOString(),
          duration_minutes: service.duration_minutes || 60,
        });
        setAvailableSlots(res.data.available_slots || []);
        setTime('');
      } catch (e) {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [date, service]);

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      const [hours, minutes] = time.split(':');
      const newStart = new Date(date);
      newStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create new booking
      const newBooking = await base44.entities.Booking.create({
        service_id: booking.service_id,
        provider_user_email: booking.provider_user_email,
        client_user_email: booking.client_user_email,
        start_time: newStart.toISOString(),
        status: 'pending',
        payment_status: booking.payment_status,
        notes: booking.notes,
        original_booking_id: booking.id,
      });

      // Mark old as rescheduled
      await base44.entities.Booking.update(booking.id, {
        status: 'rescheduled',
        reschedule_requested_by: userEmail,
        reschedule_reason: reason,
      });

      return newBooking;
    },
    onSuccess: () => {
      toast.success('Booking rescheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">New Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">New Time</label>
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking availability...
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-slate-500">No slots available</p>
            ) : (
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => {
                    const t = new Date(slot.start);
                    const val = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
                    return <SelectItem key={slot.start} value={val}>{slot.display}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you rescheduling?"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={() => rescheduleMutation.mutate()}
              disabled={!time || rescheduleMutation.isPending}
              className="flex-1 bg-[#1e3a5a]"
            >
              {rescheduleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reschedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}