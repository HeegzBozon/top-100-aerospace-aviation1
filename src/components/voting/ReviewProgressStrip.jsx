import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import VotingProgressPanel from '@/components/voting/VotingProgressPanel';

// The ladder, read as one instrument across the head of the set: the office on the left,
// the tally and the experience on the right, and beneath them the measure itself. The +XP
// of a recorded review lands here, on the readout, rather than over the cards.
//
// The strip is also the whole of the record. The tall panel that used to stand beside the
// ballot said the same three things in a second column; it now opens from this strip on a
// press, so the ladder is stated once at the head of the set and read in depth when a
// Fellow asks for it.
export default function ReviewProgressStrip({
  progress = 0,
  levelName = null,
  reviews = 0,
  xp = 0,
  nextRung = null,
  flash = false,
  flashLabel = null,
  label = null,
  lane = null,
}) {
  const pct = Math.max(0, Math.min(1, Number(progress) || 0));

  const readout = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-[8.5px] font-semibold uppercase tracking-[0.18em] text-editorial-label md:text-[9.5px]">
          {levelName || 'Analyst'}
        </span>
        <span className="flex shrink-0 items-baseline gap-1.5 text-[9.5px] tabular-nums text-editorial-navy/55 md:text-[10px]">
          <span>
            {reviews} {reviews === 1 ? 'set' : 'sets'}
          </span>
          <span className="text-editorial-navy/25">&middot;</span>
          <span className="font-semibold text-editorial-navy/75">
            <motion.span
              key={xp}
              className="inline-block"
              initial={{ y: -5, opacity: 0, color: 'rgb(var(--editorial-copper-rgb))' }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {xp}
            </motion.span>{' '}
            XP
          </span>
          {lane ? <ChevronDown className="h-3 w-3 shrink-0 text-editorial-navy/40" aria-hidden /> : null}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <div className="relative h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-editorial-navy/10">
          <div
            className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-editorial-copper via-editorial-gold to-editorial-sand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{ transform: `scaleX(${Math.max(pct, 0.02)})` }}
          >
            <span className="rpm-sheen absolute inset-y-0 left-0 w-1/3" />
            <span className="absolute right-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-editorial-gold shadow-[0_0_8px_2px_rgb(var(--editorial-gold-rgb)/0.7)]" />
          </div>
        </div>

        {/* The rung the measure is carrying the office towards; while a review is being
            recorded, the experience it just earned reads here instead. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={flash ? 'flash' : nextRung || 'none'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className={`shrink-0 text-[8px] font-semibold uppercase tracking-[0.12em] tabular-nums md:text-[9px] ${
              flash ? 'text-editorial-copper' : 'text-editorial-navy/45'
            }`}
          >
            {flash ? flashLabel || 'Recorded' : nextRung || ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </>
  );

  // Without the record to open, the strip is the readout alone.
  if (!lane) {
    return (
      <div className="mb-1 shrink-0 md:mb-2.5" aria-label={label || 'Progress to the next rung'}>
        {readout}
      </div>
    );
  }

  return (
    <div className="mb-1 shrink-0 md:mb-2.5">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Your Analyst record — reviews, experience, the next rung and the milestones climbed"
            title="Your record"
            className="block w-full rounded-lg text-left transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-navy/30 focus-visible:ring-offset-2 active:brightness-[0.98]"
          >
            {readout}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[min(340px,calc(100vw-24px))] rounded-xl border-0 bg-transparent p-0 shadow-none"
        >
          <VotingProgressPanel progress={lane} />
        </PopoverContent>
      </Popover>
    </div>
  );
}