import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Radar, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConferenceRoomComposer from './ConferenceRoomComposer';
import ConferenceKanbanColumn from './ConferenceKanbanColumn';
import ConferenceKanbanCard from './ConferenceKanbanCard';
import ConferenceViewSwitcher from './ConferenceViewSwitcher';
import ConferenceSwimLane from './ConferenceSwimLane';
import { DISCIPLINES, disciplineLabel, phaseForStatus, CONFERENCE_VIEWS } from './conferenceRoomConfig';
import { getContinent } from '@/components/publication/countryToContinentMap';

const CONTINENT_ORDER = ['North America', 'Europe', 'Asia', 'South America', 'Oceania', 'Africa', 'Antarctica'];

const byDateAsc = (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0);

// Conference Room — a board that can be viewed by lifecycle (default 3-column
// Kanban) or regrouped into horizontal swim lanes by Domain, Series, Region,
// or Attendance.
export default function ConferenceRoomView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState('lifecycle');

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

  const myRoomIds = useMemo(() => {
    const s = new Set();
    (rsvps || []).forEach((r) => {
      if (r.fellow_email === user?.email && r.room_id) s.add(r.room_id);
    });
    return s;
  }, [rsvps, user]);

  // Lifecycle columns (default view).
  const upcomingRooms = visibleRooms.filter((r) => ['draft', 'open'].includes(r.status)).sort(byDateAsc);
  const liveRooms = visibleRooms.filter((r) => r.status === 'live').sort(byDateAsc);
  const doneRooms = visibleRooms.filter((r) => ['closed', 'archived'].includes(r.status)).sort(byDateAsc);

  // Swim-lane grouping for the selected view.
  const lanes = useMemo(() => {
    if (view === 'lifecycle') return [];
    const groups = new Map();

    const ensure = (key, label) => {
      if (!groups.has(key)) groups.set(key, { key, label, rooms: [] });
      return groups.get(key);
    };

    const laneKeyFor = (r) => {
      if (view === 'domain') return r.domain_focus || 'uncategorized';
      if (view === 'series') return r.conference_series || 'standalone';
      if (view === 'region') return getContinent(r.country) || 'unspecified';
      return myRoomIds.has(r.id) ? 'mine' : 'network';
    };
    const laneLabelFor = (key) => {
      if (view === 'domain') return disciplineLabel(key);
      if (view === 'series') return key === 'standalone' ? 'Standalone' : key;
      if (view === 'region') return key === 'unspecified' ? 'Unspecified' : key;
      return key === 'mine' ? 'My rooms' : 'Network';
    };

    visibleRooms.forEach((r) => {
      const key = laneKeyFor(r);
      ensure(key, laneLabelFor(key)).rooms.push(r);
    });

    let list = Array.from(groups.values()).map((g) => ({ ...g, rooms: g.rooms.sort(byDateAsc) }));

    // Lane ordering per view.
    if (view === 'domain') {
      const order = DISCIPLINES.map((d) => d.key);
      list.sort((a, b) => {
        const ai = order.indexOf(a.key); const bi = order.indexOf(b.key);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    } else if (view === 'region') {
      list.sort((a, b) => CONTINENT_ORDER.indexOf(a.label) - CONTINENT_ORDER.indexOf(b.label));
    } else if (view === 'attending') {
      list.sort((a, b) => (a.key === 'mine' ? -1 : 1));
    } else {
      list.sort((a, b) => b.rooms.length - a.rooms.length || a.label.localeCompare(b.label));
    }

    return list;
  }, [view, visibleRooms, myRoomIds]);

  const isEmpty = !loading && !error && visibleRooms.length === 0;
  const isAdmin = user?.role === 'admin';

  const renderCard = (r) => (
    <ConferenceKanbanCard
      key={r.id}
      room={r}
      attendees={rsvpsByRoom[r.id] || []}
      user={user}
      accent={accent}
      phase={phaseForStatus(r.status)}
      onRsvpChanged={refresh}
    />
  );

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
            Coordination rooms attached to named industry events. Rooms progress Upcoming → In Progress → Done as the event lifecycle advances.
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
        {!isEmpty && (
          <ConferenceViewSwitcher views={CONFERENCE_VIEWS} active={view} onChange={setView} accent={accent} />
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
      ) : view === 'lifecycle' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConferenceKanbanColumn label="Upcoming" dot={accent} count={upcomingRooms.length} emptyHint="No upcoming rooms.">
            {upcomingRooms.map(renderCard)}
          </ConferenceKanbanColumn>
          <ConferenceKanbanColumn label="In Progress" dot={B.gold} count={liveRooms.length} emptyHint="No rooms in progress.">
            {liveRooms.map(renderCard)}
          </ConferenceKanbanColumn>
          <ConferenceKanbanColumn label="Done" dot={B.muted} count={doneRooms.length} emptyHint="No completed rooms yet.">
            {doneRooms.map(renderCard)}
          </ConferenceKanbanColumn>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {lanes.map((lane) => (
            <ConferenceSwimLane
              key={lane.key}
              label={lane.label}
              dot={accent}
              count={lane.rooms.length}
              emptyHint={view === 'attending' && lane.key === 'mine' ? "You haven't declared attendance yet." : 'No rooms in this lane.'}
            >
              {lane.rooms.map(renderCard)}
            </ConferenceSwimLane>
          ))}
        </div>
      )}
    </>
  );
}