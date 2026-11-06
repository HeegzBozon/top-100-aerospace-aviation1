import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// The hand between reviews. A recorded review is filed away in the order it was placed,
// first record first, sliding off to the left like papers into a folder; a skipped one
// simply drops out of view. The next four are then dealt in from the right, one after
// another, settling out of a soft blur. One gesture each way, nothing on a loop.
const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_IN = [0.4, 0, 0.2, 1];

const cardVariants = {
  dealt: ({ calm }) =>
    calm ? { opacity: 0 } : { opacity: 0, x: 22, y: 10, scale: 0.97 },
  // Transform and opacity only: no blur, no rotation, so every frame stays on the
  // compositor and the deal holds its rate on a phone.
  standing: ({ index, calm }) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: calm
      ? { duration: 0.2 }
      : { duration: 0.42, ease: EASE_OUT, delay: 0.04 + index * 0.05 },
  }),
  away: ({ mode, order, calm }) => {
    if (calm) return { opacity: 0, transition: { duration: 0.15 } };
    if (mode === 'passed') {
      return { opacity: 0, y: 22, scale: 0.97, transition: { duration: 0.26, ease: EASE_IN } };
    }
    return {
      opacity: 0,
      x: -26,
      y: -6,
      scale: 0.95,
      transition: { duration: 0.26, ease: EASE_IN, delay: order * 0.045 },
    };
  },
};

export function DealtCard({ index, order = 0, mode, children }) {
  const calm = useReducedMotion();
  return (
    // The single track is held to the cell: an `auto` track would grow to the card's
    // widest content and push it over its neighbour.
    <motion.div
      className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] will-change-transform"
      variants={cardVariants}
      custom={{ index, order, mode, calm }}
    >
      {children}
    </motion.div>
  );
}

export default function CrosscheckDeal({ dealKey, className, children }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={dealKey}
        className={className}
        initial="dealt"
        animate="standing"
        exit="away"
        transition={{ ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}