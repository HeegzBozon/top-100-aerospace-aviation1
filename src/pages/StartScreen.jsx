import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hourPhase } from '@/components/core/appOpening';
import { useCountdown } from '@/components/events/useCountdown';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import HomeDock from '@/components/home-v3/HomeDock';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import StartMark from '@/components/start/StartMark';
import StartSeasonLine from '@/components/start/StartSeasonLine';
import PublicationCountdown from '@/components/start/PublicationCountdown';
import StartTitleActions from '@/components/start/StartTitleActions';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';
import { ACCOUNT_KEYS, NOTIFY_OPTION, START_MENU, startMenuFor, VOTE_OPTION } from '@/components/start/startMenuConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];

// The title screen. The app opens like a game: the hour's sky, the mark, the
// cycle's countdown, and the surfaces one step off the dashboard. The cycle's stamp
// is read at the foot: the device prints it in the band across the foot of the glass,
// and a desk closes the page with it.
//
// It is a menu, so the console treats it as one: the surfaces are handed to the
// ring as a picker, and the cursor it walks is the selection drawn on the keys.
// The ballot stands at the top of that list when the cycle is asking for it, so
// the wheel reaches the same action the countdown sits beside — and the publishing
// alert stands next to it, the ring opening its field where the key would.
export default function StartScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const signedIn = !!user;
  const [phase] = useState(() => hourPhase());
  const [status, setStatus] = useState({ loading: true, votingEnd: null, failed: false });
  const [attempt, setAttempt] = useState(0);
  const [cursorKey, setCursorKey] = useState(START_MENU[0].key);
  const [notifyOpen, setNotifyOpen] = useState(false);

  // The menu is the platform's, not the operator's: the surfaces whoever is standing here
  // is entitled to — reading, nominating and the published edition for anyone at all, the
  // ballot and a Fellow's own surfaces for a Fellow — and, for the few who run it, one
  // extra key at the end of the row.
  const menuItems = useMemo(
    () => startMenuFor({ isAdmin: user?.role === 'admin', isSignedIn: signedIn }),
    [user?.role, signedIn],
  );

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
  // Measuring is a Fellow's work: the ballot is drawn for one, and a visitor is offered
  // the way in where it would stand.
  const voteLive = signedIn && !status.loading && !status.failed && !!status.votingEnd && !vote.done;

  // What the ring walks, top to bottom: the two things the title screen is asking
  // for — the ballot while its cycle is running, or the way in for whoever has no
  // account yet — then the publishing alert for a reader who will not be watching on the
  // day, then the surfaces, in the order the grid draws them.
  const options = useMemo(
    () => [
      ...(signedIn ? (voteLive ? [VOTE_OPTION] : []) : ACCOUNT_KEYS),
      NOTIFY_OPTION,
      ...menuItems,
    ],
    [signedIn, voteLive, menuItems],
  );

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;
  const notifyRef = useRef(notifyOpen);
  notifyRef.current = notifyOpen;

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
        if (!option) return false;
        // The alert is not a cartridge: the ring opens its field where you stand.
        if (option.key === NOTIFY_OPTION.key) {
          setNotifyOpen(true);
          return true;
        }
        // Nor is the way in: it is the platform's own door, which signs a Fellow in and
        // opens the account a visitor has not made yet. Whoever walks through it is taken
        // to their own profile — the home surface — rather than back to this screen, so
        // signing in visibly arrives somewhere.
        if (option.action) {
          base44.auth.redirectToLogin('/Profile');
          return true;
        }
        if (!option.to) return false;
        navigate(option.to);
        return true;
      },
      // A field the ring opened is closed by the ring before anything else.
      back: () => {
        if (!notifyRef.current) return false;
        setNotifyOpen(false);
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, options.length]);

  return (
    /* hh-scroll-window / hh-scroll-plane / hh-scroll-page: while the keys are up
       this surface stops being one glass tall and clipped to it, and becomes a page
       the picture can scroll — which is what leaves room for the address a reader is
       typing into. Three levels are named so the change is deterministic: each stops
       being a flex track and takes its own height. */
    <div className="hh-slide-window hh-scroll-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      {/* The picture plane: the hour's sky, edge to edge in the glass. Nothing is
          inset and nothing is rounded, so no strip of the page behind the device
          shows at the picture's edges and the star field runs the full height of the
          display, straight into the strip across the head of the glass: the bar above
          carries the glass's own arc, and the sky fills the corners under it, square.
          The foot is square for the same reason — the picture ends on the readout
          band, where the glass is still running straight. */}
      <div
        className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-screen"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-5 pb-3 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          {/* The masthead, the cycle read twice on its own two lines, and then the
              two keys the title screen asks for standing together in one row. */}
          <div className="hh-title-block mt-4 shrink-0 md:mt-10">
            <StartMark />
            <div className="mt-3 md:mt-4">
              <StartSeasonLine status={status} onRetry={() => setAttempt((n) => n + 1)} />
              <PublicationCountdown />
              <StartTitleActions
                signedIn={signedIn}
                voteLive={voteLive}
                selectedKey={cursorKey}
                notifyOpen={notifyOpen}
                onNotifyChange={setNotifyOpen}
                notifySelected={cursorKey === NOTIFY_OPTION.key}
              />
            </div>
          </div>

          <StartSurfaceKeys items={menuItems} cursorKey={cursorKey} />

          {/* The stamp closes the screen on a desk. On the phone the same stamp is
              printed on the device itself, in the band across the foot of the glass,
              where the machine's readout belongs. */}
          <div className="mt-8 hidden md:block">
            <StartMetaRow />
          </div>
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