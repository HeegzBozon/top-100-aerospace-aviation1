import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Scissors, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { phaseFromDates } from '@/components/event-energy/eventEnergy';
import ConferenceKanbanColumn from '@/components/conference-room/ConferenceKanbanColumn';
import RibbonCuttingCard from './RibbonCuttingCard';
import RibbonCuttingComposer from './RibbonCuttingComposer';
import { isMilestone } from './ribbonCuttingConfig';

const byDateAsc = (a, b) => new Date(a.event_date || 0) - new Date(b.event_date || 0);

// Ribbon Cuttings — the Chamber's member-milestone convening surface. Surfaces
// Events tagged with a milestone ritual (Ribbon Cutting, Demo Day, Incubator
// Milestone) in the same lifecycle Kanban as Conference Room. RSVPs toggle the
// Event attendees array. Admins can publish a new cutting inline.
export default function RibbonCuttingsView({ user, accent = B.navy }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [events, setEvents] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const list = await base44.entities.Event.list('-event_date', 200);
        if (!alive) return;
        setEvents((list || []).filter(isMilestone));
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [refreshKey]);

  const { upcoming, live, done } = useMemo(() => {
    const phase = (e) => phaseFromDates(e.event_date, e.event_end_date);
    return {
      upcoming: events.filter((e) => phase(e) === 'upcoming').sort(byDateAsc),
      live: events.filter((e) => phase(e) === 'live').sort(byDateAsc),
      done: events.filter((e) => phase(e) === 'ended').sort(byDateAsc),
    };
  }, [events]);

  const isEmpty = !loading && !error && events.length === 0;
  const isAdmin = user?.role === 'admin';
  const renderCard = (e) => (
    <RibbonCuttingCard key={e.id} event={e} user={user} accent={accent} onRsvpChanged={refresh} />
  );

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] leading-relaxed max-w-md" style={{ color: B.muted }}>
            Member-company milestones — grand openings, demo days, and build milestones the Chamber convenes around its Fellows.
          </p>
          {isAdmin && !isEmpty && (
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
              style={{ background: composerOpen ? B.navy : `${accent}10`, color: composerOpen ? '#fff' : accent, border: `1px solid ${accent}33` }}
            >
              <Plus className="w-3.5 h-3.5" /> New Cutting
            </button>
          )}
        </div>
      </div>

      {composerOpen && isAdmin && (
        <div className="mb-5 max-w-md">
          <RibbonCuttingComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: B.muted }} />
          <p className="text-xs" style={{ color: B.muted }}>Loading ribbon cuttings…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <AlertCircle className="w-6 h-6" style={{ color: B.muted }} />
          <p className="text-sm font-semibold" style={{ color: B.navy }}>Couldn't load the cuttings.</p>
          <button onClick={refresh} className="text-xs font-semibold" style={{ color: accent }}>Try again</button>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Scissors className="w-8 h-8" style={{ color: accent }} />
          <p className="text-sm font-bold" style={{ color: B.navy }}>No ribbon cuttings yet.</p>
          <p className="text-xs max-w-sm" style={{ color: B.muted }}>
            Ribbon Cuttings are the Chamber's way of convening around a member's milestone — a launch, a demo day, a grand opening. The record persists beyond the celebration.
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ background: accent, color: '#fff' }}
            >
              <Plus className="w-3.5 h-3.5" /> New Cutting
            </button>
          )}
          {composerOpen && isAdmin && (
            <div className="w-full max-w-md mt-2">
              <RibbonCuttingComposer user={user} accent={accent} onSubmitted={() => { setComposerOpen(false); refresh(); }} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConferenceKanbanColumn label="Upcoming" dot={accent} count={upcoming.length} emptyHint="No upcoming cuttings.">
            {upcoming.map(renderCard)}
          </ConferenceKanbanColumn>
          <ConferenceKanbanColumn label="In Progress" dot={B.gold} count={live.length} emptyHint="No cuttings in progress.">
            {live.map(renderCard)}
          </ConferenceKanbanColumn>
          <ConferenceKanbanColumn label="Done" dot={B.muted} count={done.length} emptyHint="No completed cuttings yet.">
            {done.map(renderCard)}
          </ConferenceKanbanColumn>
        </div>
      )}
    </>
  );
}