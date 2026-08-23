import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Loader2, Flag, Check } from 'lucide-react';
import AvatarCluster from './AvatarCluster';

// Focus-area lead board. The facilitator-authored focus_areas list is the
// scaffold; leads emerge when attendees volunteer to lead a sub-room by
// setting focus_area + volunteer on their own RSVP (RLS-safe self update —
// no room-record mutation required). Coordination signal only; never
// measurement-bearing and never read by discovery, ranking, or scoring.
export default function FocusAreaBoard({ room, attendees, myRsvp, user, accent, onChanged }) {
  const [busy, setBusy] = useState(null);
  const areas = room.focus_areas || [];
  const list = attendees || [];
  if (!areas.length) return null;

  const leadsFor = (key) => list.filter((a) => a.volunteer && a.focus_area === key);
  const myLead = list.find((a) => a.fellow_email === user?.email && a.volunteer && a.focus_area);

  const claim = async (key) => {
    if (!myRsvp || !user?.email) return;
    setBusy(key);
    try {
      await base44.entities.ConferenceRsvp.update(myRsvp.id, { focus_area: key, volunteer: true });
      onChanged();
    } catch {
    } finally {
      setBusy(null);
    }
  };

  const release = async () => {
    if (!myRsvp || !myLead) return;
    setBusy(myLead.focus_area);
    try {
      await base44.entities.ConferenceRsvp.update(myRsvp.id, { focus_area: '' });
      onChanged();
    } catch {
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: B.muted }}>Focus areas</p>
      {areas.map((f) => {
        const leads = leadsFor(f.key);
        const mine = myLead?.focus_area === f.key;
        return (
          <div key={f.key} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold truncate" style={{ color: B.navy }}>{f.label}</span>
              {leads.length > 0 && <AvatarCluster items={leads} accent={accent} size={18} />}
            </div>
            {mine ? (
              <button type="button" onClick={release} disabled={busy === f.key} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50 shrink-0" style={{ color: accent }}>
                {busy === f.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Leading
              </button>
            ) : (
              <button type="button" onClick={() => claim(f.key)} disabled={!myRsvp || busy === f.key} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] disabled:opacity-40 shrink-0" style={{ color: accent }}>
                {busy === f.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />} Lead
              </button>
            )}
          </div>
        );
      })}
      {!myRsvp && <p className="text-[10px] italic" style={{ color: B.muted }}>RSVP to lead a focus area.</p>}
    </div>
  );
}