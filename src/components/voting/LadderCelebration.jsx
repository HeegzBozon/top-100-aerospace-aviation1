import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight } from 'lucide-react';
import './ladderMoment.css';

// The moment a rung turns over.
//
// A toast is the right instrument for a housekeeping message and the wrong one for status:
// the ladder is the only thing on this ballot that is the Fellow's own, so the moment it
// moves is given the glass for a beat. The plate is navy and copper, the mark is named in
// the display serif, the figure behind it says how much work the name stands for, and the
// line beneath says what is ahead. One press, or five seconds, and the ballot is back.
//
// Nothing here is measurement. The mark is a recognition of service, never a weight.
export default function LadderCelebration({ moment, onClose }) {
  useEffect(() => {
    if (!moment) return undefined;
    const timer = setTimeout(onClose, 5200);
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') onClose();
    };
    window.addEventListener('keydown', onKey);

    // Copper, rose gold and cream in two beats — the seal struck, then the dust settling.
    // Both bursts switch themselves off for a reader who asks for reduced motion.
    confetti({
      particleCount: 120,
      spread: 76,
      startVelocity: 42,
      origin: { y: 0.44 },
      colors: ['#C9A87C', '#B87333', '#E8CF9E', '#FAF8F5'],
      scalar: 0.95,
      disableForReducedMotion: true,
    });
    const second = setTimeout(() => {
      confetti({
        particleCount: 48,
        spread: 112,
        startVelocity: 24,
        decay: 0.92,
        origin: { y: 0.4 },
        colors: ['#C9A87C', '#B87333'],
        scalar: 0.7,
        disableForReducedMotion: true,
      });
    }, 220);

    return () => {
      clearTimeout(timer);
      clearTimeout(second);
      window.removeEventListener('keydown', onKey);
    };
  }, [moment, onClose]);

  if (!moment) return null;

  const level = moment.kind === 'level';
  const sets = Number(moment.sets) || 0;
  const next = moment.next || null;
  const away = next ? next.sets - sets : 0;

  return (
    <div className="ladder-moment" role="dialog" aria-modal="true" aria-labelledby="ladder-moment-name" onClick={onClose}>
      <motion.div
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 22, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="ladder-plate"
      >
        <span aria-hidden className="ladder-ring" />
        <span aria-hidden className="ladder-ring ladder-ring-2" />

        <p className="ladder-eyebrow">{level ? 'Office conferred' : 'Division climbed'}</p>

        <h2 id="ladder-moment-name" className="ladder-name">
          {moment.name}
        </h2>

        <span aria-hidden className="ladder-rule" />

        <p className="ladder-figure">
          <span className="ladder-figure-n">{sets.toLocaleString('en-US')}</span>
          <span className="ladder-figure-l">
            {sets === 1 ? 'evaluation measured' : 'evaluations measured'}
          </span>
        </p>

        <p className="ladder-next">
          {next ? (
            <>
              Next <span className="font-semibold">{next.name}</span>, {away.toLocaleString('en-US')}{' '}
              {away === 1 ? 'evaluation' : 'evaluations'} away.
            </>
          ) : (
            'The last office on the ladder. Nothing stands above it.'
          )}
        </p>

        <button type="button" onClick={onClose} className="ladder-key" autoFocus>
          Carry on
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <p className="ladder-foot">Filed to your Analyst record. Progress is never read by measurement.</p>
      </motion.div>
    </div>
  );
}