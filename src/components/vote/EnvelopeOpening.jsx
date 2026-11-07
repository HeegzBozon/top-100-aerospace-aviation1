import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/components/vote/envelopeOpening.css';
import '@/components/vote/envelopeFlight.css';

// The sheet is folded through four shapes before it becomes the envelope, so the flight
// runs longer than one fold. The duration is published to the stylesheet as --env-flight
// so the shape sequence, the turn of the paper and the envelope's arrival share one clock.
const FLIGHT_MS = 4400;

export default function EnvelopeOpening({ onDone }) {
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
    const timer = setTimeout(next, phase === 'flight' ? FLIGHT_MS : phase === 'holding' ? 3000 : 1350);
    return () => clearTimeout(timer);
  }, [phase, onDone]);

  return (
    <div className="as-frame env-curtain" role="presentation">
      <div className="env-stage env-delivery" data-phase={phase} style={{ '--env-flight': `${FLIGHT_MS}ms` }}>
        <div className="env-letter">
          <p className="pd-label">TOP 100 Aerospace &amp; Aviation</p>
          <div className="pd-rule" />
          <p>You are invited</p>
        </div>
        <div className="env-shell">
          <div className="env-fold" aria-hidden="true" />
          <div className="env-back" aria-hidden="true" />
          <div className="env-lining" aria-hidden="true" />
          <div className="env-pocket" aria-hidden="true" />
          <div className="env-flap" aria-hidden="true" />
          <div className="env-seal" aria-hidden="true" />
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