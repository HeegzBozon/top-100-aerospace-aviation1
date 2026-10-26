import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { hourPhase } from '@/components/core/appOpening';
import HomeDock from '@/components/home-v3/HomeDock';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import StartMark from '@/components/start/StartMark';
import StartSeasonLine from '@/components/start/StartSeasonLine';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];

// The title screen. The app opens like a game: the hour's sky, the mark, the
// cycle's countdown, and the six surfaces one step off the dashboard. The
// console's ring walks the keys and announces each one; a tap opens it.
//
// The picture is a single column that fills the glass top to bottom — masthead,
// mark, countdown, then the keys take everything that is left — so nothing has to
// be centred and no stretch of the screen is ever left dead.
export default function StartScreen() {
  const [phase] = useState(() => hourPhase());
  const [status, setStatus] = useState({ loading: true, votingEnd: null, failed: false });
  const [attempt, setAttempt] = useState(0);

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

  return (
    <div className="hh-slide-window relative flex flex-col p-1.5 md:block md:h-auto md:min-h-screen md:p-0">
      {/* The picture plane: the hour's sky, seated a hair inside the glass so no
          edge of it can run under the moulding. */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] md:min-h-screen md:rounded-none"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="relative flex min-h-0 flex-1 flex-col px-5 pb-6 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          <StartMetaRow kicker={phase.kicker} />

          <div className="mt-4 shrink-0 md:mt-10">
            <StartMark />
            <div className="mt-3 md:mt-4">
              <StartSeasonLine status={status} onRetry={() => setAttempt((n) => n + 1)} />
            </div>
          </div>

          <StartSurfaceKeys />
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