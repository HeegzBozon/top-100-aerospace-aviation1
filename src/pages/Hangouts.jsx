import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Hammer, BookOpen, Mic, Zap, Flame, Users, Network,
  ChevronRight, ChevronLeft, Star, Award, Globe, TrendingUp, HelpCircle,
  ChevronDown, X, Sparkles, Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DiscoveryQuestionnaireForm, { TRACKS } from '@/components/discovery/DiscoveryQuestionnaireForm';
import DiscoveryQuestionnaireReview from '@/components/discovery/DiscoveryQuestionnaireReview';

const CALENDAR_EMBED_ID = 'URctiv0FD5Mi8vQUADec';

function useIsLiveNow() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      // Convert to Pacific time
      const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      const day = pt.getDay(); // 0=Sun, 6=Sat
      const h = pt.getHours();
      const m = pt.getMinutes();
      const totalMin = h * 60 + m;
      // M–F (1–5), 1:30 PM (810 min) – 3:00 PM (900 min)
      setLive(day >= 1 && day <= 5 && totalMin >= 90 + 720 && totalMin < 180 + 720);
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);
  return live;
}

const TRACK_OPTIONS = [
  { id: 'consulting', label: 'Consulting', emoji: '🧠', desc: 'Strategy, architecture, systems, technical advisory', color: '#c9a87c' },
  { id: 'coaching',   label: 'Coaching',   emoji: '🚀', desc: 'Career navigation, leadership, personal growth',   color: '#d4a090' },
  { id: 'partner',   label: 'Partnership', emoji: '🤝', desc: 'Sponsorship, co-branding, content, talent pipeline', color: '#a8c9d4' },
  { id: 'general',   label: 'General',     emoji: '💬', desc: 'Something else on your mind — just say hi',        color: '#c9a87c' },
];

const BOOKING_WIDGET_ID = 'ecQ2KuPT6vntXMcNyrnu';

