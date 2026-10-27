import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import useMissionChronicle from './useMissionChronicle';

const DELAY_MS = 14000;
const SEEN_KEY = 'mission-nudge-shown';

// A gentle nudge, and only that: it waits until the Fellow has been reading a while,
// arrives once per session, never covers the work in front of them, and is put away
// with a single press. It only ever speaks to someone already on the path.
export default function MissionNudge() {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAwake(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!awake) return null;
  return <NudgeCard />;
}

function NudgeCard() {
  const location = useLocation();
  const { chronicle, nextMission } = useMissionChronicle({ touch: false });
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setGone(true);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* a browser that keeps nothing simply sees it once more */
    }
  };

  if (gone || !chronicle || !nextMission) return null;
  if (location.pathname.startsWith('/mission')) return null;

  return (
    <aside
      className="hh-lift fixed bottom-4 left-4 right-4 z-40 rounded-xl p-3 shadow-lg md:left-auto md:right-5 md:bottom-5 md:w-[288px]"
      style={{ background: B.navy, boxShadow: '0 18px 40px -18px rgba(3,6,13,0.6)' }}
      aria-label="Next on the season's path"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.gold }}>
          Next on the path
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="-mr-1 -mt-1 rounded-full p-1"
          style={{ color: 'rgba(250,248,245,0.6)' }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1.5 font-heading text-[15px] leading-snug" style={{ color: B.cream }}>
        {nextMission.title}
      </p>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: 'rgba(250,248,245,0.62)' }}>
        {nextMission.doneNote || nextMission.lede}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <Link
          to="/mission"
          onClick={dismiss}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em]"
          style={{ background: B.gold, color: B.navy }}
        >
          Continue <ArrowRight className="h-2.5 w-2.5" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-[8.5px] font-bold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(250,248,245,0.55)' }}
        >
          Later
        </button>
      </div>
    </aside>
  );
}