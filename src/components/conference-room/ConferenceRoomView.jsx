import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Radar, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConferenceRoomCard from './ConferenceRoomCard';
import ConferenceRoomComposer from './ConferenceRoomComposer';

// Conference Room cluster — coordination surfaces attached to named external
// industry events. Rooms are admin-created (concierge); RSVPs are Fellow-owned.
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

  const upcoming = visibleRooms.filter((r) => ['draft', 'open', 'live'].includes(r.status));
  const past = visibleRooms.filter((r) => ['closed', 'archived'].includes(r.status));
  const isEmpty = !loading && !error && visibleRooms.length === 0;
  const isAdmin = user?.role === 'admin';

  return (
    <>
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
        <>
          <div className="flex items-center justify-end mb-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setComposerOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
                style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
              >
                <Plus className="w-3.5 h-3.5" /> Create Room
              </button>
            )}
          </div>

          {composerOpen && isAdmin && (
            <div className="mb-4">
              <ConferenceRoomComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
            </div>
          )}

          {upcoming.length > 0 && (
            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Upcoming & live</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {upcoming.map((r) => (
                  <ConferenceRoomCard key={r.id} room={r} attendees={rsvpsByRoom[r.id] || []} user={user} accent={accent} onRsvpChanged={refresh} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Past</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 opacity-80">
                {past.map((r) => (
                  <ConferenceRoomCard key={r.id} room={r} attendees={rsvpsByRoom[r.id] || []} user={user} accent={accent} onRsvpChanged={refresh} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}