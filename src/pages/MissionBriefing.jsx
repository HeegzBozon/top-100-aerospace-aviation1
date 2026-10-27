import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import HomeDock from '@/components/home-v3/HomeDock';
import CourseRail from '@/components/mission/CourseRail';
import CourseChapter from '@/components/mission/CourseChapter';
import CourseModule from '@/components/mission/CourseModule';
import BriefingWhen from '@/components/mission/BriefingWhen';
import TheRecord from '@/components/mission/TheRecord';
import useActiveStep from '@/components/mission/useActiveStep';
import useCourseProgress from '@/components/mission/useCourseProgress';
import { COURSE } from '@/components/mission/courseConfig';

const LIVE_PHASES = ['nominations_open', 'voting_open', 'review', 'rollover'];
const NEXT_STEPS = [
  { label: 'Your dashboard', to: '/board' },
  { label: 'The methodology', to: '/Top100OS' },
  { label: 'Sit on the committee', to: '/selection-committee' },
];

// Read — the course. Chapter zero is the onboarding: the origin story, the mission
// and the vision, the values, then the six questions — who, what, when, where, why,
// how. After it come the record behind the institution, the cycle running now, and
// what it is pointed at next. It is an ongoing course, so chapters are published as
// the institution takes on new work, and the reader's place is kept: reaching a
// module is reading it, and the rail counts what has been read.
export default function MissionBriefing() {
  const [state, setState] = useState({ loading: true, failed: false });
  const [data, setData] = useState({ seasons: [] });
  const [attempt, setAttempt] = useState(0);

  // The whole course, flat, in the order it is read — the order the wheel walks.
  const flat = useMemo(
    () => COURSE.flatMap((chapter) => chapter.modules.map((module) => ({ ...module, chapterKey: chapter.key }))),
    [],
  );
  const { refs, active, goTo } = useActiveStep(flat.length);
  const { read, markRead } = useCourseProgress();

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

  // Where the rail already says the reader is standing is where the reading is
  // banked: one effect, so the course's memory is never a second act of its own.
  useEffect(() => {
    const module = flat[active];
    if (module) markRead(module.key);
  }, [active, flat, markRead]);

  const seasons = data.seasons || [];
  const current = seasons.find((season) => LIVE_PHASES.includes(season.status)) || seasons[0] || null;
  const retry = () => setAttempt((n) => n + 1);

  const readIn = (chapter) => chapter.modules.filter((module) => read.includes(module.key)).length;
  const known = useMemo(() => new Set(flat.map((module) => module.key)), [flat]);
  const readCount = read.filter((key) => known.has(key)).length;
  const activeChapter = Math.max(
    0,
    COURSE.findIndex((chapter) => chapter.key === flat[active]?.chapterKey),
  );
  const chapterStart = (i) => COURSE.slice(0, i).reduce((n, chapter) => n + chapter.modules.length, 0);

  const extraFor = (module) => {
    if (module.extra === 'season') {
      return (
        <BriefingWhen season={current} loading={state.loading} failed={state.failed} onRetry={retry} />
      );
    }
    if (module.extra === 'record') {
      return <TheRecord seasons={seasons} loading={state.loading} failed={state.failed} onRetry={retry} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            Read · The course
          </p>
          <h1 className="mt-2 font-heading text-[2rem] leading-tight md:text-5xl" style={{ color: B.navy }}>
            Who we are, and what we measure.
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            Chapter zero is the onboarding: the origin story, the mission and the vision, the values, and
            the six questions — who, what, when, where, why, how. Then the record behind the institution,
            the cycle running now, and what comes next. Read it in one sitting or a module at a time; your
            place is kept.
          </p>
        </header>

        <CourseRail
          chapters={COURSE.map((chapter) => ({ ...chapter, readCount: readIn(chapter) }))}
          activeChapter={activeChapter}
          readCount={readCount}
          total={flat.length}
          onJump={(i) => goTo(chapterStart(i))}
        />

        <div className="mt-6 space-y-8 md:space-y-12">
          {COURSE.map((chapter) => (
            <section key={chapter.key}>
              <CourseChapter chapter={chapter} readCount={readIn(chapter)} />

              <div className="mt-5 space-y-7 md:space-y-10">
                {chapter.modules.map((module) => {
                  const i = flat.findIndex((item) => item.key === module.key);
                  return (
                    <div
                      key={module.key}
                      ref={(node) => {
                        refs.current[i] = node;
                      }}
                    >
                      <CourseModule step={module} read={read.includes(module.key)}>
                        {extraFor(module)}
                      </CourseModule>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl p-5 md:p-7" style={{ background: B.navy }}>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
            Where to go next
          </p>
          <h2 className="mt-2 font-heading text-xl text-editorial-cream md:text-2xl">
            The course is the map. The board is the work.
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