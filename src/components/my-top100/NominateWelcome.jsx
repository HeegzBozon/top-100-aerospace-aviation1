import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Vote } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function NominateWelcome({ onBegin, onVote, hasExisting }) {
  return (
    <div className="px-5 pt-10 pb-10 max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start"
      >
        {/* Nominations open badge */}
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-3.5 py-1.5 rounded-full mb-6"
          style={{ color: brand.gold, border: `1px solid ${brand.gold}55`, background: `${brand.gold}08` }}
        >
          <Sparkles className="w-3 h-3" />
          Nominations Open
        </span>

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
          style={{ color: '#0f2139', fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          You know someone who deserves this.
        </h1>

        {/* Body */}
        <div className="space-y-4 mb-8 max-w-xl">
          <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
            The aerospace and aviation community is full of people doing remarkable work. Most of them will never be asked to step forward.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: '#0f2139' }}>
            <span className="font-bold">You're about to change that for someone.</span>
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: '#7c838d' }}>
            TOP 100 Aerospace & Aviation has recognized over 300 Fellows across 40+ countries since 2021. This year we're expanding. More programs. More recognition. More community.
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: '#a8a8a8' }}>
            This form takes about 3 minutes per nomination. There's no limit on how many people you nominate. Every single one gets reviewed personally.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onBegin}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg"
            style={{ background: '#1b324d' }}
          >
            {hasExisting ? 'Continue Nominations' : 'Begin Nominations'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onVote}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all"
            style={{ background: 'transparent', border: `1.5px solid ${brand.gold}`, color: brand.gold }}
          >
            <Vote className="w-4 h-4" />
            Vote
          </motion.button>
        </div>

        {/* Footer */}
        <p className="text-[12px] mt-6 max-w-md leading-relaxed" style={{ color: '#b5b5b5' }}>
          New: Curate and rank your personal Top 100 — it doubles as your ranked choice ballot.
        </p>
      </motion.div>
    </div>
  );
}