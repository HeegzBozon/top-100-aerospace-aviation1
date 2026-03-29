import { Mail, Linkedin, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactUsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #0f1d2d 0%, #1a2f47 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #c9a87c, #4a90b8, #c9a87c)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10"
        >
          <X className="w-4 h-4 text-white/50" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <h2
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Get in Touch
          </h2>
          <p className="text-sm" style={{ color: 'rgba(201,168,124,0.7)' }}>
            We'd love to hear from you
          </p>
        </div>

        {/* Options */}
        <div className="px-6 pb-6 space-y-3">
          {/* Email */}
          <motion.a
            href="mailto:matthew@top100aero.space"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(201,168,124,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,124,0.6)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,124,0.25)'}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #b8925a)' }}
            >
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">Email</p>
              <p className="text-xs truncate" style={{ color: 'rgba(201,168,124,0.7)' }}>
                matthew@top100aero.space
              </p>
            </div>
            <span className="text-white/30 group-hover:text-white/60 transition-colors text-lg">→</span>
          </motion.a>

          {/* LinkedIn */}
          <motion.a
            href="https://www.linkedin.com/company/top-100-aerospace-aviation"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(74,144,184,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(74,144,184,0.6)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(74,144,184,0.25)'}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4a90b8, #2d6a9f)' }}
            >
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">LinkedIn</p>
              <p className="text-xs truncate" style={{ color: 'rgba(74,144,184,0.8)' }}>
                TOP 100 Aerospace & Aviation
              </p>
            </div>
            <span className="text-white/30 group-hover:text-white/60 transition-colors text-lg">→</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}