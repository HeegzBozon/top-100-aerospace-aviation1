import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/meetups/meetupConfig';
import MeetupHero from '@/components/meetups/MeetupHero';
import MeetupRsvpControl from '@/components/meetups/MeetupRsvpControl';
import { ArrowLeft, Share2, Loader2, Check, MapPin } from 'lucide-react';
import BookYourStay from '@/components/travel/BookYourStay';

export default function MeetupInvite() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const ev = await base44.entities.Event.get(eventId);
        setEvent(ev);
        try {
          setUser(await base44.auth.me());
        } catch {
          /* public viewing allowed */
        }
      } finally {
        setLoading(false);
      }
    })();
    const unsub = base44.entities.Event.subscribe((e) => {
      if (e && e.data && e.data.id === eventId) setEvent(e.data);
    });
    return unsub;
  }, [eventId]);

  const rsvp = async () => {
    if (!user) return;
    setRsvpLoading(true);
    try {
      const list = [...(event.attendees || [])];
      if (!list.includes(user.email)) list.push(user.email);
      const updated = await base44.entities.Event.update(eventId, { attendees: list, rsvp_count: list.length });
      setEvent(updated);
    } finally {
      setRsvpLoading(false);
    }
  };

  const cancel = async () => {
    setRsvpLoading(true);
    try {
      const list = (event.attendees || []).filter((e) => e !== user.email);
      const updated = await base44.entities.Event.update(eventId, { attendees: list, rsvp_count: list.length });
      setEvent(updated);
    } finally {
      setRsvpLoading(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        /* user dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="animate-spin" size={28} style={{ color: B.navy }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: B.cream }}>
        <p className="font-heading text-lg" style={{ color: B.navy }}>This meetup could not be found.</p>
        <Link to="/meetups" className="text-sm" style={{ color: B.gold }}>Back to Meetups</Link>
      </div>
    );
  }

  const attendees = event.attendees || [];

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <MeetupHero event={event} attendees={attendees} />

      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="flex items-center justify-between mb-6">
          <Link to="/meetups" className="inline-flex items-center text-xs" style={{ color: B.muted }}>
            <ArrowLeft size={13} className="mr-1" />
            All meetups
          </Link>
          <button
            onClick={share}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium"
            style={{ color: B.navy, border: `1px solid ${B.border}`, background: '#fff' }}
          >
            {shared ? <Check size={13} style={{ color: B.gold }} /> : <Share2 size={13} />}
            {shared ? 'Link copied' : 'Share'}
          </button>
        </div>

        {event.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: B.navy }}>
            {event.description}
          </p>
        )}

        {event.location && (
          <div className="flex items-start gap-2 mb-6 text-sm" style={{ color: B.muted }}>
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        <div className="mb-6">
          <BookYourStay accent={B.navy} />
        </div>

        {event.host_name && (
          <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: `1px solid ${B.border}` }}>
            {event.host_avatar_url ? (
              <img src={event.host_avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: B.navy }}>
                {event.host_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs" style={{ color: B.muted }}>Hosted by</p>
              <p className="text-sm font-medium" style={{ color: B.navy }}>{event.host_name}</p>
            </div>
          </div>
        )}

        <MeetupRsvpControl
          event={event}
          user={user}
          attendees={attendees}
          onRsvp={rsvp}
          onCancel={cancel}
          loading={rsvpLoading}
        />
      </div>
    </div>
  );
}