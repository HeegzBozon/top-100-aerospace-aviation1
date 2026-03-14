import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EventCard from '@/components/events/EventCard';
import { Loader2, CalendarDays } from 'lucide-react';

export default function EventsTab() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-event_date'),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No upcoming events scheduled.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}