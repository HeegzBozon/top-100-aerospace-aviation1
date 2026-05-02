import { motion } from 'framer-motion';
import { Radio, Rocket, Sparkles } from 'lucide-react';

export default function LaunchPartySplash() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f1e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,168,124,0.22),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(74,144,184,0.18),transparent_26%),linear-gradient(135deg,#0a0f1e_0%,#10243a_55%,#1e3a5a_100%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute top-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-[#c9a87c]/35 bg-[#c9a87c]/10 shadow-[0_0_70px_rgba(201,168,124,0.22)] backdrop-blur-xl"
        >
          <Rocket className="h-11 w-11 text-[#c9a87c]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-red-200"
        >
          <Radio className="h-3 w-3 animate-pulse" />
          Live Signal Loading
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-4xl font-bold leading-tight md:text-6xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Mission <span className="text-[#c9a87c]">Theatre</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-white/55 md:text-base"
        >
          Pulling the live stream and upcoming missions into orbit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex items-center gap-3 text-[#c9a87c]"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />
          <Sparkles className="h-4 w-4 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}