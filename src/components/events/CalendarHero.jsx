import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Search, Settings2, Star,
  ShoppingBag, CalendarDays, HelpCircle, Layers,
} from 'lucide-react';
import NominationCountdown from '@/components/home-v2/NominationCountdown';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_PX = 44;

const GUILD_COLORS = {
  Builders: '#c9a87c',
  'Mission Control': '#4a90b8',
  'Local Legends': '#d4a574',
  Investors: '#7fa8c9',
  Alumni: '#b08968',
  default: '#c9a87c',
};

const DEFAULT_GUILDS = ['Builders', 'Mission Control', 'Local Legends', 'Investors', 'Alumni'];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(ref) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function weekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
}

function fmtHour(h) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

export default function CalendarHero({ events = [], loading = false, user = null, onHost }) {
  const today = new Date();
  const [offset, setOffset] = useState(0); // weeks from current week
  const [view, setView] = useState('Week');
  const [enabled, setEnabled] = useState(() => new Set(DEFAULT_GUILDS));

  const weekStart = useMemo(() => {
    const d = startOfWeek(today);
    d.setDate(d.getDate() + offset * 7);
    return d;
  }, [offset]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [weekStart],
  );

  const rangeLabel = useMemo(() => {
    const a = weekDates[0];
    const b = weekDates[6];
    if (a.getMonth() === b.getMonth()) return `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
    return `${MONTHS[a.getMonth()]} – ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
  }, [weekDates]);

  const guilds = useMemo(() => {
    const set = new Set(DEFAULT_GUILDS);
    events.forEach((e) => e?.guild && set.add(e.guild));
    return Array.from(set);
  }, [events]);

  const visibleEvents = useMemo(
    () => events.filter((e) => {
      if (!e?.event_date) return false;
      if (e.guild && !enabled.has(e.guild)) return false;
      const d = new Date(e.event_date);
      return d >= weekDates[0] && d <= new Date(weekDates[6].getTime() + 86399999);
    }),
    [events, enabled, weekDates],
  );

  const monthCounts = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!e?.event_date) return;
      const d = new Date(e.event_date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [events]);

  const miniCells = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const lead = first.getDay();
    const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(new Date(today.getFullYear(), today.getMonth(), d));
    return arr;
  }, []);

  const gridHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  const chipFor = (e) => {
    const d = new Date(e.event_date);
    const end = e.event_end_date ? new Date(e.event_end_date) : new Date(d.getTime() + 60 * 60000);
    let topMin = d.getHours() * 60 + d.getMinutes() - START_HOUR * 60;
    let endMin = end.getHours() * 60 + end.getMinutes() - START_HOUR * 60;
    if (topMin < 0) topMin = 0;
    if (endMin > (END_HOUR - START_HOUR) * 60) endMin = (END_HOUR - START_HOUR) * 60;
    const top = (topMin / 60) * HOUR_PX;
    const height = Math.max(((endMin - topMin) / 60) * HOUR_PX, 22);
    return { dayIndex: d.getDay(), top, height };
  };

  const liveNow = events.find((e) => {
    if (!e?.event_date) return false;
    const s = new Date(e.event_date).getTime();
    const en = e.event_end_date ? new Date(e.event_end_date).getTime() : s + 90 * 60000;
    return Date.now() >= s - 5 * 60000 && Date.now() <= en;
  });

  const toggleGuild = (g) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next.size ? next : prev; // never empty
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-[100svh] w-full flex-col overflow-hidden bg-[#07111f]"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 border-b border-white/8 bg-[#0a1626]/70 px-4 py-2.5">
        {/* Create + wordmark */}
        <button
          onClick={onHost}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-[#07111f] transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}
        >
          <Plus className="h-4 w-4" /> Create
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[#c9a87c]/40 text-[11px] font-black text-[#c9a87c]">T</span>
          <div className="leading-none">
            <p className="text-sm font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>TOP 100 · Chamber</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">We don't rank. We measure.</p>
          </div>
        </div>

        {/* Center nav */}
        <div className="ml-auto flex items-center gap-2 sm:ml-6">
          <button
            onClick={() => setOffset(0)}
            className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/80 transition-colors hover:text-[#c9a87c]"
          >
            Today
          </button>
          <button onClick={() => setOffset((o) => o - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-white/55 hover:text-[#c9a87c]"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setOffset((o) => o + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-white/55 hover:text-[#c9a87c]"><ChevronRight className="h-4 w-4" /></button>
          <p className="ml-1 text-sm font-bold text-white/90" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{rangeLabel}</p>
          <span className="hidden rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 px-2 py-0.5 text-[10px] font-bold text-[#c9a87c] sm:inline">Week {weekNumber(weekStart)}</span>
        </div>

        {/* Right controls */}
        <div className="ml-auto hidden items-center gap-1.5 md:flex">
          <button className="grid h-8 w-8 place-items-center rounded-full text-white/45 hover:text-[#c9a87c]"><Search className="h-4 w-4" /></button>
          <button className="grid h-8 w-8 place-items-center rounded-full text-white/45 hover:text-[#c9a87c]"><HelpCircle className="h-4 w-4" /></button>
          <button className="grid h-8 w-8 place-items-center rounded-full text-white/45 hover:text-[#c9a87c]"><Settings2 className="h-4 w-4" /></button>
          <div className="ml-1 flex overflow-hidden rounded-full border border-white/15 bg-white/5">
            {['Day', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => v === 'Month' ? (window.location.href = '/events') : setView(v)}
                className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${view === v ? 'bg-[#c9a87c] text-[#07111f]' : 'text-white/60 hover:text-[#c9a87c]'}`}
              >
                {v}
              </button>
            ))}
          </div>
          {user ? (
            <span className="ml-1 grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-[#07111f]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          ) : (
            <Link to="/get-started" className="ml-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:text-[#c9a87c]">Sign in</Link>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r border-white/8 bg-[#0a1626]/40 p-4 lg:flex">
          {/* Mini-month */}
          <div>
            <p className="mb-2 text-xs font-bold text-white/85" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{MONTHS[today.getMonth()]} {today.getFullYear()}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {miniCells.map((d, i) => {
                if (!d) return <div key={i} />;
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const has = (monthCounts[key] || 0) > 0;
                const isToday = isSameDay(d, today);
                return (
                  <div key={i} className="flex items-center justify-center">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ${isToday ? 'text-[#07111f]' : has ? 'text-white' : 'text-white/45'}`}
                      style={isToday ? { background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' } : has ? { background: 'rgba(201,168,124,0.14)' } : {}}
                    >
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meet with */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/40">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[11px]">Meet with…</span>
          </div>

          {/* Time Insights → Nominations countdown */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Season Pulse</p>
            <NominationCountdown />
          </div>

          {/* My calendars → guilds */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">My Calendars</p>
            <div className="space-y-1.5">
              {guilds.map((g) => {
                const on = enabled.has(g);
                const color = GUILD_COLORS[g] || GUILD_COLORS.default;
                return (
                  <button key={g} onClick={() => toggleGuild(g)} className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-white/5">
                    <span
                      className="grid h-4 w-4 place-items-center rounded border"
                      style={{ borderColor: on ? color : 'rgba(255,255,255,0.2)', background: on ? color : 'transparent' }}
                    >
                      {on && <span className="h-1.5 w-1.5 rounded-sm bg-[#07111f]" />}
                    </span>
                    <span className={`text-[11px] font-medium ${on ? 'text-white/85' : 'text-white/40'}`}>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button className="flex items-center gap-2 text-[11px] font-semibold text-white/40 hover:text-[#c9a87c]">
            <Layers className="h-3.5 w-3.5" /> Other calendars
          </button>
        </aside>

        {/* Main week grid */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Weekday header */}
          <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-white/8">
            <div />
            {weekDates.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div key={i} className="border-l border-white/8 px-1 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{WEEKDAYS[i]}</p>
                  <span
                    className={`mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${isToday ? 'text-[#07111f]' : 'text-white/80'}`}
                    style={isToday ? { background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' } : {}}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* All-day nominations band */}
          <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-white/8 bg-[#c9a87c]/5">
            <div className="px-1 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wider text-white/30">All day</div>
            {weekDates.map((d, i) => {
              const isNomDay = d >= new Date('2026-09-01T00:00:00') && d <= new Date('2026-09-01T23:59:59');
              return (
                <div key={i} className="border-l border-white/8 px-1 py-1.5">
                  {isNomDay && (
                    <div className="truncate rounded-md px-2 py-1 text-[10px] font-bold text-[#07111f]" style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}>
                      Nominations close
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative grid grid-cols-[44px_repeat(7,1fr)]" style={{ height: gridHeight }}>
            {/* Hour axis */}
            <div className="relative">
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h, i) => (
                <div key={h} className="absolute right-1 text-right text-[9px] font-semibold text-white/30" style={{ top: i * HOUR_PX - 6 }}>
                  {i === 0 ? `GMT-04 ${fmtHour(h)}` : fmtHour(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((d, dayIdx) => {
              const isToday = isSameDay(d, today);
              const dayEvents = visibleEvents.filter((e) => new Date(e.event_date).getDay() === dayIdx);
              return (
                <div key={dayIdx} className={`relative border-l border-white/8 ${isToday ? 'bg-[#c9a87c]/5' : ''}`} style={{ height: gridHeight }}>
                  {/* hour lines */}
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-white/6" style={{ top: (i + 1) * HOUR_PX }} />
                  ))}
                  {/* event chips */}
                  {dayEvents.map((e) => {
                    const { top, height } = chipFor(e);
                    const color = GUILD_COLORS[e.guild] || GUILD_COLORS.default;
                    const live = liveNow?.id === e.id;
                    return (
                      <a
                        key={e.id}
                        href={e.meeting_url || '/events'}
                        target={e.meeting_url ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="absolute left-1 right-1 overflow-hidden rounded-lg border px-1.5 py-1 text-left transition-transform hover:z-10 hover:scale-[1.02]"
                        style={{ top, height, borderColor: `${color}66`, background: `${color}1f`, boxShadow: live ? `0 0 0 1px #ef4444, 0 0 18px rgba(239,68,68,0.5)` : 'none' }}
                      >
                        {live && <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
                        <p className="truncate text-[10px] font-bold text-white">{e.title}</p>
                        {height > 34 && <p className="truncate text-[9px] text-white/55">{e.guild || e.experience_type}</p>}
                      </a>
                    );
                  })}
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Far-right icon rail */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-3 border-l border-white/8 bg-[#0a1626]/40 py-4 md:flex">
          <Link to="/Shop" className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-[#c9a87c]"><ShoppingBag className="h-4 w-4" /></Link>
          <Link to="/nominate" className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-[#c9a87c]"><Star className="h-4 w-4" /></Link>
          <Link to="/events" className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-[#c9a87c]"><CalendarDays className="h-4 w-4" /></Link>
          <button onClick={onHost} className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-[#c9a87c]"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}