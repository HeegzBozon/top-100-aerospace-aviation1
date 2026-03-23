import { motion } from 'framer-motion';
import { MapPin, Users, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function EventCard({ event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <Badge variant="outline" className="mb-2 uppercase text-xs font-bold tracking-wider">
            {event.event_type}
          </Badge>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{event.title}</h3>
        </div>
        <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-center min-w-[60px]">
          <div className="text-xs uppercase font-bold">{format(new Date(event.event_date), 'MMM')}</div>
          <div className="text-xl font-bold">{format(new Date(event.event_date), 'd')}</div>
        </div>
      </div>

      <p className="text-slate-600 mb-6 line-clamp-2">{event.description}</p>

      <div className="flex flex-col gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(event.event_date), 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{event.organizer}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
            {event.status}
        </Badge>
        {/* In a real app, this would link to a detail page */}
        <button className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors">
            View Details →
        </button>
      </div>
    </motion.div>
  );
}