function DiscoveryOverlay({ open, onClose }) {
  const LS_KEY = 'discovery_questionnaire_v2';
  const [track, setTrack] = useState(null);         // null = picker screen
  const [sectionIndex, setSectionIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [formData, setFormData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(formData)); } catch {}
  }, [formData]);

  const trackData = track ? TRACKS[track] : null;
  const totalSections = trackData ? trackData.sections.length : 0;
  const progress = trackData ? ((sectionIndex + 1) / totalSections) * 100 : 0;
  const accentColor = track ? TRACK_OPTIONS.find(t => t.id === track)?.color || '#c9a87c' : '#c9a87c';

  const selectTrack = (id) => {
    setTrack(id);
    setSectionIndex(0);
    setDirection(1);
  };

  const handleNext = () => {
    if (sectionIndex < totalSections - 1) { setDirection(1); setSectionIndex(s => s + 1); }
    else setShowReview(true);
  };
  const handlePrev = () => {
    if (showReview) { setShowReview(false); return; }
    if (sectionIndex > 0) { setDirection(-1); setSectionIndex(s => s - 1); }
    else { setTrack(null); setDirection(-1); }
  };

  const handleClose = () => {
    setTrack(null); setSectionIndex(0); setShowReview(false); setShowScheduling(false);
    onClose();
  };

  // Load the booking widget script once scheduling is shown
  useEffect(() => {
    if (!showScheduling) return;
    const scriptId = 'lc-form-embed-script';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.src = 'https://link.msgsndr.com/js/form_embed.js';
      s.type = 'text/javascript';
      s.id = scriptId;
      document.body.appendChild(s);
    }
  }, [showScheduling]);

  const currentSection = trackData?.sections[sectionIndex];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="dq-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(4,10,20,0.97)', backdropFilter: 'blur(24px)' }}
        >
          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
              style={{ background: `radial-gradient(ellipse, ${accentColor} 0%, transparent 65%)` }}
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
              className="absolute bottom-[-15%] right-[10%] w-[400px] h-[400px] rounded-full"
              style={{ background: 'radial-gradient(ellipse, #1e3a5a 0%, transparent 70%)' }}
            />
          </div>

          {/* Close */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            onClick={handleClose}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full mx-4 rounded-3xl border flex flex-col"
            style={{
              maxWidth: showScheduling ? '780px' : track ? '640px' : '760px',
              background: 'linear-gradient(160deg, #0d1f36 0%, #07111f 100%)',
              borderColor: `${accentColor}28`,
              maxHeight: '92vh',
              transition: 'max-width 0.4s ease',
            }}
          >
            {/* ── TRACK PICKER ── */}
            <AnimatePresence mode="wait">
              {showScheduling ? (
                /* ── SCHEDULING ── */
                <motion.div
                  key="scheduling"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col"
                  style={{ maxHeight: '92vh' }}
                >
                  {/* Header */}
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Brief submitted — you're on!</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-1">
                      Book your first 1:1
                    </h2>
                    <p className="text-white/45 text-sm">Pick a time that works. We already have your brief — no need to repeat yourself.</p>

                    {/* Coupon callout */}
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#c9a87c]/40"
                      style={{ background: 'rgba(201,168,124,0.08)' }}>
                      <Sparkles className="w-4 h-4 text-[#c9a87c] flex-shrink-0" />
                      <div>
                        <p className="text-white/60 text-xs mb-0.5">Apply your complimentary coupon at checkout:</p>
                        <p className="text-[#c9a87c] font-bold text-sm tracking-wider font-mono">PROJECTPHOENIXSUMER2026</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking iframe */}
                  <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <iframe
                      src={`https://api.leadconnectorhq.com/widget/booking/${BOOKING_WIDGET_ID}`}
                      style={{ width: '100%', border: 'none', display: 'block', height: '800px' }}
                      scrolling="yes"
                      id={`${BOOKING_WIDGET_ID}_1778971710952`}
                    />
                  </div>

                  {/* Footer — next steps */}
                  <div className="px-8 py-5 border-t border-white/6 flex-shrink-0">
                    <p className="text-white/40 text-xs mb-3">While you're here — what's next?</p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/" onClick={handleClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        ← Back to TOP 100
                      </Link>
                      <Link to="/nominate" onClick={handleClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all"
                        style={{ background: 'rgba(201,168,124,0.06)' }}>
                        Nominate someone
                      </Link>
                      <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all"
                        style={{ background: 'rgba(201,168,124,0.06)' }}>
                        Follow our fundraising journey ↗
                      </a>
                    </div>
                  </div>
                </motion.div>

              ) : !track ? (
                <motion.div
                  key="picker"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <div className="px-8 pt-8 pb-6 border-b border-white/6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#c9a87c]" />
                      <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">1:1 Package — Claim Your Spot</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      className="text-2xl md:text-3xl font-bold text-white mb-2">
                      What brings you here?
                    </h2>
                    <p className="text-white/45 text-sm">Pick the path that fits. We'll tailor the questions to what actually matters for you.</p>
                  </div>
                  <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRACK_OPTIONS.map((t, i) => (
                      <motion.button
                        key={t.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectTrack(t.id)}
                        className="text-left rounded-2xl p-5 border transition-all group"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.color}50`; e.currentTarget.style.background = `${t.color}0a`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      >
                        <div className="text-2xl mb-3">{t.emoji}</div>
                        <p className="text-white font-bold text-base mb-1">{t.label}</p>
                        <p className="text-white/45 text-xs leading-relaxed">{t.desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: t.color }}>
                          Get started <ChevronRight className="w-3 h-3" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-white/25 text-xs pb-6">All responses are confidential and used only to prepare for your 1:1.</p>
                </motion.div>

              ) : showReview ? (
                /* ── REVIEW ── */
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>Review & Submit</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white">Your Brief</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                    <DiscoveryQuestionnaireReview
                      formData={formData}
                      onBack={() => setShowReview(false)}
                      onSubmitComplete={() => {
                        try { localStorage.removeItem(LS_KEY); } catch {}
                        setShowScheduling(true);
                      }}
                      inline
                    />
                  </div>
                </motion.div>

              ) : (
                /* ── FORM STEPS ── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col"
                  style={{ maxHeight: '92vh' }}
                >
                  {/* Header */}
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                        {TRACK_OPTIONS.find(t => t.id === track)?.label} · Step {sectionIndex + 1} of {totalSections}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      className="text-2xl font-bold text-white mb-4">
                      {currentSection?.title}
                    </h2>
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accentColor}, #d4a090)` }}
                      />
                    </div>
                    {/* Step dots */}
                    <div className="flex gap-2 mt-3">
                      {trackData.sections.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setDirection(idx > sectionIndex ? 1 : -1); setSectionIndex(idx); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                          style={{
                            background: idx === sectionIndex ? accentColor : idx < sectionIndex ? `${accentColor}30` : 'rgba(255,255,255,0.05)',
                            color: idx === sectionIndex ? '#07111f' : idx < sectionIndex ? accentColor : 'rgba(255,255,255,0.25)',
                            transform: idx === sectionIndex ? 'scale(1.15)' : 'scale(1)',
                            border: `1px solid ${idx < sectionIndex ? `${accentColor}40` : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          {idx < sectionIndex ? <Check className="w-3 h-3" /> : idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable questions */}
                  <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={`${track}-${sectionIndex}`}
                        custom={direction}
                        initial={{ opacity: 0, x: direction >= 0 ? 28 : -28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction >= 0 ? -28 : 28 }}
                        transition={{ duration: 0.26, ease: 'easeOut' }}
                      >
                        <DiscoveryQuestionnaireForm
                          track={track}
                          sectionIndex={sectionIndex}
                          formData={formData}
                          setFormData={setFormData}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer nav */}
                  <div className="px-8 py-5 border-t border-white/6 flex items-center justify-between gap-3 flex-shrink-0">
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white transition-colors border border-white/10 hover:border-white/20"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #d4a090)`, color: '#07111f' }}
                    >
                      {sectionIndex === totalSections - 1 ? 'Review & Submit' : 'Next'}
                      {sectionIndex < totalSections - 1 && <ChevronRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RSVPModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
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
      className="fixed inset-0 z-[200] flex items-start justify-center"
      style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(12px)', overflowY: 'auto', padding: '16px' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[#c9a87c]/30 my-auto"
        style={{ background: '#0d1f36', minWidth: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 rounded-t-3xl z-10" style={{ background: '#0d1f36' }}>
          <div>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">TOP 100 Mastermind</p>
            <p className="text-white font-semibold text-sm">RSVP · M–F, 1:30 PM Pacific</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div style={{ width: '100%' }}>
          <iframe
            src={`https://api.leadconnectorhq.com/widget/booking/${CALENDAR_EMBED_ID}`}
            style={{ width: '100%', border: 'none', display: 'block', height: '700px' }}
            scrolling="yes"
            id={`${CALENDAR_EMBED_ID}_modal`}
          />
        </div>
        {/* Next steps */}
        <div className="px-6 py-5 border-t border-white/8">
          <p className="text-white/40 text-xs mb-3">While you're here — what's next?</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/" onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              ← Back to TOP 100
            </Link>
            <Link to="/nominate" onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all"
              style={{ background: 'rgba(201,168,124,0.06)' }}>
              Nominate someone
            </Link>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all"
              style={{ background: 'rgba(201,168,124,0.06)' }}>
              Follow our fundraising journey ↗
            </a>
          </div>
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
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const isLive = useIsLiveNow();

  const CTAPrimary = ({ children, variant = 'rsvp' }) => (
    <button
      onClick={() => variant === 'package' ? setDiscoveryOpen(true) : setRsvpOpen(true)}
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
      <DiscoveryOverlay open={discoveryOpen} onClose={() => setDiscoveryOpen(false)} />

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 z-50" style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE NOW
            </span>
          )}
        </div>
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
          <CTAPrimary variant="package">Claim Your 1:1 Package — Limited</CTAPrimary>
          {isLive ? (
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm whitespace-nowrap"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Happening Now · Join In
            </span>
          ) : (
            <span className="inline-flex items-center px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white/70 whitespace-nowrap">M–F · 1:30 PM Pacific</span>
          )}
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

      {/* ── THE MASTERMIND PRINCIPLE ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Mastermind Principle. Why This Works.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            There is nothing new about what we are doing here.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>The most successful builders in history did not build alone. They understood something that most people never act on.</p>
          <p className="text-white font-semibold text-lg">Your mind alone has a ceiling.</p>
          <p>Two minds in genuine collaboration do not simply add. They multiply. The shared energy, the cross-pollination of experience, the moment when someone says something that unlocks something in someone else that neither of them could have reached independently. That is not a happy accident. That is the principle at work.</p>
          <p>When a group of people comes together with a common purpose, in a spirit of honest collaboration, something emerges that is greater than the sum of what any individual brought in. A collective intelligence. A compounded resourcefulness. An acceleration that no amount of solo effort can replicate.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="my-10 rounded-2xl p-8 border border-[#c9a87c]/25"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.03))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-xl md:text-2xl text-white font-bold leading-snug mb-4">
            That principle has been documented, studied, and validated across every domain of human achievement for over a century.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            It is not motivational mythology. It is how things actually get built.
          </p>
          <p className="text-[#c9a87c] font-semibold text-sm mt-4">The question has never been whether masterminds work. The question has always been <em>who is in the room.</em></p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">This is where TOP 100 changes the equation.</p>
          <p className="text-white/65 text-base leading-relaxed mb-6">A mastermind is only as powerful as the minds in it. The signal is only as strong as the people generating it.</p>
          <p className="text-white/65 text-base leading-relaxed mb-8">This community was built on verification. Not self-reporting. Not dues paid. Not follower counts. Every Fellow in this network was nominated, endorsed, and recognized by peers who staked their own credibility on the claim that this person is exceptional in their field.</p>
        </motion.div>

        {/* Community proof strip */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 mb-10">
          {[
            { value: '300+', label: 'Verified minds' },
            { value: '70+', label: 'Disciplines' },
            { value: '40+', label: 'Countries' },
            { value: '5', label: 'Seasons of trust' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center rounded-xl py-5 px-4 border border-white/8"
              style={{ background: 'rgba(201,168,124,0.05)' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-2xl font-bold text-[#c9a87c] mb-1">{value}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>Engineers and executives. Researchers and founders. Policy architects and mission specialists. Commercial operators and next-generation leaders. Across 40+ countries. Eight domains. Five seasons of compounding institutional trust.</p>
          <p>When that room comes together around a real problem, a real challenge, a real question — the collective intelligence in that session is unlike anything available through any other channel. Not a conference. Not a LinkedIn group. Not an alumni network. Not a coaching program with a rotating cast of strangers.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <p className="text-white/65 text-base leading-relaxed mb-4">A verified, credentialed, cross-domain community that has been building trust with each other since 2021.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-2xl font-bold text-white mb-3">That is the mastermind you are joining.</p>
          <p className="text-white/50 text-sm leading-relaxed mb-4">And it has been meeting informally, in hallways and DMs and side conversations, for years.</p>
          <p className="text-[#c9a87c] font-bold text-base">We just built the room.</p>
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
          <CTAPrimary variant="package">Claim Your 1:1 Package — Limited Availability</CTAPrimary>
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
            <CTAPrimary variant="package">Claim Your 1:1 Package — Limited</CTAPrimary>
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