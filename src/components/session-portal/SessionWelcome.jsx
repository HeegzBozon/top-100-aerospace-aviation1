import { motion } from 'framer-motion';
import { Rocket, Zap, LayoutList, BookOpen, Flame, ChevronRight, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: Zap, label: 'Session Selector', desc: 'Answer 3 questions, get a tailored agenda recommendation.', path: '/session-portal/selector', color: '#c9a87c' },
  { icon: Flame, label: 'Warm-Up Activities', desc: 'Quick energizers to open the room and get people present.', path: '/session-portal/warmup', color: '#f97316' },
  { icon: LayoutList, label: 'Agenda Builder', desc: 'Drag-and-drop your tactic sequence. Run it live with a timer.', path: '/session-portal/agenda', color: '#6366f1' },
  { icon: BookOpen, label: 'Tactics Library', desc: 'Browse and search all facilitation tactics. Add your own.', path: '/session-portal/tactics', color: '#10b981' },
];

const STATS = [
  { value: '6', label: 'Session Formats' },
  { value: '12+', label: 'Tactics Available' },
  { value: '∞', label: 'Agendas Possible' },
];

export default function SessionWelcome() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a87c]/30 mb-6"
          style={{ background: 'rgba(201,168,124,0.08)' }}>
          <Star className="w-3 h-3 text-[#c9a87c]" />
          <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Operation: Moon Joy</span>
        </div>

        <h1 className="text-white text-5xl md:text-6xl font-bold mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Welcome to
          <br />
          <span style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a090)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            the Show.
          </span>
        </h1>

        <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
          This is your facilitation command center. Design sessions, warm up your room, and run live agendas — all in one place.
        </p>

        <div className="flex items-center justify-center gap-8 mt-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-[#c9a87c]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {FEATURES.map(({ icon: Icon, label, desc, path, color }, i) => (
          <motion.div key={path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.2 }}>
            <Link to={path}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 hover:border-white/25 transition-all block"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm mb-1 group-hover:text-[#c9a87c] transition-colors">{label}</p>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all group-hover:translate-x-1 mt-0.5 shrink-0" />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-2xl border border-[#c9a87c]/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.07), rgba(13,31,54,0.6))' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.25), rgba(201,168,124,0.08))' }}>
            <Rocket className="w-6 h-6 text-[#c9a87c]" />
          </div>
          <div>
            <p className="text-white font-bold">Ready to run a session?</p>
            <p className="text-white/50 text-sm">Start with the selector and we'll build your agenda.</p>
          </div>
        </div>
        <Link to="/session-portal/selector"
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#07111f] shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
          <Users className="w-4 h-4" /> Start Session Selector
        </Link>
      </motion.div>
    </div>
  );
}