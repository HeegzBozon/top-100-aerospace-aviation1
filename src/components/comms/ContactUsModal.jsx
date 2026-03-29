import { Mail, Linkedin, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactUsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-[#1e3a5a] mb-2">Get in Touch</h2>
        <p className="text-gray-600 text-sm mb-6">Choose how you'd like to connect with us</p>

        {/* Options */}
        <div className="space-y-3">
          {/* Email Option */}
          <motion.a
            href="mailto:hello@top100os.com"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#4a90b8] hover:bg-blue-50/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-sm text-gray-500">hello@top100os.com</p>
            </div>
            <span className="text-2xl text-gray-300">→</span>
          </motion.a>

          {/* LinkedIn Option */}
          <motion.a
            href="https://linkedin.com/company/top100"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0a66c2] hover:bg-blue-50/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0a66c2] to-[#08519e] flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">LinkedIn</p>
              <p className="text-sm text-gray-500">@top100os</p>
            </div>
            <span className="text-2xl text-gray-300">→</span>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}