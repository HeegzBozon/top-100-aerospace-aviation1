import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { brand } from '@/components/nominate/NominateConfig';

/**
 * Subtle persistence flash — shows "Saving..." then a rose-gold "Saved" pulse.
 */
export default function ListSavedBadge({ saving }) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (saving) {
      setShowSaved(false);
      return;
    }
    // When saving flips back to false, flash "Saved" briefly
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 1800);
    return () => clearTimeout(t);
  }, [saving]);

  return (
    <AnimatePresence>
      {saving && (
        <motion.span
          key="saving"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-[10px] font-semibold"
          style={{ color: `${brand.navy}50` }}
        >
          <Loader2 className="w-3 h-3 animate-spin" /> Saving…
        </motion.span>
      )}
      {!saving && showSaved && (
        <motion.span
          key="saved"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: brand.gold, background: `${brand.gold}15` }}
        >
          <Check className="w-3 h-3" /> Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}