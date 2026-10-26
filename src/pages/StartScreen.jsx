import { useEffect, useState } from 'react';
import moment from 'moment';
import { RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hourPhase } from '@/components/core/appOpening';
import { resolveCommitteePhase } from '@/components/fellow-home/season/useCommitteePhase';
import HomeDock from '@/components/home-v3/HomeDock';
import StartMenuItem from '@/components/start/StartMenuItem';
import { START_LOGO, START_MENU } from '@/components/start/startMenuConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];

// The start screen. The app opens like a game: the hour's sky, the mark, the
// title, and the menu — the dashboard first, then the surfaces one step off it.
// The console's ring walks the rows and announces each one; a tap opens it.
export default function StartScreen() {
  const [phase] = useState(() => hourPhase());
  const [status, setStatus] = useState({ loading: true, line: '', failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus({ loading: true, line: '', failed: false });

    base44.entities.Season
      .list('-start_date', 6)
      .then((result) => {
        if (!alive) return;
        const seasons = Array.isArray(result) ? result : result?.items || [];
        const current = seasons.find((season) => LIVE_PHASES.includes(season.status)) || seasons[0] || null;
        const committee = current ? resolveCommitteePhase(current) : null;
        setStatus({
          loading: false,
          failed: false,
          line: current
            ? `${current.name}${committee?.label ? ` · ${committee.label}` : ''}`
            : 'No season on the calendar yet. The next cycle opens here.',
        });
      })
      .catch(() => {
        if (alive) setStatus({ loading: false, line: '', failed: true });
      });

    return () => {
      alive = false;
    };
  }, [attempt]);

  const stamp = moment().format('ddd D MMM · HH:mm');

  return (
    <div
      className="hh-slide-window relative flex flex-col overflow-hidden px-5 pb-10 pt-5 md:h-auto md:min-h-screen md:px-16 md:pb-14 md:pt-14"
      style={{ background: phase.sky }}
    >
      {/* The hour's weather, the same sky the title card opened on */}
      <div className="pointer-events-none absolute inset-0" style={{ background: phase.glow }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--editorial-cream-rgb) / 0.55) 0.5px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: phase.stars ? 0.4 : 0.12,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 130px rgba(5,11,20,0.7)' }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col md:mx-auto md:w-full md:max-w-2xl">
        <div className="flex items-center gap-3">
          <img src={START_LOGO} alt="" className="h-7 w-7 object-contain md:h-9 md:w-9" />
          <span className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-editorial-gold md:text-[9.5px]">
            TOP 100 Aerospace &amp; Aviation
          </span>
          <span className="ml-auto text-[8px] font-bold uppercase tracking-[0.28em] text-editorial-cream/40">
            MMXXVI
          </span>
        </div>

        <div className="mt-4 md:mt-10">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-editorial-copper md:text-[9.5px]">
            {phase.kicker}
          </p>
          <div
            className="mt-3 h-px w-32 md:w-56"
            style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }}
          />
          <h1 className="mt-3 font-heading text-[2.05rem] leading-[1.02] text-editorial-cream md:text-7xl">
            TOP 100
          </h1>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-cream/60 md:text-[11px]">
            Aerospace &amp; Aviation
          </p>

          {/* Where the cycle stands, read once — the menu works without it */}
          <div className="mt-3 flex items-center gap-2 text-[9px] tracking-[0.06em] text-editorial-cream/55 md:text-[11px]">
            {status.loading ? (
              <span className="text-editorial-cream/45">Reading the season…</span>
            ) : status.failed ? (
              <>
                <span className="text-editorial-cream/45">Season status unavailable.</span>
                <button
                  type="button"
                  onClick={() => setAttempt((n) => n + 1)}
                  className="flex items-center gap-1 uppercase tracking-[0.18em] text-editorial-gold"
                >
                  <RotateCcw className="h-[10px] w-[10px]" /> Read again
                </button>
              </>
            ) : (
              <span>{status.line}</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-8">
          <p className="mb-1 shrink-0 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/40">
            Select a surface
          </p>
          <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 md:overflow-visible">
            {START_MENU.map((item) => (
              <StartMenuItem key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 items-center justify-between gap-4 border-t border-editorial-cream/15 pt-3 text-[8px] font-bold uppercase tracking-[0.26em] text-editorial-cream/45">
          <span className="md:hidden">Turn the wheel · ◀ ▶ walks the menu</span>
          <span className="hidden md:inline">Choose a surface to begin</span>
          <span>{stamp}</span>
        </div>
      </div>

      {/* Desktop navigation under the title screen. */}
      <div className="hidden md:block">
        <div className="h-20" />
        <HomeDock />
      </div>
    </div>
  );
}