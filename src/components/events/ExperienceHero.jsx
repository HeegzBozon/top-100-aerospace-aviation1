import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Radio, CalendarDays, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useCountdown, pad } from './useCountdown';
import EventCard from './EventCard';
import CommunityEventForm from './CommunityEventForm';
import ChamberModeRail from './ChamberModeRail';
import MemberPortalPanel from './MemberPortalPanel';
import { eventMatchesMode, eventMatchesRitual } from './chamberModes';

function fetchUser() {
  return base44.auth.me().catch(() => null);
}

function isLive(event) {
  const start = new Date(event.event_date).getTime();
  const end = event.event_end_date ? new Date(event.event_end_date).getTime() : start + 90 * 60 * 1000;
  const now = Date.now();
  return now >= start - 5 * 60 * 1000 && now <= end;
}

export default function ExperienceHero() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('Participate');
  const [ritual, setRitual] = useState('All');
  const [view, setView] = useState('public');
  const [showHost, setShowHost] = useState(false);

  useEffect(() => {
    fetchUser().then(setUser);
    base44.entities.Event
      .list('event_date', 100)
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveNow = useMemo(() => events.find(isLive), [events]);
  const featured = useMemo(() => events[0], [events]);
  const filtered = useMemo(
    () => events.filter((e) => eventMatchesMode(e, mode) && eventMatchesRitual(e, ritual)).slice(0, 12),
    [events, mode, ritual],
  );
  const countdown = useCountdown(featured?.event_date);

  const handleRSVP = (id, attendees) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, attendees, rsvp_count: attendees.length } : e)));
  };

  const stars = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ id: i, top: `${6 + ((i * 17) % 88)}%`, left: `${4 + ((i * 29) % 92)}%`, delay: `${(i % 7) * 0.4}s`, size: i % 5 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1' })),
    [],
  );

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07111f] px-4 py-16 text-center sm:px-8">
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <span key={s.id} className={`absolute rounded-full bg-white/70 ${s.size} animate-pulse`} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,168,124,0.20),transparent_44%),radial-gradient(circle_at_82%_78%,rgba(74,144,184,0.14),transparent_30%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        {/* Masthead */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/35 bg-[#c9a87c]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c] backdrop-blur-md">
            <CalendarDays className="h-3.5 w-3.5" /> Chamber New.0 · Aerospace Experience Calendar
          </div>
          <h1 className="leading-[0.95] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <span className="block text-4xl font-bold text-white sm:text-5xl md:text-6xl">We don't rank.</span>
            <span className="block text-4xl font-bold text-[#c9a87c] sm:text-5xl md:text-6xl">We measure.</span>
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            The modern aerospace chamber — a media, events & ecosystem company. <span className="text-white">Explore</span> the signal, <span className="text-[#c9a87c]">participate</span> in the ritual, <span className="text-white">accelerate</span> the work, <span className="text-[#c9a87c]">consult</span> the expertise.
          </p>
        </motion.div>

        {/* Live / Next-Up featured countdown */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}
              </div>
            </motion.div>
          ) : (liveNow || featured) ? (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#c9a87c]/25 bg-[#07111f]/60 backdrop-blur-xl shadow-[0_0_50px_rgba(201,168,124,0.15)]"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <span className={`relative flex h-2 w-2 ${liveNow ? '' : 'opacity-50'}`}>
                    {liveNow && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${liveNow ? 'bg-red-400' : 'bg-[#c9a87c] animate-pulse'}`} />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
                    {liveNow ? 'Live Now' : 'Next Up'}
                  </p>
                </div>
                {featured?.guild && <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{featured.guild}</p>}
              </div>

              <div className="px-5 py-4 text-left">
                <h2 className="text-xl font-bold text-white sm:text-2xl">{(liveNow || featured).title}</h2>
                {(liveNow || featured).description && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/55">{(liveNow || featured).description}</p>
                )}

                {!liveNow && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {['Days', 'Hours', 'Mins', 'Secs'].map((label, i) => (
                      <div key={label} className="rounded-xl border border-white/10 bg-white/8 px-1.5 py-2.5 text-center">
                        <div className="text-lg font-bold tabular-nums text-white sm:text-2xl">
                          {pad([countdown.days, countdown.hours, countdown.mins, countdown.secs][i])}
                        </div>
                        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  {(liveNow || featured).meeting_url ? (
                    <a
                      href={(liveNow || featured).meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all hover:scale-[1.03]"
                      style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)', color: '#07111f' }}
                    >
                      <Radio className="h-3.5 w-3.5" /> {liveNow ? 'Join Now' : 'Get the Link'}
                    </a>
                  ) : null}
                  <Link to="/events" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/85 transition-colors hover:bg-white/10">
                    Full Calendar <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="text-sm text-white/70">No experiences scheduled yet. Be the first to host one.</p>
              <button onClick={() => setShowHost(true)} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)', color: '#07111f' }}>
                <Plus className="h-3.5 w-3.5" /> Host an Experience
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View toggle — public experience feed vs member portal */}
        {user && (
          <div className="mt-7 flex items-center justify-center gap-2">
            <button
              onClick={() => setView(view === 'public' ? 'portal' : 'public')}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition-all hover:text-[#c9a87c]"
            >
              {view === 'public' ? '↳ My Chamber Portal' : '↳ Public Experience Feed'}
            </button>
          </div>
        )}

        {view === 'portal' && user ? (
          <div className="mt-6">
            <MemberPortalPanel user={user} events={events} />
          </div>
        ) : (
          <>
            {/* Chamber mode rail — the four pillars */}
            {!loading && (
              <div className="mt-7">
                <ChamberModeRail mode={mode} setMode={setMode} ritual={ritual} setRitual={setRitual} />
              </div>
            )}

            {/* Horizontal rail */}
            {!loading && filtered.length > 0 && (
              <div className="mt-6 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {filtered.map((e, i) => (
                  <div key={e.id} className="snap-start">
                    <EventCard event={e} user={user} onRSVP={handleRSVP} index={i} />
                  </div>
                ))}
              </div>
            )}

            {/* Primary CTAs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowHost(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-6 py-3 text-sm font-bold text-[#c9a87c] backdrop-blur-md transition-all hover:bg-[#c9a87c]/20"
              >
                <Plus className="h-4 w-4" /> Host an Experience
              </button>
              <Link to="/nominate" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#0a1526] shadow-[0_0_32px_rgba(201,168,124,0.35)] transition-all hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
                Nominate a Leader <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* Host modal */}
      <AnimatePresence>
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
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
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
      </AnimatePresence>
    </section>
  );
}