import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  PartyPopper,
  Hammer,
  Sparkles,
  Mic,
  MessageCircle,
  Check,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  X,
} from 'lucide-react';
import { captureRsvp } from '@/functions/captureRsvp';
import { base44 } from '@/api/base44Client';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import HomeDock from '@/components/home-v3/HomeDock';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';
const DEEP = '#07111f';

const LETS_TALK_URL = 'https://calendar.app.google/TrL8saY6XS6tdVj1A';

const EXPERIENCES = [
  {
    key: 'launch_party',
    kind: 'rsvp',
    title: 'TOP 100 2026 Launch Party',
    tagline: "New Year's Eve · December 31, 2026",
    description:
      'The kickoff celebration for the 2026 season. Honorees, builders, and operators ring in the new year together — virtual doors open worldwide.',
    icon: PartyPopper,
    accent: true,
    cta: 'RSVP',
  },
  {
    key: 'live_build',
    kind: 'waitlist',
    title: 'Live Builds',
    tagline: 'No date yet · Join the waitlist',
    description:
      'Real-time ship sessions where the community builds in public. Drop in, watch the work, and get pulled into the next one first.',
    icon: Hammer,
    cta: 'Join Waitlist',
  },
  {
    key: 'workshop',
    kind: 'waitlist',
    title: 'Workshops',
    tagline: 'No date yet · Join the waitlist',
    description:
      'Facilitated working sessions on the tactics that matter — measurement, narrative, ecosystem building. Seats are limited; waitlist gets first dibs.',
    icon: Sparkles,
    cta: 'Join Waitlist',
  },
  {
    key: 'ama',
    kind: 'waitlist',
    title: 'AMAs',
    tagline: 'No date yet · Join the waitlist',
    description:
      'Ask-me-anything sessions with honorees, operators, and mission leaders. Submit your questions early and claim a spot when dates drop.',
    icon: Mic,
    cta: 'Join Waitlist',
  },
  {
    key: 'lets_talk',
    kind: 'external',
    title: "Let's Talk!",
    tagline: 'Book a 1:1 with the team',
    description:
      'Have a partnership, nomination, or press question? Grab a slot on the calendar and we will meet you there.',
    icon: MessageCircle,
    cta: 'Book a Call',
    href: LETS_TALK_URL,
  },
];

