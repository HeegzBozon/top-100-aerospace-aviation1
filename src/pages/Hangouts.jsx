import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle, Hammer, BookOpen, Mic, Zap, Flame, Users, Network,
  ChevronRight, Star, Award, Globe, TrendingUp, HelpCircle, ChevronDown, X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const CALENDAR_EMBED_ID = 'URctiv0FD5Mi8vQUADec';

function RSVPModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    // Inject LeadConnector embed script if not already present
    if (!document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://link.msgsndr.com/js/form_embed.js';
      s.type = 'text/javascript';
      document.body.appendChild(s);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[#c9a87c]/30 overflow-hidden"
        style={{ background: '#0d1f36' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">TOP 100 Mastermind</p>
            <p className="text-white font-semibold text-sm">RSVP · M–F, 1:30 PM Pacific</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-2" style={{ minHeight: 520 }}>
          <iframe
            src={`https://api.leadconnectorhq.com/widget/booking/${CALENDAR_EMBED_ID}`}
            style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: 500 }}
            scrolling="no"
            id={`${CALENDAR_EMBED_ID}_modal`}
          />
        </div>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.06, ease: 'easeOut' } }),
};

const divider = (
  <div className="h-px w-full max-w-4xl mx-auto my-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,124,0.25), transparent)' }} />
);

const sessions = [
  { icon: MessageCircle, label: 'Shoot the Shit',  desc: 'Open conversation. What\'s happening in the industry right now. What\'s frustrating you. What\'s working. What nobody else is saying publicly. No agenda. High signal.' },
  { icon: Hammer,        label: 'Live Build',       desc: 'Someone builds something in public — a pitch, a business model, a content strategy, a product. The room watches, reacts, and improves it in real time.' },
  { icon: BookOpen,      label: 'Workshop',         desc: 'One host. One skill. 30 minutes. Negotiation. LinkedIn strategy. How to pitch research to non-technical investors. How to price your consulting. Leave knowing something you didn\'t.' },
  { icon: Flame,         label: 'Hot Seat',         desc: 'One person brings one challenge. The whole room helps solve it. Real input from people who know what they\'re talking about.' },
  { icon: Mic,           label: 'Q&A',              desc: 'A Fellow or guest takes your questions. No script. No PR filter. No prepared talking points. Just the conversation you actually want to have.' },
  { icon: Zap,           label: 'Hackathon',        desc: 'Time-boxed. Collaborative. Build something together. The energy in a room of people solving a problem on a deadline is unlike anything else.' },
  { icon: Users,         label: 'Breakout Rooms',   desc: 'By domain, career stage, or completely random. Four people in a breakout can do things forty people in a main session can\'t. Smaller. Faster. Honest.' },
  { icon: Network,       label: 'Networking 101',   desc: 'Once a month. How to open a cold conversation. How to follow up without being annoying. How to ask and give. Live practice with real feedback from real people.' },
  { icon: Globe,         label: 'Townhall',         desc: 'Your voice shapes what we build. Your challenges become our roadmap. Your questions drive what we workshop next. You\'re not consuming this institution. You\'re building it.' },
];

const stats = [
  { value: '300+',  label: 'Verified Fellows' },
  { value: '1,000+', label: 'Boosters' },
  { value: '40+',   label: 'Countries' },
  { value: '70+',   label: 'Disciplines' },
  { value: '13K+',  label: 'In the Network' },
  { value: '6K+',   label: 'Newsletter Subscribers' },
];

const socialProof = [
  { icon: TrendingUp, label: 'Promotions', desc: 'Fellows promoted directly citing their TOP 100 recognition in the conversation that led to the offer.' },
  { icon: Award,      label: 'Raises',     desc: 'Professionals negotiating raises using Fellow status as proof of external, community-verified validation.' },
  { icon: Globe,      label: 'New Jobs',   desc: 'People landing roles at organizations they couldn\'t have accessed before — with a verified credential behind them.' },
  { icon: Star,       label: 'Green Cards & Visas', desc: 'TOP 100 recognition used on immigration applications as evidence of extraordinary ability. Immigration authorities said yes.' },
];

