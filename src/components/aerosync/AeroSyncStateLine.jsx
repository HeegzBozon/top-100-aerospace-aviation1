import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { phaseForRoom, roomCountdown } from '@/components/conference-room/conferenceRoomConfig';
import { formatDay } from '@/components/crm/crmConfig';

const LIVE_STATUSES = ['open', 'live'];

// What the title screen is standing over, read once: how much of the field the Fellow has
// kept, and where the next show is. Two lines, because the CRM has two readings — the
// rolodex and the rooms — and each is its own query, so one going down never blanks the
// other. Loading, a failure with a way to read it again, and an empty calendar are all
// states of the same line: the screen never shows a blank where a number belongs.
export default function AeroSyncStateLine() {
  const [status, setStatus] = useState({ loading: true, failed: false, count: null, next: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus((prev) => ({ ...prev, loading: true, failed: false }));

    (async () => {
      const me = await base44.auth.me().catch(() => null);

      const [kept, rooms] = await Promise.allSettled([
        me ? base44.entities.ConferenceContact.count({ created_by_id: me.id }) : Promise.resolve(null),
        base44.entities.ConferenceRoom.list('-start_date', 20),
      ]);
      if (!alive) return;

      const count = kept.status === 'fulfilled' && typeof kept.value === 'number' ? kept.value : null;
      const rows =
        rooms.status === 'fulfilled'
          ? Array.isArray(rooms.value)
            ? rooms.value
            : rooms.value?.items || []
          : [];
      const next =
        rows
          .filter((room) => LIVE_STATUSES.includes(room.status) && phaseForRoom(room) !== 'done')
          .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0))[0] || null;

      setStatus({
        loading: false,
        failed: kept.status === 'rejected' || rooms.status === 'rejected',
        count,
        next,
      });
    })();

    return () => {
      alive = false;
    };
  }, [attempt]);

  const chip = status.next ? roomCountdown(status.next) : null;
  const where = [status.next?.city, status.next?.country].filter(Boolean).join(', ');

  return (
    <div className="flex min-h-[16px] shrink-0 flex-col gap-1 text-[9px] tracking-[0.06em] text-editorial-cream/55 md:text-[11px]">
      <p className="flex flex-wrap items-center gap-2">
        {status.loading ? (
          <span className="text-editorial-cream/45">Reading the rolodex…</span>
        ) : status.count === null ? (
          <>
            <span className="text-editorial-cream/45">
              {status.failed ? 'Rolodex unavailable.' : 'Your rolodex, private to you.'}
            </span>
            {status.failed ? (
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="flex items-center gap-1 uppercase tracking-[0.18em] text-editorial-gold"
              >
                <RotateCcw className="h-[10px] w-[10px]" /> Read again
              </button>
            ) : null}
          </>
        ) : (
          <>
            <span className="text-editorial-cream/75">
              {status.count} contact{status.count === 1 ? '' : 's'} kept
            </span>
            <span className="text-editorial-cream/30">·</span>
            <span className="uppercase tracking-[0.18em]">private to you</span>
          </>
        )}
      </p>

      <p>
        {status.loading ? (
          <span className="text-editorial-cream/45">Looking for the next room…</span>
        ) : status.next ? (
          <>
            Next room <span className="text-editorial-cream/30">·</span>{' '}
            <span className="text-editorial-gold">{status.next.conference_name}</span>
            {where ? ` · ${where}` : ''}
            {chip ? ` · ${chip.label}` : status.next.start_date ? ` · ${formatDay(status.next.start_date)}` : ''}
          </>
        ) : (
          <span className="text-editorial-cream/45">No room open on the calendar yet.</span>
        )}
      </p>
    </div>
  );
}