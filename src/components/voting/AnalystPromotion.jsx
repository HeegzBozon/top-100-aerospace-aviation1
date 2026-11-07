import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight } from 'lucide-react';
import { ANALYST_SETS, LADDER_MARKS } from '@/components/voting/ladderMarks';

// The graduation, announced once.
//
// The thirtieth set graduates an Associate Analyst into the office of Analyst and opens the
// Flight Plan. It is shown as an event rather than as a line of copy on a desk: the office is
// named, the work behind it is counted, the next rung is already in view, and the desk the
// office unlocks is one press away. The key that reaches it keeps glowing until it has been
// walked through (see useFlightUnveiling), so declining here does not lose the way in.
//
// Seen once per Fellow on this device. The work is recorded on the contribution record; this
// mark only keeps the celebration from replaying on every visit.
const seenKey = (email) => (email ? `top100.analyst-promoted.${email}` : null);

export default function AnalystPromotion({ office, email, name, onOpenFlight }) {
  const key = seenKey(email);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (office.status !== 'ready' || !office.isAnalyst || !key) return;
    let seen = false;
    try {
      seen = localStorage.getItem(key) === '1';
    } catch {
      seen = false;
    }
    setOpen(!seen);
  }, [office.status, office.isAnalyst, key]);

  useEffect(() => {
    if (!open) return;
    confetti({
      particleCount: 150,
      spread: 84,
      startVelocity: 44,
      origin: { y: 0.42 },
      colors: ['#C9A87C', '#B87333', '#FAF8F5', '#1E3A5A'],
    });
  }, [open]);

  if (!open) return null;

  const close = () => {
    if (key) {
      try {
        localStorage.setItem(key, '1');
      } catch {
        /* a convenience only */
      }
    }
    setOpen(false);
  };

  const nextOffice = LADDER_MARKS.find((mark) => mark.level === 3);
  const first = String(name || '').trim().split(/\s+/)[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Promotion to Analyst"
      className="as-veil fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overscroll-contain bg-editorial-navy/80 p-4"
    >
      <div className="as-rise my-auto w-full max-w-md border-2 border-editorial-copper bg-editorial-navy px-6 py-7 shadow-2xl">
        <p className="flex items-center gap-2 font-body text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-editorial-gold" />
          The Selection Committee · Promotion
        </p>

        <h2 className="mt-3 font-heading text-4xl leading-none text-editorial-cream">Analyst</h2>
        <p className="mt-3 font-body text-[13px] leading-relaxed text-editorial-cream/75">
          {first ? `${first}, the` : 'The'} office is yours. Thirty sets of four — a hundred and
          twenty professionals read against each other — and the desk that reads the field is
          now on your machine.
        </p>

        <div className="mt-5 grid grid-cols-2 divide-x divide-editorial-cream/15 border-y border-editorial-cream/15 py-3">
          <div className="px-2 text-center">
            <p className="font-heading text-2xl leading-none text-editorial-cream">{ANALYST_SETS}</p>
            <p className="mt-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.2em] text-editorial-gold/80">
              sets measured
            </p>
          </div>
          <div className="px-2 text-center">
            <p className="font-heading text-2xl leading-none text-editorial-cream">
              {nextOffice ? nextOffice.sets : '—'}
            </p>
            <p className="mt-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.2em] text-editorial-gold/80">
              next · {nextOffice ? nextOffice.name : 'the full flight'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border border-editorial-gold/45 bg-editorial-gold/10 px-3 py-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-editorial-gold" />
          <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-gold">
            New desk unlocked · The Flight Plan
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              close();
              onOpenFlight?.();
            }}
            className="desk-key desk-key-primary"
          >
            Take the desk <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={close} className="desk-key desk-key-quiet">
            Later
          </button>
        </div>

        <p className="mt-4 font-body text-[10px] leading-relaxed text-editorial-cream/45">
          The key stays lit on the committee strip until you open it.
        </p>
      </div>
    </div>
  );
}