import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const FLOWER = '🌸';

export default function FlowerButton({ nominee, currentUserEmail }) {
  const alreadySent = Array.isArray(nominee?.flowered_by) && nominee.flowered_by.includes(currentUserEmail);
  const [sent, setSent] = useState(alreadySent);
  const [count, setCount] = useState(nominee?.flower_count ?? 0);
  const [burst, setBurst] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFlower = useCallback(async (e) => {
    e.stopPropagation();
    if (sent || loading || !currentUserEmail) return;

    setSent(true);
    setCount(c => c + 1);
    setBurst(true);
    setLoading(true);
    setTimeout(() => setBurst(false), 700);

    await base44.entities.Nominee.update(nominee.id, {
      flower_count: (nominee.flower_count ?? 0) + 1,
      flowered_by: [...(nominee.flowered_by ?? []), currentUserEmail],
    });

    setLoading(false);
  }, [sent, loading, currentUserEmail, nominee]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Burst particles */}
      <AnimatePresence>
        {burst && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.4,
                  x: Math.cos((i / 6) * Math.PI * 2) * 28,
                  y: Math.sin((i / 6) * Math.PI * 2) * 28,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute text-base pointer-events-none select-none"
                style={{ zIndex: 10 }}
              >
                {FLOWER}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      <button
        onClick={handleFlower}
        disabled={sent || !currentUserEmail}
        aria-label={sent ? 'Flowers sent' : 'Send flowers'}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 disabled:cursor-default"
        style={{
          background: sent
            ? 'rgba(201,168,124,0.15)'
            : 'rgba(201,168,124,0.12)',
          border: `1px solid ${sent ? 'rgba(201,168,124,0.5)' : 'rgba(201,168,124,0.3)'}`,
          color: sent ? '#a07840' : '#a07840',
          transform: burst ? 'scale(1.12)' : undefined,
          transition: 'transform 0.15s, background 0.2s',
        }}
      >
        <motion.span
          animate={burst ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="text-base leading-none"
        >
          {FLOWER}
        </motion.span>
        <span>{sent ? 'Sent!' : 'Send Flowers'}</span>
        {count > 0 && (
          <span className="text-xs font-black opacity-60">{count}</span>
        )}
      </button>
    </div>
  );
}