import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ChevronRight, Check, Sparkles, Compass, Telescope, Rocket, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import HomeDock from '@/components/home-v3/HomeDock';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

const GC_STATS = [
  { value: '2021', label: 'Established' },
  { value: '300+', label: 'Verified Fellows' },
  { value: '40+', label: 'Countries' },
  { value: '70+', label: 'Disciplines' },
];

const GC_PERKS = [
  'Operating infrastructure installed & managed for you',
  'The verified reputation graph — searchable, not ranked',
  'Direct messaging to opted-in Fellows & operators',
  'Design-partner pricing for the first five employers',
];

const PERKS = [
  {
    icon: Compass,
    title: 'The Dispatch',
    body: 'Weekly signal brief — who moved, what launched, where the money went in aerospace & aviation.',
  },
  {
    icon: Telescope,
    title: 'Early Access',
    body: 'First look at each Volume, Moon Joy sessions, and Local Legends drops before they go public.',
  },
  {
    icon: Sparkles,
    title: 'The Verified Graph',
    body: 'Curated introductions to the verified reputation network — no rankings, just measurement.',
  },
];

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      await subscribeNewsletter({ email, name, source: 'general' });
      setStatus('success');
    } catch {
      setStatus('idle');
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <AnnouncementBanner />
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: `${GOLD}20` }}
          >
            <Mail className="h-4 w-4" style={{ color: GOLD }} />
            <span
              className="text-sm font-medium"
              style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
            >
              The Dispatch · Free, forever
            </span>
          </motion.div>

          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Not a ranking. A record.
          </h1>
          <p
            className="mx-auto max-w-xl text-base md:text-lg"
            style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            Join the verified reputation graph for aerospace & aviation. One email a week.
            No spam, no noise — just signal.
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 rounded-2xl border bg-white p-6 md:p-8 shadow-sm"
          style={{ borderColor: `${NAVY}15` }}
        >
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: `${GOLD}20` }}
              >
                <Check className="h-7 w-7" style={{ color: GOLD }} />
              </div>
              <h2
                className="text-2xl font-bold"
                style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                You're in.
              </h2>
              <p
                className="max-w-sm text-sm"
                style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
              >
                Check your inbox for a confirmation. The Dispatch lands weekly.
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center gap-1 text-sm font-bold"
                style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
              >
                Back to home <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-widest"
                  style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
                >
                  Name <span className="opacity-50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amelia Earhart"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: CREAM,
                    border: `1px solid ${NAVY}20`,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-widest"
                  style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: CREAM,
                    border: `1px solid ${NAVY}20`,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                />
              </div>

              {error && (
                <p
                  className="text-sm font-medium"
                  style={{ color: '#b91c1c', fontFamily: "'Montserrat', sans-serif" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #e0c79a)`,
                  color: '#07111f',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe to The Dispatch'}
                <ChevronRight className="h-4 w-4" />
              </button>

              <p
                className="text-center text-xs"
                style={{ color: `${NAVY}80`, fontFamily: "'Montserrat', sans-serif" }}
              >
                We route every subscriber through GoHighLevel. Unsubscribe anytime.
              </p>
            </form>
          )}
        </motion.div>

        {/* Perks */}
        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-2xl p-5"
              style={{ background: `${NAVY}06` }}
            >
              <perk.icon className="mb-3 h-6 w-6" style={{ color: GOLD }} />
              <h3
                className="mb-1.5 text-base font-bold"
                style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
              >
                {perk.title}
              </h3>
              <p
                className="text-sm leading-6"
                style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
              >
                {perk.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Ground Control upsell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 overflow-hidden rounded-2xl"
          style={{ background: '#07111f' }}
        >
          <div className="relative px-6 py-10 md:px-12 md:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,124,0.18), transparent 55%)' }}
            />
            <div className="relative">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ borderColor: `${GOLD}40`, background: `${GOLD}12`, color: GOLD, fontFamily: "'Montserrat', sans-serif'" }}
              >
                <Rocket className="h-3.5 w-3.5" /> Ground Control
              </div>

              <h2
                className="mb-4 text-3xl font-bold leading-tight md:text-4xl text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Aerospace runs on relationships.
                <br />
                <span style={{ color: GOLD }}>Ground Control keeps none from falling through the cracks.</span>
              </h2>
              <p
                className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/55"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Operating infrastructure for aerospace & aviation businesses — installed and managed for you.
              </p>

              <div className="mb-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
                {GC_STATS.map((s) => (
                  <div key={s.label} className="bg-[#07111f] px-4 py-5 text-center">
                    <p
                      className="text-2xl"
                      style={{ color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <ul className="mb-8 space-y-2.5">
                {GC_PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-white/75">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                    <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{perk}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/ground-control"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #d8b98d)`, color: '#07111f', fontFamily: "'Montserrat', sans-serif" }}
              >
                Explore Ground Control <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="h-24" />
      <HomeDock />
    </div>
  );
}