import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroMonthCalendar from './HeroMonthCalendar';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ChamberCalendarSection({ events, loading, liveNow, featured }) {
  const next = liveNow || featured;
  const now = new Date();
  const todayLabel = `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl rounded-3xl border border-[#c9a87c]/30 bg-[#07111f]/60 backdrop-blur-xl shadow-[0_0_50px_rgba(201,168,124,0.15)]">
      {/* Header row — mirrors the Nominations countdown module */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full bg-[#c9a87c] ${liveNow ? 'animate-pulse' : ''}`} />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Chamber Calendar</p>
        </div>
        <p className="text-xs font-semibold text-white/50">{todayLabel}</p>
      </div>

      {/* Body — next event + RSVP on the left, month grid on the right */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
            </div>
          ) : next ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {liveNow && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${liveNow ? 'bg-red-400' : 'bg-[#c9a87c] animate-pulse'}`} />
                  </span>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a87c]">{liveNow ? 'Live Now' : 'Next Chamber Event'}</p>
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold text-white">{next.title}</p>
                {next.meeting_url ? (
                  <a href={next.meeting_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-[#07111f]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
                    {liveNow ? 'Join' : 'Link'}
                  </a>
                ) : (
                  <Link to="/events" className="mt-2 inline-flex text-[10px] font-bold text-white/55 transition-colors hover:text-[#c9a87c]">Calendar →</Link>
                )}
              </div>

              {/* RSVP CTA — full width outlined, placeholder Google Calendar link until GHL is wired */}
              <a
                href="https://calendar.app.google/TrL8saY6XS6tdVj1A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c] transition-all hover:bg-[#c9a87c]/20"
              >
                RSVP <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </>
          ) : (
            <a
              href="https://calendar.app.google/TrL8saY6XS6tdVj1A"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#c9a87c]/40 bg-[#c9a87c]/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a87c] transition-all hover:bg-[#c9a87c]/20"
            >
              RSVP <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="min-h-[320px]">
          <HeroMonthCalendar events={events} bare />
        </div>
      </div>
    </div>
  );
}