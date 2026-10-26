import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import BoardColumn from '@/components/board/BoardColumn';
import HomeDock from '@/components/home-v3/HomeDock';
import { BOARD_COLUMNS, BRAND } from '@/components/board/boardConfig';
import { Loader2, RotateCcw } from 'lucide-react';

const PHASE_LABEL = {
  planning: 'In planning',
  rollover: 'Rolling over',
  nominations_open: 'Nominations open',
  voting_open: 'Voting open',
  review: 'In review',
  completed: 'Finalised',
  archived: 'Archived',
};

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];
const CLOSED_PHASES = ['completed', 'archived'];

const countOf = (result) =>
  result.status === 'fulfilled' && typeof result.value === 'number' ? result.value : null;

const statLine = (value, suffix) => (value === null ? null : `${value} ${suffix}`);

// The Board — the member's map of the platform, laid out as the T: four
// directions across for breadth, each column scrollable all the way down for
// depth. The console's ring crosses the columns; rotation moves inside one.
export default function TheBoard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const top100 = useMyTop100(user?.email);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);

    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const results = await Promise.allSettled([
        base44.entities.Season.list('-start_date', 24),
        base44.entities.CareerResource.count({ is_active: true }),
        base44.entities.DomainNetwork.count({}),
        base44.entities.Service.count({ is_active: true, is_draft: false }),
        base44.entities.Job.count({ status: 'active' }),
        base44.entities.ConferenceRoom.count({ status: 'open' }),
      ]);
      if (!alive) return;

      if (results.every((r) => r.status === 'rejected')) {
        setFailed(true);
        setLoading(false);
        return;
      }

      const [seasonResult, career, networks, availability, roles, rooms] = results;
      const seasons = seasonResult.status === 'fulfilled' ? seasonResult.value || [] : [];
      const current =
        seasons.find((s) => LIVE_PHASES.includes(s.status)) || seasons[0] || null;
      const closed = seasons.filter((s) => CLOSED_PHASES.includes(s.status)).length;

      setUser(me);
      setStats({
        phase: current ? PHASE_LABEL[current.status] || null : null,
        seasonLine: current
          ? `${current.name}${current.status ? ` · ${PHASE_LABEL[current.status] || ''}` : ''}`
          : 'No season on the calendar yet. The next cycle opens here.',
        seasonsPast: closed ? `${closed} finalised` : null,
        careerResources: statLine(countOf(career), 'curated'),
        networks: statLine(countOf(networks), 'standing'),
        availability: statLine(countOf(availability), 'available'),
        openRoles: statLine(countOf(roles), 'open'),
        roomsOpen: statLine(countOf(rooms), 'open'),
      });
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [attempt]);

  const placed = top100.rankings.length;
  const columnStats = { ...stats, ballotSlots: placed ? `${placed} of 8 placed` : null };

  if (loading) {
    return (
      <div
        className="hh-slide-window flex flex-col items-center justify-center gap-3 md:h-auto md:min-h-screen"
        style={{ background: BRAND.cream }}
      >
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: BRAND.copper }} />
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(30,58,90,0.5)' }}
        >
          Reading the board
        </span>
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className="hh-slide-window flex flex-col items-center justify-center gap-4 px-8 text-center md:h-auto md:min-h-screen"
        style={{ background: BRAND.cream }}
      >
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em]"
          style={{ color: BRAND.copper }}
        >
          The Board
        </span>
        <p className="max-w-xs font-heading text-lg" style={{ color: BRAND.navy }}>
          The board could not be read. Nothing is lost — it will read again.
        </p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ background: BRAND.navy, color: BRAND.cream }}
        >
          <RotateCcw className="h-[11px] w-[11px]" /> Read it again
        </button>
      </div>
    );
  }

  return (
    <div
      className="hh-slide-window flex flex-col md:block md:h-auto md:min-h-screen"
      style={{ background: BRAND.cream }}
    >
      <header className="hidden px-6 pt-8 md:block">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{ color: BRAND.copper }}
        >
          The Board
        </p>
        <h1 className="mt-2 font-heading text-3xl" style={{ color: BRAND.navy }}>
          Four directions across. Depth inside each one.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.66)' }}>
          Sideways is the breadth of the platform. Down a column is a single topic in full.
          The wheel crosses the columns; turn it to go deeper.
        </p>
      </header>

      <div
        className="flex items-center justify-between gap-2 px-3 py-2 md:hidden"
        style={{ borderBottom: '1px solid rgba(30,58,90,0.10)' }}
      >
        <span
          className="text-[7.5px] font-bold uppercase tracking-[0.26em]"
          style={{ color: BRAND.copper }}
        >
          Sideways for breadth
        </span>
        <span
          className="text-[7.5px] font-bold uppercase tracking-[0.26em]"
          style={{ color: 'rgba(30,58,90,0.45)' }}
        >
          ◀▶ Columns · ▼ Depth
        </span>
      </div>

      <div
        data-hh-track
        className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-3 pb-3 scrollbar-hide md:grid md:h-auto md:grid-cols-4 md:gap-5 md:overflow-visible md:px-6 md:pb-10 md:pt-6"
      >
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column.key}
            column={column}
            stats={columnStats}
            live={column.key === 'season' ? columnStats.seasonLine : null}
          />
        ))}
      </div>

      {/* Desktop navigation and breathing room under the columns. */}
      <div className="hidden h-28 md:block" />
      <HomeDock />
    </div>
  );
}