import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, Target, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCountdown, pad } from './useCountdown';
import { eventMatchesMode } from './chamberModes';

const ACCELERATE_RITUALS = ['Incubator Milestone', 'Demo Day', 'Mentor Office Hours'];
const NETWORK_RITUALS = ['Networking Mixer', 'Ribbon Cutting', 'Policy Mixer'];

// The member-only view — a distinct dashboard state for verified members.
// Sits inside the hero as a toggle: "My Portal" replaces the public experience feed.
export default function MemberPortalPanel({ user, events }) {
  const email = user?.email?.toLowerCase();

  const mine = useMemo(
    () =>
      events.filter(
        (e) =>
          (e.attendees || []).some((a) => a?.toLowerCase() === email) ||
          (e.host_email || '').toLowerCase() === email,
      ),
    [events, email],
  );

  const nextUp = mine[0];

  const milestones = useMemo(
    () =>
      events
        .filter((e) => ACCELERATE_RITUALS.includes(e.chamber_ritual) || ['Live Build', 'Office Hours'].includes(e.experience_type))
        .slice(0, 3),
    [events],
  );

  const networking = useMemo(
    () =>
      events
        .filter((e) => NETWORK_RITUALS.includes(e.chamber_ritual) || ['Social', 'Celebration', 'Meetup'].includes(e.experience_type))
        .slice(0, 3),
    [events],
  );

  const countdown = useCountdown(nextUp?.event_date);
  const tier = user?.role === 'admin' ? 'Verified' : 'Member';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-3xl"
    >
      {/* Portal header */}
      <div className="flex items-center justify-between rounded-2xl border border-[#c9a87c]/25 bg-white/5 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-[#c9a87c]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c9a87c]">Chamber Portal</p>
            <p className="text-[10px] text-white/40">{user?.full_name || user?.email} · {tier} Tier</p>
          </div>
        </div>
        <Link to="/events" className="flex items-center gap-1 text-[11px] font-semibold text-white/60 transition-colors hover:text-[#c9a87c]">
          Full Calendar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* Next appointment */}
        <Card icon={<CalendarClock className="h-3.5 w-3.5" />} label="Your Next Appointment" accent="#c9a87c">
          {nextUp ? (
            <>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-white">{nextUp.title}</p>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {['Hrs', 'Mins', 'Secs'].map((l, i) => (
                  <div key={l} className="rounded-md bg-white/8 px-1 py-1 text-center">
                    <div className="text-[11px] font-bold tabular-nums text-white">
                      {pad([countdown.hours, countdown.mins, countdown.secs][i])}
                    </div>
                    <div className="text-[8px] uppercase tracking-wider text-white/40">{l}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty text="No RSVPs yet" />
          )}
        </Card>

        {/* Pending milestones */}
        <Card icon={<Target className="h-3.5 w-3.5" />} label="Pending Milestones" accent="#7fb069">
          {milestones.length ? (
            <ul className="mt-1 space-y-1">
              {milestones.map((m) => (
                <li key={m.id} className="truncate text-[11px] text-white/70">
                  · {m.title}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No active sprints" />
          )}
        </Card>

        {/* Networking opps */}
        <Card icon={<Users className="h-3.5 w-3.5" />} label="Networking This Week" accent="#4a90b8">
          {networking.length ? (
            <ul className="mt-1 space-y-1">
              {networking.map((m) => (
                <li key={m.id} className="truncate text-[11px] text-white/70">
                  · {m.title}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing scheduled" />
          )}
        </Card>
      </div>
    </motion.div>
  );
}

function Card({ icon, label, accent, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}
        <p className="text-[9px] font-bold uppercase tracking-[0.16em]">{label}</p>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="mt-2 text-[11px] italic text-white/30">{text}</p>;
}