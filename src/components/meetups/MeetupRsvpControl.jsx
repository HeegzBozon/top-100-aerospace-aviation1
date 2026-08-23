import React from 'react';
import { Check, X, Loader2, Users, LogIn } from 'lucide-react';
import { B, tierLabel } from './meetupConfig';
import { base44 } from '@/api/base44Client';

// One-tap RSVP. Frictionless to accept, curated to enter — never open enrollment.
export default function MeetupRsvpControl({ event, user, attendees, onRsvp, onCancel, loading }) {
  const list = attendees || [];
  const isRsvpd = !!user && list.includes(user.email);
  const full = event.capacity > 0 && list.length >= event.capacity;

  if (!user) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <p className="text-sm mb-3" style={{ color: B.navy }}>
          Verified Fellows can RSVP to TOP 100 meetups.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
          style={{ background: B.navy }}
        >
          <LogIn size={15} />
          Sign in to RSVP
        </button>
      </div>
    );
  }

  if (isRsvpd) {
    return (
      <div className="rounded-2xl p-5" style={{ background: B.cream, border: `1px solid ${B.gold}66` }}>
        <div className="flex items-center gap-2 mb-3">
          <Check size={18} style={{ color: B.gold }} />
          <span className="font-medium text-sm" style={{ color: B.navy }}>You're attending</span>
        </div>
        <button
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
          style={{ color: B.navy, border: `1px solid ${B.border}`, background: '#fff' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          Cancel RSVP
        </button>
      </div>
    );
  }

  if (full) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <Users className="mx-auto mb-2" size={20} style={{ color: B.muted }} />
        <p className="text-sm" style={{ color: B.navy }}>This meetup is at capacity.</p>
        <p className="text-xs mt-1" style={{ color: B.muted }}>Curated access — {tierLabel(event.member_tier)}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: B.navy }}>
      <p className="text-white/75 text-xs mb-3">Curated access · {tierLabel(event.member_tier)}</p>
      <button
        onClick={onRsvp}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold"
        style={{ background: B.gold, color: B.navyDeep }}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Reserve my seat
      </button>
    </div>
  );
}