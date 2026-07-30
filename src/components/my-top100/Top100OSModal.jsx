import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import Top100OS from '@/pages/Top100OS';

export default function Top100OSModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 z-[180]"
            style={{ background: 'rgba(10,18,30,0.55)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="absolute inset-0 z-[180] flex items-center justify-center p-3 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              style={{ background: brand.cream, border: `1px solid ${brand.navy}18` }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                style={{ background: 'white', borderColor: `${brand.navy}12` }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: brand.navy }}
                >
                  Top 100 OS
                </span>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-black/5"
                  style={{ color: brand.navy }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body — the full Top 100 OS page, scrollable */}
              <div className="overflow-y-auto flex-1">
                <Top100OS />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}