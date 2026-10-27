import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import HomeDock from '@/components/home-v3/HomeDock';
import BriefingRail from '@/components/mission/BriefingRail';
import BriefingStep from '@/components/mission/BriefingStep';
import BriefingWhen from '@/components/mission/BriefingWhen';
import TheRecord from '@/components/mission/TheRecord';
import useActiveStep from '@/components/mission/useActiveStep';
import { BRIEFING_STEPS } from '@/components/mission/missionBriefingConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];
const NEXT_STEPS = [
  { label: 'Your dashboard', to: '/board' },
  { label: 'The methodology', to: '/Top100OS' },
  { label: 'Sit on the committee', to: '/selection-committee' },
];

// Mission Briefing. The onboarding sequence: why the platform exists, who
// stands in it, what it measures, when the cycle turns, where it lives, how a
// Fellow enters — then the record itself. Steps stack and the console's wheel
// walks them, so a phone reads it the way the console intends.
export default function MissionBriefing() {
  const [state, setState] = useState({ loading: true, failed: false });
  const [data, setData] = useState({ seasons: [] });
  const [attempt, setAttempt] = useState(0);
  const { refs, active, goTo } = useActiveStep(BRIEFING_STEPS.length);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

    base44.entities.Season
      .list('-start_date', 24)
      .then((result) => {
        if (!alive) return;
        const seasons = Array.isArray(result) ? result : result?.items || [];
        setData({ seasons });
        setState({ loading: false, failed: false });
      })
      .catch(() => {
        if (alive) setState({ loading: false, failed: true });
      });

    return () => {
      alive = false;
    };
  }, [attempt]);

  const seasons = data.seasons || [];
  const current = seasons.find((season) => LIVE_PHASES.includes(season.status)) || seasons[0] || null;
  const retry = () => setAttempt((n) => n + 1);

  const extraFor = (key) => {
    if (key === 'when') {
      return (
        <BriefingWhen
          season={current}
          loading={state.loading}
          failed={state.failed}
          onRetry={retry}
        />
      );
    }
    if (key === 'record') {
      return (
        <TheRecord
          seasons={seasons}
          loading={state.loading}
          failed={state.failed}
          onRetry={retry}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            TOP 100 101
          </p>
          <h1 className="mt-2 font-heading text-[2rem] leading-tight md:text-5xl" style={{ color: B.navy }}>
            Who we are, and what we measure.
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            Eight steps, in order. Read it in one sitting before you take a seat on the committee, or
            come back to a single step when you need it. The last step is the record itself — every
            publication and every closed cycle.
          </p>
        </header>

        <BriefingRail steps={BRIEFING_STEPS} active={active} onJump={goTo} />

        <div className="mt-6 space-y-7 md:space-y-10">
          {BRIEFING_STEPS.map((step, i) => (
            <div
              key={step.key}
              ref={(node) => {
                refs.current[i] = node;
              }}
            >
              <BriefingStep step={step}>{extraFor(step.key)}</BriefingStep>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-2xl p-5 md:p-7" style={{ background: B.navy }}>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
            Where to go next
          </p>
          <h2 className="mt-2 font-heading text-xl text-editorial-cream md:text-2xl">
            The briefing is the map. The board is the work.
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {NEXT_STEPS.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
                style={
                  i === 0
                    ? { background: B.gold, color: B.navy }
                    : { background: 'rgba(250,248,245,0.12)', color: B.cream, border: '1px solid rgba(250,248,245,0.28)' }
                }
              >
                {i === 0 ? <LayoutGrid className="h-3 w-3" /> : null}
                {item.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        <div className="h-24" />
      </div>
      <HomeDock />
    </div>
  );
}