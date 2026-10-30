import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMyTop100 } from '@/components/fellow-home/useMyTop100';
import { resolveCommitteePhase } from '@/components/fellow-home/season/useCommitteePhase';
import AheadBand from '@/components/board/AheadBand';
import BoardColumn from '@/components/board/BoardColumn';
import CheckInColumn from '@/components/board/CheckInColumn';
import SeasonBand from '@/components/board/SeasonBand';
import { useCheckIn } from '@/components/board/useCheckIn';
import FlightDeck from '@/components/flight-deck/FlightDeck';
import { BOARD_COLUMNS, BRAND } from '@/components/board/boardConfig';
import useBoardCards from '@/components/board/useBoardCards';
import useGlass from '@/hooks/useGlass';
import { Loader2, RotateCcw } from 'lucide-react';
import { useNavHint } from '@/components/handheld/faceHint';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];
const CLOSED_PHASES = ['completed', 'archived'];

const countOf = (result) =>
  result.status === 'fulfilled' && typeof result.value === 'number' ? result.value : null;

const statLine = (value, suffix) => (value === null ? null : `${value} ${suffix}`);

// The Dashboard — the member's map of the platform, laid out as the T: a check-in
// column for the Fellow's own loop, then four directions across for breadth,
// each scrollable all the way down for depth. The console's ring crosses the
// columns; rotation moves inside one.
export default function TheBoard() {
  const keyHint = useNavHint();
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, failed: false });
  const [attempt, setAttempt] = useState(0);

  const top100 = useMyTop100(data?.user?.email);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

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

      if (results.every((result) => result.status === 'rejected')) {
        setState({ loading: false, failed: true });
        return;
      }

      const seasons = results[0].status === 'fulfilled' ? results[0].value || [] : [];
      const current = seasons.find((season) => LIVE_PHASES.includes(season.status)) || seasons[0] || null;

      setData({
        user: me,
        current,
        closed: seasons.filter((season) => CLOSED_PHASES.includes(season.status)).length,
        counts: {
          career: countOf(results[1]),
          networks: countOf(results[2]),
          availability: countOf(results[3]),
          roles: countOf(results[4]),
          rooms: countOf(results[5]),
        },
      });
      setState({ loading: false, failed: false });
    })();

    return () => {
      alive = false;
    };
  }, [attempt]);

  // The committee's own resolver, so the board and the masthead never disagree
  // about where the season stands.
  const phase = useMemo(() => (data ? resolveCommitteePhase(data.current) : null), [data]);

  const placed = top100.rankings.length;

  const checkIn = useCheckIn(data?.user, {
    placed,
    phase,
    openRoles: data?.counts?.roles || 0,
    roomsOpen: data?.counts?.rooms || 0,
  });

  // The ring's cursor over the cards. Armed once the board is whole, and only
  // inside the glass: the desk draws all five columns at once, so it needs no
  // cursor to say where you are.
  const glass = useGlass();
  const { selectedKey } = useBoardCards({
    checkIn,
    enabled: glass && !state.loading && !state.failed,
  });

  const stats = useMemo(() => {
    if (!data) return {};
    const { counts, current, closed } = data;
    return {
      seasonsPast: closed ? `${closed} finalised` : null,
      ballotSlots: placed ? `${placed} of 8 placed` : null,
      careerResources: statLine(counts.career, 'curated'),
      networks: statLine(counts.networks, 'standing'),
      availability: statLine(counts.availability, 'available'),
      openRoles: statLine(counts.roles, 'open'),
      roomsOpen: statLine(counts.rooms, 'open'),
      seasonLine: current
        ? `${current.name}${current.status ? ` · ${phase?.label || ''}` : ''}`
        : 'No season on the calendar yet. The next cycle opens here.',
    };
  }, [data, phase, placed]);

  if (state.loading) {
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
          Reading the dashboard
        </span>
      </div>
    );
  }

  if (state.failed) {
    return (
      <div
        className="hh-slide-window flex flex-col items-center justify-center gap-4 px-8 text-center md:h-auto md:min-h-screen"
        style={{ background: BRAND.cream }}
      >
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em]"
          style={{ color: BRAND.copper }}
        >
          Dashboard
        </span>
        <p className="max-w-xs font-heading text-lg" style={{ color: BRAND.navy }}>
          The dashboard could not be read. Nothing is lost — it will read again.
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

  const board = (
    <>
      <header className="hidden px-6 pt-8 md:block">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{ color: BRAND.copper }}
        >
          Dashboard
        </p>
        <h1 className="mt-2 font-heading text-3xl" style={{ color: BRAND.navy }}>
          Check in, then four directions across.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(26,26,26,0.66)' }}>
          Sideways is the breadth of the platform. Down a column is a single topic in full.
          The wheel crosses the columns; turn it to go deeper.
        </p>
      </header>

      <div
        className="mx-3 mt-2 flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 md:hidden"
        style={{ background: '#FFFFFF', border: '1px solid rgba(30,58,90,0.12)' }}
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
          {keyHint({ walk: 'Columns', open: 'Depth' })}
        </span>
      </div>

      <div
        data-hh-track
        className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-3 pb-3 scrollbar-hide md:grid md:h-auto md:grid-cols-2 md:gap-5 md:overflow-visible md:px-6 md:pb-10 md:pt-6 lg:grid-cols-3 xl:grid-cols-6"
      >
        {BOARD_COLUMNS.map((column) =>
          column.kind === 'check-in' ? (
            <CheckInColumn
              key={column.key}
              column={column}
              checkIn={checkIn}
              user={data?.user}
              selectedKey={selectedKey}
            />
          ) : (
            <BoardColumn
              key={column.key}
              column={column}
              stats={stats}
              selectedKey={selectedKey}
              live={column.key === 'season' ? stats.seasonLine : null}
              band={
                column.key === 'season' ? (
                  <SeasonBand phase={phase} loading={state.loading} />
                ) : column.key === 'ahead' ? (
                  <AheadBand />
                ) : null
              }
            />
          ),
        )}
      </div>

      {/* Clearance under the columns for the dock the deck carries. */}
      <div className="hidden h-28 md:block" />
    </>
  );

  return (
    <>
      {/* A phone gets the handheld's own page, exactly as it was: the glass, the
          ring, and four directions across. */}
      <div className="hh-slide-window flex flex-col md:hidden" style={{ background: BRAND.cream }}>
        {board}
      </div>

      {/* A desk gets the same board seated in the Flight Deck, inside the machine. */}
      <div className="hidden h-full md:block">
        <FlightDeck data={data} stats={stats} phase={phase} placed={placed}>
          {board}
        </FlightDeck>
      </div>
    </>
  );
}