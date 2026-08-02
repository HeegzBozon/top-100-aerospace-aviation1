import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe2, MapPin, Rocket, X } from 'lucide-react';

// The three original hero slides, condensed into a thin rotating announcement banner.
const announcements = [
  {
    id: 'think-global',
    label: 'Think Global',
    detail: 'One aerospace community across borders.',
    icon: Globe2,
    to: '/Top100Women2025',
  },
  {
    id: 'act-local',
    label: 'Act Local',
    detail: 'Nominate the places that keep people going.',
    icon: MapPin,
    to: '/local-legends',
  },
  {
    id: 'ad-astra',
    label: 'Ad Astra',
    detail: 'Mission theatre & fundraising journey.',
    icon: Rocket,
    to: '/top100-tv',
  },
];

const ROTATE_MS = 4800;

export default function AnnouncementBanner() {
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const next = useCallback(() => setActive((i) => (i + 1) % announcements.length), []);

  useEffect(() => {
    if (dismissed) return;
    const t = setInterval(next, ROTATE_MS);
    return () => clearInterval(t);
  }, [next, dismissed]);

  if (dismissed) return null;

  const item = announcements[active];
  const Icon = item.icon;

  return (
    <div className="relative z-[120] w-full border-b border-[#c9a87c]/20 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        {/* Live dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c9a87c] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c9a87c]" />
        </span>

        {/* Rotating message */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c9a87c]/15">
                <Icon className="h-3.5 w-3.5 text-[#c9a87c]" />
              </span>
              <Link to={item.to} className="group flex min-w-0 items-baseline gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9a87c] sm:text-sm">
                  {item.label}
                </span>
                <span className="truncate text-[11px] text-white/55 sm:text-xs">{item.detail}</span>
                <ArrowRight className="h-3 w-3 shrink-0 text-[#c9a87c] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {announcements.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setActive(i)}
              aria-label={a.label}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-[#c9a87c]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-white/40 transition-colors hover:text-white/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}