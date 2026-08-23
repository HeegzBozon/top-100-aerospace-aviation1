import { useState } from 'react';
import { Calendar, MapPin, Users, Check, Scissors } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { milestoneMeta } from './ribbonCuttingConfig';
import { phaseFromDates } from '@/components/event-energy/eventEnergy';
import LiveCountdownChip from '@/components/event-energy/LiveCountdownChip';

// One ribbon-cutting card. Editorial Chamber styling (navy/cream), with a
// milestone accent strip, live countdown, and an RSVP toggle on the Event
// attendees array. Ended cuttings show their final attendee count only.
export default function RibbonCuttingCard({ event, user, accent = B.navy, onRsvpChanged }) {
  const [rsvping, setRsvping] = useState(false);
  const meta = milestoneMeta(event);
  const going = user?.email && Array.isArray(event.attendees) && event.attendees.includes(user.email);
  const phase = phaseFromDates(event.event_date, event.event_end_date);
  const ended = phase === 'ended';

  const toggleRsvp = async () => {
    if (!user?.email) { toast.info('Sign in to RSVP'); return; }
    setRsvping(true);
    try {
      const set = new Set(Array.isArray(event.attendees) ? event.attendees : []);
      if (going) set.delete(user.email); else set.add(user.email);
      const attendees = Array.from(set);
      await base44.entities.Event.update(event.id, { attendees, rsvp_count: attendees.length });
      onRsvpChanged?.();
      toast.success(going ? 'Removed your RSVP.' : "You're in — see you there.");
    } catch {
      toast.error('Could not update RSVP. Try again.');
    } finally {
      setRsvping(false);
    }
  };

  const dateLabel = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD';

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: B.border }}>
      <div className="h-1" style={{ background: meta.accent }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ background: `${meta.accent}18`, color: meta.accent }}>
            <Scissors className="w-3 h-3" /> {meta.label}
          </span>
          <LiveCountdownChip start={event.event_date} end={event.event_end_date} accent={meta.accent} />
        </div>
        <div>
          <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{event.title}</h4>
          {event.host_name && <p className="text-[11px] mt-0.5" style={{ color: B.muted }}>Hosted by {event.host_name}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: B.muted }}>
          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateLabel}</span>
          {event.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvp_count || 0}</span>
        </div>
        {!ended && (
          <button
            type="button"
            onClick={toggleRsvp}
            disabled={rsvping}
            className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-60"
            style={going ? { background: `${meta.accent}18`, color: meta.accent, border: `1px solid ${meta.accent}40` } : { background: accent, color: '#fff' }}
          >
            {going ? <><Check className="w-3.5 h-3.5" /> I'm attending</> : rsvping ? 'Saving…' : "I'm attending"}
          </button>
        )}
      </div>
    </div>
  );
}