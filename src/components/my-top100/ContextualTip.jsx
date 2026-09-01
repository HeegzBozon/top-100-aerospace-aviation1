import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

function storageKey(userEmail, tipKey) {
  return `tip_seen_${(userEmail || 'anon').toLowerCase()}_${tipKey}`;
}

export function useTipSeen(userEmail, tipKey) {
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    try {
      setSeen(localStorage.getItem(storageKey(userEmail, tipKey)) === '1');
    } catch {
      setSeen(false);
    }
  }, [userEmail, tipKey]);
  const dismiss = () => {
    try {
      localStorage.setItem(storageKey(userEmail, tipKey), '1');
    } catch { /* ignore */ }
    setSeen(true);
  };
  return [seen, dismiss];
}

export default function ContextualTip({ userEmail, tipKey, children }) {
  const [seen, dismiss] = useTipSeen(userEmail, tipKey);
  return (
    <AnimatePresence>
      {!seen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.28 }}
          className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl"
          style={{ background: `${brand.gold}10`, border: `1px solid ${brand.gold}30` }}
        >
          <p className="flex-1 text-[12px] leading-relaxed" style={{ color: brand.navy }}>
            {children}
          </p>
          <button onClick={dismiss} className="shrink-0 mt-0.5" aria-label="Dismiss tip">
            <X className="w-3.5 h-3.5" style={{ color: `${brand.navy}50` }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}