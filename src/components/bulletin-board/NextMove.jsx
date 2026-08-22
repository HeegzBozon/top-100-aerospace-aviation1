import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The action-driving engine. Surfaces the highest-leverage unfinished step.
// Reacts in realtime to a freshly filed dispatch, celebrates, then advances.
// Bare content — the ModuleGrid card frames it.
export default function NextMove({ data, user, accent, onCompose, onJumpToTile, onJumpToEight, onEditIdentity }) {
  const { eightCount = 0, hasFlightography, hasSixWord } = data || {};
  const [dispatchCount, setDispatchCount] = useState(null);
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(null);

  const loadCount = () => {
    if (!user?.email) return;
    base44.entities.Bulletin.filter({ author_email: user.email, post_type: 'dispatch', status: 'published' }, '-created_date', 1)
      .then((r) => setDispatchCount(r?.length || 0))
      .catch(() => setDispatchCount(0));
  };

  useEffect(() => { loadCount(); }, [user?.email]);

  // Realtime refresh — reacts the moment a dispatch lands.
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Bulletin.subscribe(() => loadCount());
    return unsub;
  }, [user?.email]);

  // Celebrate + advance when a dispatch is filed (esp. the first).
  useEffect(() => {
    if (dispatchCount === null) return;
    const prev = prevCount.current;
    if (prev !== null && dispatchCount > prev) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#1e3a5a', '#c9a87c', '#4a90b8'] });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2600);
      prevCount.current = dispatchCount;
      return () => clearTimeout(t);
    }
    prevCount.current = dispatchCount;
  }, [dispatchCount]);

  const steps = [
    { ready: eightCount >= 8, label: `Fill position ${Math.min(eightCount + 1, 8)} of your Eight`, action: onJumpToEight },
    { ready: (dispatchCount ?? 0) > 0, label: 'File your first dispatch', action: () => onCompose('dispatch') },
    { ready: hasFlightography, label: 'Add your career history', action: () => onJumpToTile('flightography') },
    { ready: hasSixWord, label: 'Write your six-word story', action: onEditIdentity },
  ];

  const next = steps.find((s) => !s.ready);

  if (dispatchCount === null) {
    return (
      <div className="flex items-center gap-2 py-2 h-full">
        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: accent }} />
        <span className="text-xs" style={{ color: B.muted }}>Finding your next move…</span>
      </div>
    );
  }

  const headline = flash ? 'Dispatch filed' : next ? next.label : 'Your profile is complete';

  return (
    <div className="flex flex-col h-full justify-between gap-3 py-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={headline}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
          className="flex items-center gap-2 min-w-0"
        >
          {flash ? (
            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: accent }}>
              <Check className="w-3.5 h-3.5 text-white" />
            </span>
          ) : (
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: accent }} />
          )}
          <span className="text-sm font-semibold leading-snug truncate" style={{ color: B.navy }}>{headline}</span>
        </motion.div>
      </AnimatePresence>

      {next ? (
        <button
          onClick={next.action}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
          style={{ background: B.navy }}
        >
          Begin <ArrowRight className="w-4 h-4" style={{ color: accent }} />
        </button>
      ) : (
        <Link
          to="/Top100Women2025"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
          style={{ background: B.navy }}
        >
          Explore <ArrowRight className="w-4 h-4" style={{ color: accent }} />
        </Link>
      )}
    </div>
  );
}