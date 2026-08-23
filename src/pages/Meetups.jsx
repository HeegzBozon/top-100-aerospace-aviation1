import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/meetups/meetupConfig';
import MeetupCard from '@/components/meetups/MeetupCard';
import MeetupComposer from '@/components/meetups/MeetupComposer';
import { Plus, Loader2, CalendarDays, ArrowLeft } from 'lucide-react';

export default function Meetups() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [composing, setComposing] = useState(false);

  const load = async () => {
    try {
      const items = await base44.entities.Event.filter({ status: 'upcoming' }, 'event_date', 50);
      const now = Date.now();
      const upcoming = (items || []).filter((e) => !e.event_date || new Date(e.event_date).getTime() >= now);
      setEvents(upcoming);
    } catch (e) {
      setError(e);
      setEvents([]);
    }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    load();
    const unsub = base44.entities.Event.subscribe(() => load());
    return unsub;
  }, []);

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="max-w-5xl mx-auto px-5 py-7">
        <Link to="/" className="inline-flex items-center text-xs mb-5" style={{ color: B.muted }}>
          <ArrowLeft size={13} className="mr-1" />
          Back to profile
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase mb-1" style={{ color: B.gold }}>
              TOP 100
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl" style={{ color: B.navy }}>
              Meetups
            </h1>
            <p className="text-sm mt-1.5 max-w-md" style={{ color: B.muted }}>
              Curated convenings for verified Fellows. The room travels with you across the calendar.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setComposing(true)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ background: B.navy }}
            >
              <Plus size={15} />
              Host a Meetup
            </button>
          )}
        </div>

        {events === null && !error && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={26} style={{ color: B.navy }} />
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-6 text-center" style={{ border: `1px solid ${B.border}`, background: '#fff' }}>
            <p className="text-sm" style={{ color: B.navy }}>We couldn't load the meetup calendar.</p>
          </div>
        )}

        {events && events.length === 0 && (
          <div className="rounded-3xl p-10 text-center" style={{ border: `1px dashed ${B.border}`, background: '#fff' }}>
            <CalendarDays className="mx-auto mb-3" size={28} style={{ color: B.gold }} />
            <p className="font-heading text-lg mb-1" style={{ color: B.navy }}>No meetups on the calendar yet.</p>
            <p className="text-sm" style={{ color: B.muted }}>
              {user ? 'Host the first gathering.' : 'Sign in to host the first gathering.'}
            </p>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <MeetupCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </div>

      {composing && (
        <MeetupComposer
          user={user}
          onClose={() => setComposing(false)}
          onCreated={() => {
            setComposing(false);
            load();
          }}
        />
      )}
    </div>
  );
}