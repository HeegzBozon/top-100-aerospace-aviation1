import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { hourPhase } from '@/components/core/appOpening';
import { useCountdown } from '@/components/events/useCountdown';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import HomeDock from '@/components/home-v3/HomeDock';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import StartMark from '@/components/start/StartMark';
import StartSeasonLine from '@/components/start/StartSeasonLine';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';
import { START_MENU, VOTE_OPTION } from '@/components/start/startMenuConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];

// The title screen. The app opens like a game: the hour's sky, the mark, the
// cycle's countdown, and the six surfaces one step off the dashboard.
//
// It is a menu, so the console treats it as one: the surfaces are handed to the
// ring as a picker, and the cursor it walks is the selection drawn on the keys.
// The ballot stands at the top of that list when the cycle is asking for it, so
// the wheel reaches the same action the countdown sits beside.
export default function StartScreen() {
  const navigate = useNavigate();
  const [phase] = useState(() => hourPhase());
  const [status, setStatus] = useState({ loading: true, votingEnd: null, failed: false });
  const [attempt, setAttempt] = useState(0);
  const [cursorKey, setCursorKey] = useState(START_MENU[0].key);

  useEffect(() => {
    let alive = true;
    setStatus({ loading: true, votingEnd: null, failed: false });

    base44.entities.Season
      .list('-start_date', 6)
      .then((result) => {
        if (!alive) return;
        const seasons = Array.isArray(result) ? result : result?.items || [];
        const current = seasons.find((season) => LIVE_PHASES.includes(season.status)) || seasons[0] || null;
        // The countdown reads from the season record itself, so it agrees with
        // every other surface counting the same cycle down.
        setStatus({ loading: false, failed: false, votingEnd: current?.voting_end || null });
      })
      .catch(() => {
        if (alive) setStatus({ loading: false, votingEnd: null, failed: true });
      });

    return () => {
      alive = false;
    };
  }, [attempt]);

  // The ballot is offered only while its countdown is still running, so neither
  // the button nor the cursor can land on an action that has already closed.
  const vote = useCountdown(status.votingEnd);
  const voteLive = !status.loading && !status.failed && !!status.votingEnd && !vote.done;

  // What the ring walks, top to bottom: the ballot first when it is live, then
  // the six surfaces in the order the grid draws them.
  const options = useMemo(() => (voteLive ? [VOTE_OPTION, ...START_MENU] : START_MENU), [voteLive]);

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  // The cursor is held as a key, not a position, so the list can gain the ballot
  // without the selection jumping.
  const land = useCallback((target) => {
    const list = optionsRef.current;
    if (!list.length) return null;
    if (target < 0 || target >= list.length) return null;
    cursorRef.current = list[target].key;
    setCursorKey(list[target].key);
    return list[target].label;
  }, []);

  const here = useCallback(
    () => Math.max(0, optionsRef.current.findIndex((option) => option.key === cursorRef.current)),
    [],
  );

  // The console's handle on the title screen: rotation walks the options and stops
  // at the ends of the list — a menu six keys deep reads better as a menu than as a
  // wheel — and A opens what the cursor is standing on.
  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => optionsRef.current.map((option) => option.label),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      enter: () => {
        const option = optionsRef.current.find((item) => item.key === cursorRef.current);
        if (!option?.to) return false;
        navigate(option.to);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, options.length]);

  return (
    <div className="hh-slide-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      {/* The picture plane: the hour's sky, edge to edge in the glass. The pane's
          own radius is the only thing that rounds it — nothing is inset, so no
          strip of the page behind the device shows at the picture's edges and the
          star field runs the full height of the display. */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[11px] md:min-h-screen md:rounded-none"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="relative flex min-h-0 flex-1 flex-col px-5 pb-6 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          <StartMetaRow kicker={phase.kicker} />

          <div className="mt-4 shrink-0 md:mt-10">
            <StartMark />
            <div className="mt-3 md:mt-4">
              <StartSeasonLine
                status={status}
                onRetry={() => setAttempt((n) => n + 1)}
                voteTo={voteLive ? VOTE_OPTION.to : null}
                voteSelected={cursorKey === VOTE_OPTION.key}
              />
            </div>
          </div>

          <StartSurfaceKeys cursorKey={cursorKey} />
        </div>

        {/* Desktop navigation under the title screen. */}
        <div className="hidden md:block">
          <div className="h-20" />
          <HomeDock />
        </div>
      </div>
    </div>
  );
}