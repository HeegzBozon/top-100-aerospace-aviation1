import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WaitlistButton({ serviceId, userEmail }) {
  const queryClient = useQueryClient();

  const { data: waitlistEntry } = useQuery({
    queryKey: ['waitlist-status', serviceId, userEmail],
    queryFn: async () => {
      const entries = await base44.entities.Waitlist.filter({ 
        service_id: serviceId, 
        user_email: userEmail,
        status: 'waiting'
      });
      return entries[0] || null;
    },
    enabled: !!serviceId && !!userEmail
  });

  const joinMutation = useMutation({
    mutationFn: () => base44.entities.Waitlist.create({
      service_id: serviceId,
      user_email: userEmail,
      status: 'waiting'
    }),
    onSuccess: () => {
      toast.success("You're on the waitlist! We'll notify you when a slot opens.");
      queryClient.invalidateQueries(['waitlist-status', serviceId, userEmail]);
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => base44.entities.Waitlist.update(waitlistEntry.id, { status: 'expired' }),
    onSuccess: () => {
      toast.success('Removed from waitlist');
      queryClient.invalidateQueries(['waitlist-status', serviceId, userEmail]);
    }
  });

  if (waitlistEntry) {
    return (
      <Button 
        variant="outline" 
        onClick={() => leaveMutation.mutate()}
        disabled={leaveMutation.isPending}
        className="gap-2"
      >
        {leaveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        Leave Waitlist
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={() => joinMutation.mutate()}
      disabled={joinMutation.isPending}
      className="gap-2"
    >
      {joinMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      Join Waitlist
    </Button>
  );
}