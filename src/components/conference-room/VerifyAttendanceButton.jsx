import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { phaseForRoom } from './conferenceRoomConfig';

// Facilitator/admin verifies a room's attendance roster after the event
// ends. Promotes declared RSVPs into verified ConferenceAttendance records
// via the backend function (service-role write). The verified stamp then
// feeds the Fellow's Flightography. Declared attendance never self-attests.
export default function VerifyAttendanceButton({ room, user, accent, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const canVerify = user?.role === 'admin' || (!!user?.email && room.facilitator_email === user.email);
  const ended = phaseForRoom(room) === 'done';
  if (!canVerify || !ended || room.attendance_verified) return null;

  const run = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await base44.functions.invoke('verifyConferenceAttendance', { room_id: room.id });
      const data = res?.data ?? res;
      setMsg(`Verified ${data?.verified ?? 0} attendees.`);
      onChanged();
    } catch {
      setMsg('Verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
        style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />} Verify attendance
      </button>
      {msg && <span className="text-[10px]" style={{ color: B.muted }}>{msg}</span>}
    </div>
  );
}