import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroMonthCalendar from './HeroMonthCalendar';

export default function ChamberCalendarSection({ events, loading, liveNow, featured }) {
  const next = liveNow || featured;

  return (
    <section className="relative z-10 mx-auto mt-8 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Chamber Calendar</p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Left — next chamber event + RSVP */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="cal-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
              </motion.div>
            ) : next ? (
              <>
                <motion.div
                  key={next.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                >
                  <span className={`relative flex h-2 w-2 shrink-0 ${liveNow ? '' : 'opacity-60'}`}>
                    {liveNow && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${liveNow ? 'bg-red-400' : 'bg-[#c9a87c] animate-pulse'}`} />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a87c]">{liveNow ? 'Live Now' : 'Next Chamber Event'}</p>
                    <p className="truncate text-xs font-semibold text-white">{next.title}</p>
                  </div>
                  {next.meeting_url ? (
                    <a href={next.meeting_url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-[#07111f]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
                      {liveNow ? 'Join' : 'Link'}
                    </a>
                  ) : (
                    <Link to="/events" className="shrink-0 text-[10px] font-bold text-white/55 transition-colors hover:text-[#c9a87c]">Calendar →</Link>
                  )}
                </motion.div>

                {/* RSVP CTA — placeholder Google Calendar link until GHL is wired */}
                <a
                  href="https://calendar.app.google.com/TrL8saY6XS6tdVj1A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c] transition-all hover:bg-[#c9a87c]/20"
                >
                  RSVP <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </>
            ) : (
              <a
                href="https://calendar.app.google.com/TrL8saY6XS6tdVj1A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c] transition-all hover:bg-[#c9a87c]/20"
              >
                RSVP <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </AnimatePresence>
        </div>

        {/* Right — month calendar */}
        <div className="min-h-[260px]">
          <HeroMonthCalendar events={events} />
        </div>
      </div>
    </section>
  );
}