export default function Rsvp() {
  const [selected, setSelected] = useState(null); // experience key
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [error, setError] = useState('');

  // Prefill from logged-in user when available
  useEffect(() => {
    base44
      .auth
      .me()
      .then((u) => {
        if (u?.email) setEmail(u.email);
        if (u?.full_name) setName(u.full_name);
      })
      .catch(() => {});
  }, []);

  const selectedExperience = selected ? EXPERIENCES.find((e) => e.key === selected) : null;

  const openForm = (exp) => {
    if (exp.kind === 'external') return; // handled by anchor
    setSelected(exp.key);
    setStatus('idle');
    setError('');
    setTimeout(() => {
      document.getElementById('rsvp-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const closeForm = () => {
    setSelected(null);
    setStatus('idle');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      await captureRsvp({
        experience_type: selected,
        user_email: email,
        user_name: name,
        party_size: selected === 'launch_party' ? partySize : 1,
        notes,
      });
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

      <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: `${GOLD}20` }}
          >
            <CalendarCheck className="h-4 w-4" style={{ color: GOLD }} />
            <span className="text-sm font-medium" style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}>
              RSVP · Reserve Your Seat
            </span>
          </motion.div>

          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Pick your moment.
          </h1>
          <p
            className="mx-auto max-w-xl text-base md:text-lg"
            style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
          >
            One door, every experience. RSVP to the next dated celebration, or join the waitlist for the
            live builds, workshops, and AMAs still on the runway.
          </p>
        </div>

        {/* Experience grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {EXPERIENCES.map((exp, i) => {
            const isExternal = exp.kind === 'external';
            const isActive = selected === exp.key;
            return (
              <motion.div
                key={exp.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all"
                style={{
                  borderColor: exp.accent ? `${GOLD}55` : `${NAVY}15`,
                  boxShadow: exp.accent ? '0 10px 40px rgba(201,168,124,0.18)' : undefined,
                  outline: isActive ? `2px solid ${GOLD}` : 'none',
                }}
              >
                {exp.accent && (
                  <span
                    className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #e0c79a)`, color: DEEP, fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Featured
                  </span>
                )}

                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: `${NAVY}08` }}
                >
                  <exp.icon className="h-5 w-5" style={{ color: GOLD }} />
                </div>

                <h3
                  className="mb-1 text-lg font-bold"
                  style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {exp.title}
                </h3>
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-[0.14em]"
                  style={{ color: GOLD, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {exp.tagline}
                </p>
                <p
                  className="mb-5 flex-1 text-sm leading-6"
                  style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}
                >
                  {exp.description}
                </p>

                {isExternal ? (
                  <a
                    href={exp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:brightness-105 active:scale-[0.98]"
                    style={{
                      background: `${NAVY}`,
                      color: CREAM,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {exp.cta} <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => openForm(exp)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:brightness-105 active:scale-[0.98]"
                    style={{
                      background: exp.accent
                        ? `linear-gradient(135deg, ${GOLD}, #e0c79a)`
                        : `${NAVY}`,
                      color: exp.accent ? DEEP : CREAM,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {exp.cta} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* RSVP / Waitlist form */}
        <AnimatePresence>
          {selectedExperience && (
            <motion.div
              id="rsvp-form"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-10 overflow-hidden"
            >
              <div
                className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm"
                style={{ borderColor: `${GOLD}40` }}
              >
                {status === 'success' ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${GOLD}20` }}>
                      <Check className="h-7 w-7" style={{ color: GOLD }} />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {selectedExperience.kind === 'rsvp' ? "You're on the list." : "You're on the waitlist."}
                    </h2>
                    <p className="max-w-sm text-sm" style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}>
                      {selectedExperience.kind === 'rsvp'
                        ? `We'll send your access details for ${selectedExperience.title} closer to the date.`
                        : `When ${selectedExperience.title} get a date, you'll hear first.`}
                    </p>
                    <button
                      onClick={closeForm}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-bold"
                      style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Back to all experiences <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="mb-1 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: GOLD, fontFamily: "'Montserrat', sans-serif" }}>
                          {selectedExperience.kind === 'rsvp' ? 'RSVP' : 'Waitlist'}
                        </p>
                        <h3 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {selectedExperience.title}
                        </h3>
                      </div>
                      <button type="button" onClick={closeForm} className="rounded-full p-1.5 text-[#07111f]/60 hover:bg-black/5" aria-label="Close">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Name">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Amelia Earhart"
                          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                          style={{ background: CREAM, border: `1px solid ${NAVY}20`, fontFamily: "'Montserrat', sans-serif" }}
                        />
                      </Field>
                      <Field label="Email">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                          style={{ background: CREAM, border: `1px solid ${NAVY}20`, fontFamily: "'Montserrat', sans-serif" }}
                        />
                      </Field>
                    </div>

                    {selected === 'launch_party' && (
                      <Field label="Party Size">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={partySize}
                          onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                          style={{ background: CREAM, border: `1px solid ${NAVY}20`, fontFamily: "'Montserrat', sans-serif" }}
                        />
                      </Field>
                    )}

                    <Field label="Notes (optional)">
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Anything we should know?"
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                        style={{ background: CREAM, border: `1px solid ${NAVY}20`, fontFamily: "'Montserrat', sans-serif" }}
                      />
                    </Field>

                    {error && (
                      <p className="text-sm font-medium" style={{ color: '#b91c1c', fontFamily: "'Montserrat', sans-serif" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #e0c79a)`, color: DEEP, fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          {selectedExperience.kind === 'rsvp' ? 'Confirm RSVP' : 'Join Waitlist'}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>


                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-24" />
      <HomeDock />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest" style={{ color: NAVY, fontFamily: "'Montserrat', sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}