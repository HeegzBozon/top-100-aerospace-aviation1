import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import useMissionChronicle from './useMissionChronicle';

const DELAY_MS = 14000;
const SEEN_KEY = 'mission-nudge-shown';

/* The notice wears the machine's own palette: the card is the tube's navy, the
   header and the pill are the rose gold printed on it. */
const CARD = '#23374D';
const INK = '#F0F0F0';
const INK_SOFT = 'rgba(240,240,240,0.78)';
const ACCENT = '#C5A87F';

// A gentle nudge, and only that: it waits until the Fellow has been reading a while,
// arrives once per session, and is put away with a single press. It is drawn inside
// the machine's own display — the tube on a desk, the glass on a phone — never over
// the hardware, and it only ever speaks to someone already on the path.
export default function MissionNudge({ surface = 'desktop' }) {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAwake(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!awake) return null;
  return <NudgeCard surface={surface} />;
}

function NudgeCard({ surface }) {
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

  const showing = !gone && chronicle && nextMission && !location.pathname.startsWith('/mission');

  // Escape puts it away, the way any panel on this machine is closed.
  useEffect(() => {
    if (!showing) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showing]);

  if (!showing) return null;

  return (
    <div
      className={`${surface === 'handheld' ? 'hh-notice' : 'imac-notice'} z-40 flex items-center justify-center p-4`}
      style={{ background: 'rgba(13,20,28,0.88)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-nudge-title"
    >
      <div
        className="relative w-full max-w-[300px] rounded-3xl px-6 py-5"
        style={{ background: CARD, boxShadow: '0 26px 64px -22px rgba(3,6,13,0.9)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
            Next on the path
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Not now"
            className="-mr-1 -mt-1 rounded-full p-1.5"
            style={{ color: 'rgba(240,240,240,0.65)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="mission-nudge-title"
          className="mt-4 font-heading text-[26px] font-semibold leading-[1.1]"
          style={{ color: INK }}
        >
          {nextMission.title}
        </h2>
        <p className="mt-2 font-heading text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
          {nextMission.doneNote || nextMission.lede}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            to="/mission"
            onClick={dismiss}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ background: ACCENT, color: '#12202E' }}
          >
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] font-semibold uppercase tracking-[0.24em]"
            style={{ color: 'rgba(240,240,240,0.7)' }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}