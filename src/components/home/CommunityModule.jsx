import { useState, useEffect } from 'react';
import { Event } from '@/entities/Event';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function CommunityModule({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const upcomingEvents = await Event.filter({ status: 'upcoming' }, 'event_date', 3);
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border shadow-sm"
      style={{ borderColor: `${brandColors.navyDeep}10` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: brandColors.navyDeep }} />
          <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>Community & Events</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No upcoming events</p>
          <p className="text-xs mt-1">Check back soon for roundtables and meetups</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl border hover:shadow-md transition-all group cursor-pointer"
              style={{ borderColor: `${brandColors.navyDeep}10` }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-white"
                  style={{ background: brandColors.navyDeep }}
                >
                  <span className="text-xs font-medium opacity-80">
                    {event.event_date ? format(new Date(event.event_date), 'MMM') : 'TBD'}
                  </span>
                  <span className="text-lg font-bold leading-none">
                    {event.event_date ? format(new Date(event.event_date), 'd') : '--'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold text-sm truncate"
                    style={{ color: brandColors.navyDeep }}
                  >
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {event.location || 'Virtual'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t" style={{ borderColor: `${brandColors.navyDeep}10` }}>
        <div className="grid grid-cols-2 gap-2">
          <Link 
            to={createPageUrl('Arena')}
            className="text-center py-2 px-3 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
          >
            Join Discussion
          </Link>
          <Link 
            to={createPageUrl('Submit')}
            className="text-center py-2 px-3 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: brandColors.goldPrestige }}
          >
            Get Involved
          </Link>
        </div>
      </div>
    </motion.div>
  );
}