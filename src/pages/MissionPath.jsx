import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import HomeDock from '@/components/home-v3/HomeDock';
import useMissionChronicle from '@/components/mission/chronicle/useMissionChronicle';
import { MISSIONS, SCENE_IMAGE } from '@/components/mission/chronicle/missionConfig';
import AircraftBanner from '@/components/mission/chronicle/AircraftBanner';
import ChapterPath from '@/components/mission/chronicle/ChapterPath';

// The season's path. Not a checklist and not a gate: the narrative spine of the
// cycle, walked at whatever pace a Fellow has. It holds the two pieces of work the
// institution actually needs — a name put forward, and a field measured — inside a
// story that says why they are worth doing.
//
// Progression is cosmetic. XP buys airframes; it is never read by discovery,
// measurement, ranking, or selection, and the firewall line at the foot says so.
export default function MissionPath() {
  const { loading, failed, user, chronicle, completed, xp, retry, complete, choose } =
    useMissionChronicle({ touch: true });
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const doneCount = completed.filter((key) => MISSIONS.some((mission) => mission.key === key)).length;

  const finish = async (mission, patch) => {
    setSaving(true);
    try {
      await complete(mission.key, patch);
      setActiveKey(null);
    } finally {
      setSaving(false);
    }
  };

  const pick = async (mission, choice) => {
    setSaving(true);
    try {
      await choose(mission.choiceKey, choice.key);
      await complete(mission.key);
      setActiveKey(null);
      if (choice.to) navigate(choice.to);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            The season’s path
          </p>
          <h1 className="mt-2 font-heading text-[2rem] leading-tight md:text-5xl" style={{ color: B.navy }}>
            Your first cycle.
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            A guided way through the work of the cycle — meet the guide, take an airframe, put a name
            forward, measure the field. Walk it in one sitting or a step a week; your place is kept.
          </p>
        </header>

        {loading ? <LoadingPath /> : null}

        {!loading && !user ? (
          <section className="mt-6 overflow-hidden rounded-2xl">
            <img src={SCENE_IMAGE} alt="" aria-hidden="true" className="h-40 w-full object-cover" />
            <div className="p-5" style={{ background: B.navy }}>
              <h2 className="font-heading text-xl text-editorial-cream">The path opens when you take a seat.</h2>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.7)' }}>
                A Fellow’s progress is kept against their own record, so the path needs an account to
                walk. Everything else on this page reads exactly the same without one.
              </p>
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin('/mission')}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em]"
                style={{ background: B.gold, color: B.navy }}
              >
                Join or sign in <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </section>
        ) : null}

        {!loading && user && failed ? (
          <section className="mt-6 rounded-2xl p-5" style={{ border: `1px solid ${B.border}`, background: 'white' }}>
            <h2 className="font-heading text-lg" style={{ color: B.navy }}>
              Your place didn’t load.
            </h2>
            <p className="mt-1 text-[12.5px]" style={{ color: B.muted }}>
              The path is still here — it just couldn’t be read back this moment.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ background: B.navy, color: B.cream }}
            >
              <RotateCcw className="h-3 w-3" /> Try again
            </button>
          </section>
        ) : null}

        {!loading && user && !failed ? (
          <>
            <AircraftBanner chronicle={chronicle} xp={xp} doneCount={doneCount} total={MISSIONS.length} />

            <ChapterPath
              completed={completed}
              choices={chronicle?.choices}
              activeKey={activeKey}
              onOpen={setActiveKey}
              onFinish={finish}
              onChoose={pick}
              saving={saving}
            />

            <section className="mt-8 rounded-xl p-4" style={{ border: `1px solid ${B.border}` }}>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
                What this does not do
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
                Progress on this path is cosmetic. Airframes, points and chapters are never read by
                discovery, measurement, ranking, or selection — participation earns a hangar, and
                nothing else.
              </p>
              <Link
                to="/Top100OS"
                className="mt-2.5 inline-flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.22em]"
                style={{ color: B.navy }}
              >
                Read the methodology <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </section>
          </>
        ) : null}

        <div className="h-24" />
      </div>
      <HomeDock />
    </div>
  );
}

function LoadingPath() {
  return (
    <div className="mt-6 animate-pulse space-y-3" aria-live="polite" aria-busy="true">
      <div className="h-32 rounded-2xl" style={{ background: 'rgba(30,58,90,0.08)' }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 rounded-xl" style={{ background: 'rgba(30,58,90,0.06)' }} />
      ))}
      <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
        Reading your place
      </p>
    </div>
  );
}