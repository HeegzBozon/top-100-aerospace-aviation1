import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Video, MapPin, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { pad } from './useCountdown';

const TYPE_STYLES = {
  Workshop: { ring: 'border-[#c9a87c]/40', chip: 'bg-[#c9a87c]/15 text-[#c9a87c]' },
  'Office Hours': { ring: 'border-sky-400/40', chip: 'bg-sky-400/15 text-sky-300' },
  'Live Build': { ring: 'border-emerald-400/40', chip: 'bg-emerald-400/15 text-emerald-300' },
  'Build Challenge': { ring: 'border-fuchsia-400/40', chip: 'bg-fuchsia-400/15 text-fuchsia-300' },
  AMA: { ring: 'border-amber-400/40', chip: 'bg-amber-400/15 text-amber-300' },
  'Mission Theatre': { ring: 'border-[#c9a87c]/50', chip: 'bg-[#c9a87c]/20 text-[#d8b98d]' },
  Awards: { ring: 'border-yellow-400/40', chip: 'bg-yellow-400/15 text-yellow-300' },
  Social: { ring: 'border-rose-400/40', chip: 'bg-rose-400/15 text-rose-300' },
  default: { ring: 'border-white/15', chip: 'bg-white/10 text-white/80' },
};

function fmt(dateIso) {
  const d = new Date(dateIso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function EventCard({ event, user, onRSVP, index = 0 }) {
  const [rsvping, setRsvping] = useState(false);
  const style = TYPE_STYLES[event.experience_type] || TYPE_STYLES.default;
  const going = user?.email && Array.isArray(event.attendees) && event.attendees.includes(user.email);
  const full = event.capacity && event.rsvp_count >= event.capacity;

  const handleRSVP = async () => {
    if (!user?.email) {
      toast.info('Sign in to RSVP');
      return;
    }
    if (going) return;
    setRsvping(true);
    try {
      const attendees = Array.isArray(event.attendees) ? [...event.attendees, user.email] : [user.email];
      await base44.entities.Event.update(event.id, { attendees, rsvp_count: attendees.length });
      onRSVP?.(event.id, attendees);
      toast.success("You're in — see you there.");
    } catch {
      toast.error('Could not RSVP. Try again.');
    } finally {
      setRsvping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className={`group relative flex w-[290px] shrink-0 flex-col overflow-hidden rounded-2xl border ${style.ring} bg-[#0b1626]/70 backdrop-blur-md sm:w-[320px]`}
    >
      {/* date badge */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#c9a87c]">
              {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-lg font-bold leading-none text-white">{new Date(event.event_date).getDate()}</span>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
            {event.experience_type}
          </span>
        </div>
        {event.guild && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{event.guild}</span>
        )}
      </div>

      {/* title + host */}
      <div className="flex-1 px-4 py-3">
        <h3 className="text-base font-bold leading-snug text-white">{event.title}</h3>
        {event.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">{event.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {fmt(event.event_date)}
          </span>
          <span className="flex items-center gap-1">
            {event.meeting_url ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {event.meeting_url ? 'Virtual' : event.location || 'TBD'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {event.rsvp_count || 0}
          </span>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {going ? (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-400/15 py-2.5 text-xs font-bold text-emerald-300">
            <Check className="h-3.5 w-3.5" /> RSVP'd
          </div>
        ) : (
          <button
            onClick={handleRSVP}
            disabled={rsvping || full}
            className="flex-1 rounded-full py-2.5 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)', color: '#07111f' }}
          >
            {full ? 'At Capacity' : rsvping ? 'Saving…' : 'RSVP'}
          </button>
        )}
        <Link
          to={`/events?focus=${event.id}`}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
        >
          Details
        </Link>
      </div>
    </motion.div>
  );
}