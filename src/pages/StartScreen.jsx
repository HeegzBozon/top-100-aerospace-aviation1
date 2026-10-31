import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hourPhase } from '@/components/core/appOpening';
import { useCountdown } from '@/components/events/useCountdown';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import revealCursor from '@/components/handheld/revealCursor';
import DesktopStartScreen from '@/components/desktop/start/DesktopStartScreen';
import StartSky from '@/components/start/StartSky';
import StartMark from '@/components/start/StartMark';
import StartCycleReadout from '@/components/start/StartCycleReadout';
import StartTitleActions from '@/components/start/StartTitleActions';
import NotifyMe from '@/components/start/NotifyMe';
import TitleVotePill from '@/components/start/TitleVotePill';
import TitleCardQr from '@/components/start/TitleCardQr';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';
import { ACCOUNT_KEYS, NOTIFY_OPTION, START_MENU, startMenuFor, VOTE_OPTION } from '@/components/start/startMenuConfig';
import { loadWomenIssue } from '@/components/magazine/womenEdition';
import { issueStatus, progressCta, readIssueProgress } from '@/lib/readingProgress';

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
  const [womenIssue, setWomenIssue] = useState(null);
  // The Fellow's own ballot, as it stands: the program's key reports it, so the card that
  // asks for a hundred names says how many of them are already in order.
  const [ballotCount, setBallotCount] = useState(null);

  useEffect(() => {
    if (!signedIn) {
      setBallotCount(null);
      return undefined;
    }
    let alive = true;
    base44.entities.UserTop100List.filter({ user_email: user.email }, { limit: 1 })
      .then((page) => {
        if (!alive) return;
        const list = (page?.items || [])[0];
        setBallotCount((list?.rankings || []).length);
      })
      .catch(() => {
        if (alive) setBallotCount(null);
      });
    return () => {
      alive = false;
    };
  }, [signedIn, user?.email]);

  // The menu is the platform's, not the operator's: the surfaces whoever is standing here
  // is entitled to — reading, nominating and the published edition for anyone at all, the
  // ballot and a Fellow's own surfaces for a Fellow — and, for the few who run it, one
  // extra key at the end of the row.
  const menuItems = useMemo(() => {
    const progress = readIssueProgress(womenIssue?.id);
    const status = issueStatus(progress);
    return startMenuFor({ isAdmin: user?.role === 'admin', isSignedIn: signedIn }).map((item) => {
      // The ballot's key carries the ballot's own progress — x of the hundred it asks for.
      if (item.key === 'nominate') {
        return ballotCount === null ? item : { ...item, progressLabel: `${ballotCount}/100` };
      }
      if (item.key !== 'results') return item;
      return {
        ...item,
        // The edition can be handed on from its own card whether or not this machine can
        // reach the issue record itself.
        shareUrl: `${window.location.origin}/women-2025`,
        ...(womenIssue
          ? {
            // The edition reports the reader's own place in it, and how it was gone
            // through: Start before it is begun, Resume while it is being read, and
            // Read again once it is finished — read or skimmed either way.
            cta: progressCta(progress),
            progress: progress || null,
            status,
            // A reader who has begun the issue is taken to the issue itself rather than
            // through the route that resolves one — and Read again opens it at its front,
            // with this reader's pass on it wiped, so the second reading starts clean.
            to: !progress
              ? item.to
              : status.finished
                ? `/magazine/${womenIssue.id}?restart=1`
                : `/magazine/${womenIssue.id}`,
          }
          : {}),
      };
    });
  }, [user?.role, signedIn, womenIssue, ballotCount]);

  // Which issue the edition stands for, so its key can report the reader's place in it.
  // A title screen that cannot reach the issue still draws, worded plainly as a way in.
  useEffect(() => {
    let alive = true;
    loadWomenIssue()
      .then((issue) => alive && setWomenIssue(issue))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

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

  // The front door is a menu, never a gate. The ballot is offered on it — first in the row
  // while its cycle is counting — but arriving at the title screen must land on the title
  // screen: a redirect from here made Home unreachable, because Home is this surface, and
  // every press of it bounced straight back into the ballot. The way in from a campaign is
  // the door itself: signing in during a live cycle lands on the ballot, once.

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
  // The console's handle is built once, so the live state it reads is held in a ref
  // beside it rather than captured on the render it was made on.
  const voteLiveRef = useRef(voteLive);
  voteLiveRef.current = voteLive;
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
      // The number printed on the key the cursor is standing on — nothing for the two
      // asks, which print no number — so the radio's display shows the figure a hand
      // would press rather than the option's place in the list.
      code: () => optionsRef.current[here()]?.index || null,
      // The number printed on a key is what the console's keypad types: a Fellow reads
      // 03 on the Edit profile key, presses 3, and the key is pressed — the cursor lands
      // on it and it opens, so a numbered key is a key rather than a way to point at one.
      goToCode: (code) => {
        const wanted = String(code).padStart(2, "0");
        const target = optionsRef.current.findIndex((option) => option.index === wanted);
        if (target < 0) return null;
        const label = land(target);
        if (label) api.current.enter();
        return label;
      },
      enter: () => {
        const option = optionsRef.current.find((item) => item.key === cursorRef.current);
        if (!option) return false;
        // The alert is not a cartridge: the ring opens its field where you stand.
        if (option.key === NOTIFY_OPTION.key) {
          setNotifyOpen(true);
          return true;
        }
        // Nor is the way in: it is the platform's own door, which signs a Fellow in and
        // opens the account a visitor has not made yet. Whoever walks through it during a
        // live cycle is taken to the ballot rather than back to this screen — the work the
        // campaign is asking for is the first thing they are given.
        if (option.action) {
          base44.auth.redirectToLogin(voteLiveRef.current ? '/selection-committee?tab=vote' : '/Profile');
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

  // The ring can land on an ask as easily as on a key, so the reveal is done once for
  // the whole list: whichever option is lit, the glass brings it into view.
  useEffect(() => {
    revealCursor(cursorKey);
  }, [cursorKey]);

  return (
    <>
      {/* The desk opens on the cover rather than on the keypad: the same menu, the same
          actions and the same season record, drawn as a magazine front instead of as a
          control panel. */}
      <div className="hidden md:block">
        <DesktopStartScreen
          user={user}
          phase={phase}
          status={status}
          onRetry={() => setAttempt((n) => n + 1)}
          menuItems={menuItems}
          signedIn={signedIn}
          voteLive={voteLive}
          vote={vote}
          notifyOpen={notifyOpen}
          onNotifyChange={setNotifyOpen}
        />
      </div>

      <div className="md:hidden">
        {/* The cover is the glass: the masthead with the badge beside it, the cycle on one
            instrument band, the two asks, then the keys taking whatever height is left.
            Nothing here is taller than the picture, so the whole title screen is read at a
            glance and the reader never scrolls to find a key. */}
        <div
          className="hh-scroll-window relative flex min-h-full flex-col"
          style={{ background: phase.sky }}
        >
          {/* The picture plane: the hour's sky, edge to edge in the glass. Nothing is
              inset and nothing is rounded, so no strip of the page behind the device
              shows at the picture's edges and the star field runs the full height of the
              display, straight into the strip across the head of the glass: the bar above
              carries the glass's own arc, and the sky fills the corners under it, square.
              The foot is square for the same reason — the picture ends on the readout
              band, where the glass is still running straight. */}
          <div
            className="hh-scroll-plane relative flex min-h-full flex-1 flex-col"
            style={{ background: phase.sky }}
          >
            <StartSky phase={phase} />

            <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-4 pb-2 pt-3">
              {/* The masthead, with the badge beside it — printed at a size a camera reads
                  across a table, so a card is handed over without a tap at all, and tapping
                  it opens the badge full screen. */}
              <div className="hh-title-block flex shrink-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <StartMark />
                </div>
                <TitleCardQr user={user} />
              </div>

              {/* The cycle on one band, then the two asks on one row: both read under the
                  masthead rather than beside the badge, so each gets the full measure of
                  the glass instead of wrapping into the other's column. */}
              <StartCycleReadout
                status={status}
                onRetry={() => setAttempt((n) => n + 1)}
                /* Each ask stands on the reading that answers it: the ballot under the
                   close, the publishing alert under the day the results go live. */
                vote={
                  signedIn && voteLive ? (
                    <TitleVotePill selected={cursorKey === VOTE_OPTION.key} />
                  ) : null
                }
                notify={
                  <NotifyMe
                    open={notifyOpen}
                    onOpenChange={setNotifyOpen}
                    selected={cursorKey === NOTIFY_OPTION.key}
                    dataKey={NOTIFY_OPTION.key}
                    panelOverlay
                  />
                }
              />

              <StartTitleActions signedIn={signedIn} selectedKey={cursorKey} />

              <StartSurfaceKeys items={menuItems} cursorKey={cursorKey} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}