import { useEffect } from 'react';
import '@/components/vote/envelopeOpening.css';

// The letter being opened.
//
// A visitor who follows a promoted link is not dropped onto a page: a plate is set on
// the desk, the wax is pressed open, and the invitation rises out of the pocket before
// the desk hands the glass back. The whole theatre is a curtain over the gate — it holds
// nothing and asks nothing — so it is dismissed on a tap, gone in 2.9s, and skipped
// outright for a reader whose device asks for reduced motion.
const TIMELINE_MS = 2900;

export default function EnvelopeOpening({ onDone }) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      onDone();
      return undefined;
    }
    const timer = setTimeout(onDone, TIMELINE_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="as-frame env-curtain" role="presentation" onClick={onDone}>
      <div className="env-stage" role="presentation">
        <div className="env-letter">
          <p className="pd-label">TOP 100 Aerospace &amp; Aviation</p>
          <div className="pd-rule" />
          <p>You are invited</p>
        </div>
        <div className="env-shell">
          <div className="env-back" aria-hidden="true" />
          <div className="env-lining" aria-hidden="true" />
          <div className="env-pocket" aria-hidden="true" />
          <div className="env-flap" aria-hidden="true" />
          <div className="env-seal" aria-hidden="true" />
        </div>
        <p className="env-caption">A letter from the Selection Committee</p>
        <button type="button" onClick={onDone} className="env-skip">Skip</button>
      </div>
    </div>
  );
}