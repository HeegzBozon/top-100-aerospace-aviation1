import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle, Hammer, BookOpen, Mic, Zap, Flame, Users, Network,
  Globe, ChevronRight, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.07, ease: 'easeOut' } }),
};

const sessions = [
  { icon: MessageCircle, label: 'Shoot the Shit', desc: 'Open conversation. What\'s happening in the industry, what\'s on your mind, what matters right now.' },
  { icon: Hammer,        label: 'Live Builds',    desc: 'Someone builds something in public. A pitch, a model, a product. Community watches and reacts.' },
  { icon: BookOpen,      label: 'Workshops',      desc: 'One host. One skill. 30 minutes. Leave knowing something you didn\'t.' },
  { icon: Mic,           label: 'Q&As',           desc: 'A Fellow or guest takes your questions. No script, no PR filter.' },
  { icon: Zap,           label: 'Hackathons',     desc: 'Time-boxed. Collaborative. Ship something together.' },
  { icon: Flame,         label: 'Hot Seats',      desc: 'One challenge, one person, whole community helps.' },
  { icon: Users,         label: 'Breakout Rooms', desc: 'Any session can split into smaller rooms. Domain-based, skill-based, or random. We built the hallway.' },
  { icon: Network,       label: 'Networking 101', desc: 'A recurring monthly session for the part nobody teaches. Live practice with real people. No cringe, no scripts.' },
];

const stats = [
  { value: '300+', label: 'Fellows' },
  { value: '40+',  label: 'Countries' },
  { value: '70+',  label: 'Disciplines' },
  { value: '13K+', label: 'In the Network' },
];

export default function Hangouts() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 55%, #111827 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}
    >
      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">
          TOP 100
        </Link>
        <div className="flex gap-3">
          <a
            href="#register"
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-colors"
          >
            Register Free
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-20 pb-24 max-w-5xl mx-auto text-center">
        {/* subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="uppercase tracking-[0.3em] text-[#c9a87c] text-xs font-semibold mb-4"
        >
          TOP 100 Aerospace &amp; Aviation
        </motion.p>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          Hangouts
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="text-[#c9a87c] text-xl md:text-2xl font-medium mb-8 italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          The community actually talks here.
        </motion.p>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="text-white/70 text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-4"
        >
          Come as you are. Leave with something useful.
        </motion.p>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="text-white/60 text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-3"
        >
          Hangouts is where the TOP 100 community gathers. No keynotes. No panels. No performance. Just real conversations, live builds, workshops, Q&As, and the occasional hackathon with people who actually know what they're talking about.
        </motion.p>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={5}
          className="text-[#c9a87c]/80 text-sm font-semibold tracking-wider uppercase mb-12"
        >
          Free · Open · Rolling · Weekly to Daily
        </motion.p>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={6}
          className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed"
        >
          This is aerospace, aviation, and space without the gatekeeping.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={7}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          id="register"
        >
          <a
            href="#register"
            className="px-8 py-4 rounded-full font-bold text-base bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_30px_rgba(201,168,124,0.35)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)]"
          >
            Register Free
          </a>
          <a
            href="#schedule"
            className="px-8 py-4 rounded-full font-bold text-base border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all"
          >
            See the Schedule
          </a>
        </motion.div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="h-px w-full max-w-4xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.3), transparent)' }} />

      {/* ── WHAT HAPPENS ── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">What happens at a Hangout?</p>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Some sessions are structured.<br />Most aren't. All of them are real.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sessions.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.5}
              className="rounded-2xl p-6 border border-white/8 hover:border-[#c9a87c]/30 transition-all group"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.2), rgba(201,168,124,0.05))' }}>
                <Icon className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2 group-hover:text-[#c9a87c] transition-colors">{label}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="h-px w-full max-w-4xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.3), transparent)' }} />

      {/* ── WHO'S IT FOR ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">Who's it for?</p>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Fellows. Alumni. Followers. Nominees.
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            If you've ever orbited the TOP 100 community and wondered what happens inside, this is the door.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.5}
              className="text-center rounded-2xl py-8 px-4 border border-white/8"
              style={{ background: 'rgba(201,168,124,0.05)' }}
            >
              <div
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl md:text-4xl font-bold text-[#c9a87c] mb-1"
              >
                {value}
              </div>
              <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center text-white/50 text-base italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          The room is already remarkable. Come find out.
        </motion.p>
      </section>

      {/* ── DIVIDER ── */}
      <div className="h-px w-full max-w-4xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.3), transparent)' }} />

      {/* ── WHAT IT LEADS TO ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Star className="w-8 h-8 text-[#c9a87c] mx-auto mb-6" />
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">What it leads to</p>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            The free layer of a growing program stack.
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-4">
            Hangouts is the free layer of a growing program stack. Consistent participants get first access to structured programs, including the TOP 100 Incubator, as they launch.
          </p>
          <p className="text-[#c9a87c] text-xl font-bold tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Show up. That's the whole qualification.
          </p>
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="px-6 md:px-12 py-24 text-center"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,124,0.06) 50%, transparent 100%)' }}
        id="schedule"
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Ready to show up?
          </h2>
          <p className="text-white/50 text-base mb-10">No keynotes. No panels. No performance. Just the community.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_40px_rgba(201,168,124,0.4)]"
            >
              Register Free <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all"
            >
              See the Schedule
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-8 border-t border-white/5 text-center">
        <p className="text-white/30 text-xs tracking-widest uppercase">
          TOP 100 Aerospace &amp; Aviation · Est. 2021 · Built on community.
        </p>
      </footer>
    </div>
  );
}