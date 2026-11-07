import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WaxSeal from '@/components/vote/WaxSeal';
import OrigamiFold from '@/components/vote/OrigamiFold';
import '@/components/vote/envelopeOpening.css';
import '@/components/vote/envelopeFlight.css';

// The sheet is folded through four shapes before it becomes the envelope, so the flight
// runs longer than one fold. The duration is published to the stylesheet as --env-flight
// so the shape sequence, the turn of the paper and the envelope's arrival share one clock.
const FLIGHT_MS = 7500;
// The seal lifts away, then the flap turns back — the card is handed over once that
// unsealing has finished rather than in the middle of it.
const OPEN_MS = 1520;
// The hold between the envelope landing and the seal letting go.
const HOLD_MS = 2400;

// `leaving` is set by the page once the card has been handed over: the curtain lifts and
// the letter beneath it comes up through the gap, so the envelope never simply vanishes.
export default function EnvelopeOpening({ onDone, leaving = false }) {
  const [phase, setPhase] = useState('flight');
  const navigate = useNavigate();
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      onDone();
      return undefined;
    }
    // The three-second hold starts only after the plane has become an envelope.
    const next = phase === 'flight' ? () => setPhase('holding')
      : phase === 'holding' ? () => setPhase('opening') : onDone;
    const timer = setTimeout(next, phase === 'flight' ? FLIGHT_MS : phase === 'holding' ? HOLD_MS : OPEN_MS);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  return (
    <div className="as-frame env-curtain" role="presentation" data-leaving={leaving ? 'true' : undefined}>
      <div className="env-stage env-delivery" data-phase={phase} style={{ '--env-flight': `${FLIGHT_MS}ms` }}>
        <div className="env-letter">
          <p className="pd-label">TOP 100 Aerospace &amp; Aviation</p>
          <div className="pd-rule" />
          <p>You are invited</p>
        </div>
        <div className="env-shell">
          <OrigamiFold />
          <div className="env-back" aria-hidden="true" />
          <div className="env-lining" aria-hidden="true" />
          <div className="env-pocket" aria-hidden="true" />
          <div className="env-flap" aria-hidden="true" />
          <WaxSeal />
        </div>
        <p className="env-caption">A letter from the Selection Committee</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setPhase('opening')} disabled={phase === 'opening'} className="env-skip">Open invitation</button>
          <button type="button" onClick={() => { onDone(); navigate('/media-hub'); }} className="env-skip">Learn more</button>
        </div>
      </div>
    </div>
  );
}