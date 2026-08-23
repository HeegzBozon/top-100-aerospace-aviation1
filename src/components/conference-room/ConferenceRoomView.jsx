import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Radar, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConferenceRoomComposer from './ConferenceRoomComposer';
import ConferenceDiscoveryPanel from './ConferenceDiscoveryPanel';
import ConferenceAttendancePanel from './ConferenceAttendancePanel';
import ConferencePostEventPanel from './ConferencePostEventPanel';

// Conference Room — a three-phase instrument cluster for attendees:
// Discovery → Attendance → Post-Event. Not a flat event list.
export default function ConferenceRoomView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [roomList, rsvpList] = await Promise.all([
          base44.entities.ConferenceRoom.list('-start_date', 200),
          base44.entities.ConferenceRsvp.list('-declared_at', 1000).catch(() => []),
        ]);
        if (!alive) return;
        setRooms(roomList || []);
        setRsvps(rsvpList || []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const rsvpsByRoom = useMemo(() => {
    const m = {};
    (rsvps || []).forEach((r) => { (m[r.room_id] = m[r.room_id] || []).push(r); });
    return m;
  }, [rsvps]);

  const visibleRooms = useMemo(() => {
    const isAdmin = user?.role === 'admin';
    return (rooms || []).filter(
      (r) => r.status !== 'draft' || isAdmin || r.facilitator_email === user?.email
    );
  }, [rooms, user]);

  const discoveryRooms = visibleRooms.filter((r) => ['draft', 'open', 'live'].includes(r.status));
  const pastRooms = visibleRooms.filter((r) => ['closed', 'archived'].includes(r.status));

  const myRooms = useMemo(() => {
    if (!user?.email) return [];
    return visibleRooms
      .map((room) => {
        const attendees = rsvpsByRoom[room.id] || [];
        const myRsvp = attendees.find((a) => a.fellow_email === user.email);
        return myRsvp ? { room, myRsvp, attendees } : null;
      })
      .filter(Boolean);
  }, [visibleRooms, rsvpsByRoom, user]);

  const isEmpty = !loading && !error && visibleRooms.length === 0;
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
          Coordination rooms attached to named industry events. Declare attendance, self-organize by focus, and the record persists beyond the show.
        </p>
        {isAdmin && !isEmpty && (
          <button
            type="button"
            onClick={() => setComposerOpen((v) => !v)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
          >
            <Plus className="w-3.5 h-3.5" /> Create Room
          </button>
        )}
      </div>

      {composerOpen && isAdmin && (
        <div className="mb-5">
          <ConferenceRoomComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading mission rooms…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the rooms.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Radar className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>No mission rooms yet.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>
            Mission Rooms are coordination spaces attached to named industry events. Fellows declare attendance, self-organize by focus area, and the record persists beyond the show.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ background: accent, color: '#fff' }}
            >
              <Plus className="w-3.5 h-3.5" /> Create Room
            </button>
          )}
          {composerOpen && isAdmin && (
            <div className="w-full max-w-2xl mt-2">
              <ConferenceRoomComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <ConferenceDiscoveryPanel rooms={discoveryRooms} rsvpsByRoom={rsvpsByRoom} user={user} accent={accent} onRsvpChanged={refresh} />
          <ConferenceAttendancePanel myRooms={myRooms} user={user} accent={accent} onRsvpChanged={refresh} />
          <ConferencePostEventPanel pastRooms={pastRooms} rsvpsByRoom={rsvpsByRoom} accent={accent} />
        </div>
      )}
    </>
  );
}