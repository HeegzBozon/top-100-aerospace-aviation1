import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, X, Shield, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import EventCard from '@/components/events/EventCard';
import CommunityEventForm from '@/components/events/CommunityEventForm';
import GlobalNewsletterFooter from '@/components/shared/GlobalNewsletterFooter';

const TYPE_FILTERS = ['All', 'Workshop', 'Office Hours', 'Live Build', 'Build Challenge', 'AMA', 'Mission Theatre', 'Social', 'Awards'];

function monthKey(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function EventsCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showHost, setShowHost] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    refresh();
  }, []);

  const refresh = () => {
    setLoading(true);
    base44.entities.Event
      .list('event_date', 200)
      .then((all = []) => {
        const now = Date.now();
        const visible = all.filter(
          (e) =>
            new Date(e.event_date).getTime() >= now - 4 * 3600000 &&
            (e.moderation_status === 'approved' || e.is_official || e.source === 'official'),
        );
        visible.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        setEvents(visible);
      })
      .finally(() => setLoading(false));
  };

  const isAdmin = user?.role === 'admin';
  const filtered = useMemo(
    () => (filter === 'All' ? events : events.filter((e) => e.experience_type === filter)),
    [events, filter],
  );
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const k = monthKey(e.event_date);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    });
    return [...map.entries()];
  }, [filtered]);

  const handleRSVP = (id, attendees) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, attendees, rsvp_count: attendees.length } : e)));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#07111f]">
      {/* Masthead */}
      <header className="border-b border-[#c9a87c]/20 bg-[#07111f] px-4 py-10 text-center sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/35 bg-[#c9a87c]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
            <CalendarDays className="h-3.5 w-3.5" /> The Official Calendar
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Connect, share & learn with TOP 100
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
            The community calendar — programs to join, events to participate in. Hosted by TOP 100 and the community.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                  filter === t ? 'bg-[#07111f] text-[#c9a87c]' : 'border border-[#07111f]/15 bg-white text-[#07111f]/60 hover:text-[#07111f]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowHost(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)', color: '#07111f' }}
          >
            <Plus className="h-3.5 w-3.5" /> Host an Experience
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-[#07111f]/50">Loading experiences…</div>
        ) : grouped.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#07111f]/60">No upcoming experiences in this category yet.</p>
            <button onClick={() => setShowHost(true)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#07111f] px-5 py-2.5 text-xs font-bold text-[#c9a87c]">
              <Plus className="h-3.5 w-3.5" /> Be the first to host
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {grouped.map(([month, items]) => (
              <section key={month}>
                <div className="mb-4 flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#c9a87c]" />
                  <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{month}</h2>
                  <div className="h-px flex-1 bg-[#07111f]/10" />
                  <span className="text-xs font-semibold text-[#07111f]/40">{items.length} {items.length === 1 ? 'event' : 'events'}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {items.map((e, i) => (
                    <div key={e.id} className="snap-start">
                      <EventCard event={e} user={user} onRSVP={handleRSVP} index={i} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Guild bridge band */}
        <section className="mt-14 overflow-hidden rounded-3xl border border-[#07111f]/10 bg-gradient-to-r from-[#f2eff4] to-[#f8c7b0]/40 p-6 sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-[#07111f] sm:text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Events lay the foundation for Guilds
              </h3>
              <p className="mt-1 max-w-md text-sm text-[#07111f]/70">
                Attend an event → join a guild. Scale community awareness and membership that makes guilds possible.
              </p>
            </div>
            <Link to="/moon-joy" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#07111f] px-6 py-3 text-xs font-bold text-[#c9a87c] transition-all hover:scale-[1.03]">
              Join a Guild →
            </Link>
          </div>
        </section>

        <GlobalNewsletterFooter currentPageName="EventsCalendar" />
      </main>

      {/* Host modal */}
      {showHost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowHost(false)}
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-lg rounded-3xl border border-white/12 bg-[#0b1626] p-6 shadow-2xl"
          >
            <button onClick={() => setShowHost(false)} className="absolute right-4 top-4 text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            {user ? (
              <CommunityEventForm user={user} onDone={() => setShowHost(false)} />
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-white/70">Sign in to host an experience.</p>
                <button onClick={() => base44.auth.redirectToLogin()} className="mt-4 rounded-full bg-[#c9a87c] px-5 py-2.5 text-xs font-bold text-[#07111f]">
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}