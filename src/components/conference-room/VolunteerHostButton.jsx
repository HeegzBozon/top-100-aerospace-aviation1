import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { UserPlus, Loader2, X } from 'lucide-react';

// A Fellow raises their hand to host or co-host a Mission Room. Creates an
// attending RSVP with volunteer=true when none exists, or updates the
// existing RSVP. Coordination signal only — never measurement-bearing.
export default function VolunteerHostButton({ room, myRsvp, user, accent, onChanged }) {
  const [busy, setBusy] = useState(false);
  const volunteered = !!myRsvp?.volunteer;
  const canVolunteer = room.status === 'open' || room.status === 'live';

  const volunteer = async () => {
    if (!user?.email) return;
    setBusy(true);
    try {
      if (myRsvp) {
        await base44.entities.ConferenceRsvp.update(myRsvp.id, { volunteer: true });
      } else {
        await base44.entities.ConferenceRsvp.create({
          room_id: room.id,
          conference_name: room.conference_name,
          fellow_email: user.email,
          fellow_name: user.full_name || '',
          fellow_avatar_url: user.avatar_url || '',
          status: 'attending',
          volunteer: true,
          declared_at: new Date().toISOString(),
        });
      }
      onChanged();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!myRsvp) return;
    setBusy(true);
    try {
      await base44.entities.ConferenceRsvp.update(myRsvp.id, { volunteer: false });
      onChanged();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  if (!canVolunteer) return null;

  if (volunteered) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: accent }}>
        <UserPlus className="w-3.5 h-3.5" /> Volunteered to host
        <button
          type="button"
          onClick={withdraw}
          disabled={busy}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
          style={{ color: B.muted }}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Withdraw
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={volunteer}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
      style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Volunteer to host
    </button>
  );
}