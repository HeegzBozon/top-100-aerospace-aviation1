import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ChevronRight, Check, Sparkles, Compass, Telescope } from 'lucide-react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import HomeDock from '@/components/home-v3/HomeDock';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

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
            We don't rank. We measure.
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
      </div>

      <div className="h-24" />
      <HomeDock />
    </div>
  );
}