const whoFor = [
  { label: 'Fellows and Alumni',           desc: 'You built this community with us. This is your room first.' },
  { label: 'Followers and Boosters',       desc: 'You\'ve been orbiting TOP 100 for years. This is the door to the inside.' },
  { label: 'Nominees and candidates',      desc: 'You\'re on the path to recognition. Come meet the community you\'re becoming part of.' },
  { label: 'Founders and operators',       desc: 'Building in aerospace, aviation, space, or any adjacent field? The network in this room is the one you need.' },
  { label: 'Early-career professionals',  desc: 'Trying to navigate a field that doesn\'t always make it easy to get in the room? We built this room so you don\'t have to figure it out alone.' },
];

const faqs = [
  { q: 'Do I need to be a TOP 100 Fellow to join?', a: 'No. The Mastermind is open to Fellows, Alumni, Boosters, followers, nominees, and anyone in the broader TOP 100 community. If you\'ve ever orbited this space, you\'re welcome.' },
  { q: 'What if I don\'t have anything to contribute?', a: 'You have more than you think. Show up. The room has a way of surfacing what people didn\'t know they could give.' },
  { q: 'What does "first come, first served" mean for the 1:1 package?', a: 'Bandwidth determines how many active 1:1 packages we can support at one time. When we\'re at capacity, new requests go on a waitlist. We reach out as spots open. Claim yours now to lock your place.' },
  { q: 'What if I miss a session?', a: 'Sessions are recorded. You can catch the replay. But showing up live is where the compounding happens. Replays don\'t have breakout rooms.' },
  { q: 'What\'s the commitment?', a: 'None. Come when you can. Come consistently if you want the full return.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/8 rounded-xl overflow-hidden cursor-pointer hover:border-[#c9a87c]/30 transition-all"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <p className="text-white text-sm font-semibold">{q}</p>
        <ChevronDown className={`w-4 h-4 text-[#c9a87c] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-white/60 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const CTASecondary = ({ children, href = '#schedule' }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all whitespace-nowrap"
  >
    {children}
  </a>
);

export default function Hangouts() {
  const [rsvpOpen, setRsvpOpen] = useState(false);

  const CTAPrimary = ({ children, isRSVP = false }) => (
    <button
      onClick={() => setRsvpOpen(true)}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)] hover:shadow-[0_0_55px_rgba(201,168,124,0.55)] whitespace-nowrap"
    >
      {children} <ChevronRight className="w-4 h-4" />
    </button>
  );

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 55%, #111827 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}
    >
      <RSVPModal open={rsvpOpen} onClose={() => setRsvpOpen(false)} />

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50" style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
        <CTAPrimary>RSVP to the Mastermind</CTAPrimary>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-24 pb-28 max-w-4xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-15 blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="uppercase tracking-[0.35em] text-[#c9a87c] text-xs font-semibold mb-5">
          TOP 100 Aerospace &amp; Aviation
        </motion.p>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Hangouts
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="inline-block px-6 py-3 rounded-full border border-[#c9a87c]/30 mb-8"
          style={{ background: 'rgba(201,168,124,0.08)' }}>
          <p className="text-[#c9a87c] text-base font-bold">$6,500+ in expertise, resources, and access. Every session. Free.</p>
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          The only question is whether you show up.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <CTAPrimary>RSVP to the Mastermind — Free</CTAPrimary>
          <CTAPrimary>Claim Your 1:1 Package — Limited</CTAPrimary>
          <span className="inline-flex items-center px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white/70 whitespace-nowrap">M–F · 1:30 PM Pacific</span>
        </motion.div>
      </section>

      {divider}

      {/* ── LET'S START WITH SOMETHING HONEST ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Let's start with something honest.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            I built this community and underestimated it.
          </h2>
          <div className="space-y-5 text-white/65 text-base leading-relaxed">
            <p>For years, I focused on building the platform, the program, the systems. The recognition engine. The governance. The publication. And while I was building all of that, something was happening in the community that I wasn't fully seeing.</p>
            <p>People were getting promoted. People were getting raises. People were landing jobs they couldn't have gotten without this credential behind them.</p>
            <p>And then the one that stopped me cold:</p>
          </div>
        </motion.div>

        {/* Social proof callout */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="my-10 rounded-2xl p-8 border border-[#c9a87c]/25"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.03))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-xl md:text-2xl text-white font-bold leading-snug mb-4">
            People were using their TOP 100 recognition on green card and visa applications. As proof of excellence.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            As evidence that a government immigration body could point to and say: <span className="text-[#c9a87c] font-semibold">this person is extraordinary in their field.</span>
          </p>
          <p className="text-white/40 text-xs mt-4 italic">A community we built from nothing, in 2021, with no institutional backing and no paid acquisition.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>I didn't see it coming. I underestimated what we were building. And I won't make that mistake again.</p>
          <p className="text-white font-semibold text-lg">That's why we're opening the room.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── SOCIAL PROOF CALLOUTS ── */}
      <section className="px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-10">
          What this community has already done
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {socialProof.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.4}
              className="rounded-2xl p-6 border border-white/8 hover:border-[#c9a87c]/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.2), rgba(201,168,124,0.05))' }}>
                <Icon className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{label}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {divider}

      {/* ── THE CONVERSATION YOU'RE NOT IN ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The conversation you're not in. Yet.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            There are rooms where the real conversations happen.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>Not the conference panels. Not the keynotes. Not the polished LinkedIn posts.</p>
          <p>The rooms where someone gets an honest answer to the question they were afraid to ask publicly. Where a senior operator says what they actually think about where the industry is going. Where two people who've never met figure out they're solving the same problem from opposite ends and decide to work together.</p>
          <p>Where a founder gets the feedback that saves her company six months of wasted direction. Where a researcher gets the introduction that opens the door to the funding she's been circling for two years. Where someone finally asks: <em className="text-white/80">am I charging enough for this?</em> And the room tells her the truth.</p>
          <p>These rooms exist. They've always existed. They've just been hard to find, harder to get into, and almost impossible to replicate.</p>
          <p className="text-white font-semibold text-lg">We built one. And then we opened it.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── WHAT THE MASTERMIND IS ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">What the TOP 100 Mastermind is.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            Not a webinar. Not a panel. Not a lecture.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>A community coaching session. Live. Real time. Shaped entirely by who shows up.</p>
          <p>Every session, we come in with five questions.</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/20 space-y-3 mb-10"
          style={{ background: 'rgba(201,168,124,0.05)' }}>
          {[
            'How do we take TOP 100 further?',
            'How do we take you further?',
            'How do we take your business further?',
            'How do we take your career further?',
            'How do we take this community further, globally and at home?',
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[#c9a87c] font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-white text-sm font-medium">{q}</p>
            </div>
          ))}
          <p className="text-white/40 text-xs pt-4 italic text-center tracking-widest uppercase">Think global. Act locally. Ad Astra.</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>The agenda belongs to the room. If you come in with something pressing, we work on it. If you come in with a question, we answer it. If you come in with a win, we celebrate it and figure out how to build on it.</p>
          <p className="text-white font-semibold">What we never do: waste your time.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── SESSION TYPES ── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">What actually happens in a session.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white">
            Every Hangout is different because every room is different.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
              className="rounded-2xl p-6 border border-white/8 hover:border-[#c9a87c]/30 transition-all group"
              style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(8px)' }}>
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

      {divider}

      {/* ── THE VALUE ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The value. Honestly accounted for.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            Every Hangout session: $5,000+ in value.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-4 text-white/65 text-sm leading-relaxed mb-10">
          {[
            'People pay $300–$500/hr for the kind of consulting expertise that comes into this room.',
            'Group coaching sessions with senior operators, founders, and practitioners at this level run $5,000 minimum. Per session.',
            'Strategic introductions from a network spanning 40+ countries and 70+ disciplines in aerospace, aviation, and space? Those take years to build.',
            'Startup resources. Business development frameworks. Sales and marketing strategy. Content planning. Growth architecture. Founders pay advisors tens of thousands a year to access this.',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] mt-2 flex-shrink-0" />
              <p>{item}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30 text-center mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(201,168,124,0.03))' }}>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Invested into this community. Freely.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl md:text-3xl font-bold text-[#c9a87c]">
            Because the return isn't captured. It's compounded.
          </p>
          <p className="text-white/40 text-sm mt-4">You get value here. You take it further. You bring someone with you.<br />Pay it forward. Double it. Pass it on.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── 1:1 PACKAGE ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto" id="package">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-14 border border-[#c9a87c]/30 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#c9a87c]/40 mb-6"
            style={{ background: 'rgba(201,168,124,0.12)' }}>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Limited Availability</p>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            And there's more.
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            For a limited time, every participant receives a <strong className="text-white">free 1:1 consulting and coaching package.</strong><br />
            Three sessions. One hour each. Direct access.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left max-w-2xl mx-auto">
            {['Startup strategy', 'Career & business development', 'Platform & product thinking', 'Marketing & content planning', 'Sales & growth architecture', 'Wherever you need to go'].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] mt-1.5 flex-shrink-0" />
                <p className="text-white/70 text-xs">{item}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 mb-8">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Total value per participant</p>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-4xl font-bold text-[#c9a87c]">$6,500+</p>
            <p className="text-white/40 text-xs mt-1">$1,500+ in individual advisory. Included. For joining.</p>
          </div>
          <p className="text-white/50 text-sm mb-8">No pitch. No upsell. Just work. Bandwidth-limited — when capacity is reached, you go on the waitlist. First come, first served. One package per person.</p>
          <CTAPrimary>Claim Your 1:1 Package — Limited Availability</CTAPrimary>
        </motion.div>
      </section>

      {divider}

      {/* ── WHO'S LEADING THIS ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Who's leading this.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white leading-snug">
            Matthew Higa.<br /><span className="text-[#c9a87c]">Founder and CEO, TOP 100 Aerospace & Aviation.</span>
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Eagle Scout', desc: 'The discipline of earning something before anyone hands it to you. The habits of a Scout don\'t leave you. They just find new terrain.' },
            { label: 'Spartan Trifecta Finisher', desc: 'Currently in training for Spartan Ultra attempt #2. The Ultra broke me the first time. I\'m going back. Because that\'s what you do.' },
            { label: '20+ Years Software Engineering', desc: 'Solution architect and systems leader across autonomy, LiDAR, ADAS, perception engineering, and enterprise platform programs. Not theory. Production systems.' },
            { label: 'Tesla — MattyChat!', desc: 'Internal automation toolkit that directly generated $5M+ in vehicle sales and influenced $100M+ in additional revenue. Doubled conversion rates across 3,000+ customer interactions.' },
            { label: 'P3 — Safety-Critical Programs', desc: 'Architecture and Agile delivery across safety-critical perception and autonomy programs for global OEMs. Fast-moving environments where the cost of getting it wrong is measured in more than dollars.' },
            { label: 'One of 66 Founding Ambassadors', desc: 'Selected from 1,221 applicants to Base44\'s inaugural cohort. Top 5%. I didn\'t apply for the credential. I already build on the platform.' },
            { label: 'Master Certified OKR Professional', desc: 'Founder of Pineapple EMPIRE — a strategy studio and venture platform. Twelve years building and advising across local business strategy, marketing, software, and event planning.' },
            { label: 'Built TOP 100 from Zero', desc: '2021. No institutional backing. No paid acquisition. No existing brand in this space. Just a conviction that this community existed and deserved to be seen.' },
          ].map(({ label, desc }, i) => (
            <div key={label} className="rounded-xl p-5 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[#c9a87c] font-bold text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mt-8 rounded-2xl p-6 border border-[#c9a87c]/20"
          style={{ background: 'rgba(201,168,124,0.05)' }}>
          <p className="text-white/60 text-sm leading-relaxed italic">
            Outside the work: indie game developer. Trumpet for hire. FIDE Master in training. The disciplines keep stacking — improvisation, pattern recognition, strategic depth, endurance, signal versus noise. They all show up in the room.
          </p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE COMMUNITY ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The community. And why I've been underestimating it.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            TOP 100 isn't just a recognition platform.<br />It's a credential that compounds.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>Every season adds to the permanence of the record. Every endorsement adds to the verification layer. Every published volume becomes part of the institutional archive. The longer it runs, the more weight it carries. The more weight it carries, the more it means on every document, application, portfolio, and conversation where it appears.</p>
          <p>This community has been doing extraordinary work in aerospace, aviation, and space for decades. TOP 100 gave that work a permanent, verified, institutional address.</p>
          <p className="text-white font-semibold text-lg">We are just getting started with what that means.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
              className="text-center rounded-2xl py-7 px-4 border border-white/8"
              style={{ background: 'rgba(201,168,124,0.05)' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-3xl font-bold text-[#c9a87c] mb-1">{value}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center text-white/40 text-sm mt-6 italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Zero paid acquisition. Built organically over five years. The residue of trust.
        </motion.p>
      </section>

      {divider}

      {/* ── 90 DAYS ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Think about where you want to be in 90 days.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            That's the chain reaction.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-6 text-white/65 text-base leading-relaxed">
          {[
            'You show up to the first Hangout. You bring a question you\'ve been sitting on. Or a challenge you\'re stuck on. Or just curiosity. The room gives you something you couldn\'t have gotten anywhere else.',
            'You come back the next week. You bring someone with you. You contribute something to the room this time.',
            'By session four, you\'ve met people across three disciplines you\'ve never intersected with before. One becomes a collaborator. One becomes a reference. One introduces you to someone who changes the trajectory of something you\'re building.',
            'Your 1:1 sessions go deeper. You work through the specific thing that\'s been holding your business, your career, or your thinking in place.',
            'By session twelve, you\'re one of the people in the room that others are showing up to hear from.',
          ].map((text, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-[#07111f]"
                style={{ background: '#c9a87c' }}>{i + 1}</div>
              <p>{text}</p>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mt-10 text-center">
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-xl text-white/70 italic mb-2">
            The question isn't whether this community can do that for you.
          </p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl text-white font-bold">
            The question is whether you'll show up.
          </p>
        </motion.div>
      </section>

      {divider}

      {/* ── WHO IT'S FOR / NOT FOR ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">Who this is for.</p>
            <div className="space-y-4">
              {whoFor.map(({ label, desc }) => (
                <div key={label} className="rounded-xl p-5 border border-white/8"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-white font-bold text-sm mb-1">{label}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={2}>
            <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">Who this is not for.</p>
            <div className="rounded-xl p-6 border border-white/8 mb-6"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-white/65 text-sm leading-relaxed">
                If you're looking to consume without contributing, this isn't the room. The Mastermind compounds when everyone brings something. That doesn't mean you need to be an expert. It means you need to show up with honesty, curiosity, and the intention to give as well as receive.
              </p>
              <p className="text-white/40 text-xs mt-4 italic">If that's not you yet — no judgment. Come to the first session. That usually changes things.</p>
            </div>
            <div className="rounded-xl p-6 border border-[#c9a87c]/20"
              style={{ background: 'rgba(201,168,124,0.05)' }}>
              <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">A word about what this costs.</p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-4xl font-bold text-white mb-3">Nothing.</p>
              <p className="text-white/55 text-sm leading-relaxed">The sessions are free. The 1:1 package is free. The access is free. The only thing we ask: show up. Contribute. And when you get something here, pass it forward.</p>
              <p className="text-[#c9a87c] font-bold text-sm mt-4">Pay it forward. Double it. Pass it on.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {divider}

      {/* ── FINAL CTA ── */}
      <section
        className="px-6 md:px-12 py-28 text-center"
        id="schedule"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,124,0.07) 50%, transparent 100%)' }}
      >
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">What happens if you don't show up.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-2xl mx-auto">
            The conversations happen without you.
          </h2>
          <p className="text-white/50 text-base mb-4 max-w-xl mx-auto">The connections get made. The introductions happen. The problems get solved. In rooms you weren't in.</p>
          <p className="text-white/70 text-base mb-12">But now there's one you don't have to earn your way into.</p>
          <p className="uppercase tracking-[0.3em] text-[#c9a87c] text-xs font-semibold mb-6">Free · Open · M–F · 1:30 PM Pacific</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <CTAPrimary>RSVP to the Mastermind — Free</CTAPrimary>
            <CTAPrimary>Claim Your 1:1 Package — Limited</CTAPrimary>
          </div>
        </motion.div>
      </section>

      {divider}

      {/* ── FAQ ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
          <HelpCircle className="w-7 h-7 text-[#c9a87c] mx-auto mb-4" />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl md:text-3xl font-bold text-white">Questions you might have.</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}>
              <FAQ {...faq} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5 text-center">
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-white/20 text-xs italic mb-2">Think global. Act locally. Ad Astra.</p>
        <p className="text-white/20 text-xs tracking-widest uppercase">
          TOP 100 Aerospace &amp; Aviation · Est. 2021 · Governed by contribution. Built in community. Built with community.
        </p>
      </footer>
    </div>
  );
}