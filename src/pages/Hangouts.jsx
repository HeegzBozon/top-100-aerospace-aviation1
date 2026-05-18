import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalNewsletterFooter from '@/components/shared/GlobalNewsletterFooter';
import {
  MessageCircle, Hammer, BookOpen, Mic, Zap, Flame, Users, Network,
  ChevronRight, ChevronLeft, Star, Award, Globe, TrendingUp, HelpCircle,
  ChevronDown, X, Sparkles, Check, Rocket, Moon, Heart, Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';
import DiscoveryQuestionnaireForm, { TRACKS } from '@/components/discovery/DiscoveryQuestionnaireForm';
import DiscoveryQuestionnaireReview from '@/components/discovery/DiscoveryQuestionnaireReview';

const CALENDAR_EMBED_ID = 'URctiv0FD5Mi8vQUADec';

function useIsLiveNow() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const check = () => {
      const pt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      const day = pt.getDay();
      const totalMin = pt.getHours() * 60 + pt.getMinutes();
      setLive(day >= 1 && day <= 5 && totalMin >= 810 && totalMin < 900);
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
  const [track, setTrack] = useState(null);
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

  const selectTrack = (id) => { setTrack(id); setSectionIndex(0); setDirection(1); };
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(4,10,20,0.97)', backdropFilter: 'blur(24px)' }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
              style={{ background: `radial-gradient(ellipse, ${accentColor} 0%, transparent 65%)` }} />
          </div>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            onClick={handleClose}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <X className="w-5 h-5" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.97 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full mx-4 rounded-3xl border flex flex-col"
            style={{ maxWidth: showScheduling ? '780px' : track ? '640px' : '760px', background: 'linear-gradient(160deg, #0d1f36 0%, #07111f 100%)', borderColor: `${accentColor}28`, maxHeight: '92vh', transition: 'max-width 0.4s ease' }}
          >
            <AnimatePresence mode="wait">
              {showScheduling ? (
                <motion.div key="scheduling" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.35 }} className="flex flex-col" style={{ maxHeight: '92vh' }}>
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Brief submitted — you're on!</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-1">Book your first 1:1</h2>
                    <p className="text-white/45 text-sm">Pick a time that works. We already have your brief.</p>
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#c9a87c]/40" style={{ background: 'rgba(201,168,124,0.08)' }}>
                      <Sparkles className="w-4 h-4 text-[#c9a87c] flex-shrink-0" />
                      <div>
                        <p className="text-white/60 text-xs mb-0.5">Apply your complimentary coupon at checkout:</p>
                        <p className="text-[#c9a87c] font-bold text-sm tracking-wider font-mono">PROJECTPHOENIXSUMER2026</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <iframe src={`https://api.leadconnectorhq.com/widget/booking/${BOOKING_WIDGET_ID}`} style={{ width: '100%', border: 'none', display: 'block', height: '800px' }} scrolling="yes" id={`${BOOKING_WIDGET_ID}_1`} />
                  </div>
                  <div className="px-8 py-5 border-t border-white/6 flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                      <Link to="/" onClick={handleClose} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/70 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>← Back to TOP 100</Link>
                      <Link to="/nominate" onClick={handleClose} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all" style={{ background: 'rgba(201,168,124,0.06)' }}>Nominate someone</Link>
                    </div>
                  </div>
                </motion.div>
              ) : !track ? (
                <motion.div key="picker" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="flex flex-col">
                  <div className="px-8 pt-8 pb-6 border-b border-white/6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#c9a87c]" />
                      <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Moon Joy Consulting Scholarship — Apply</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl md:text-3xl font-bold text-white mb-2">What brings you here?</h2>
                    <p className="text-white/45 text-sm">Pick the path that fits. We'll tailor the questions to what actually matters for you.</p>
                  </div>
                  <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRACK_OPTIONS.map((t, i) => (
                      <motion.button key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => selectTrack(t.id)}
                        className="text-left rounded-2xl p-5 border transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.color}50`; e.currentTarget.style.background = `${t.color}0a`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                        <div className="text-2xl mb-3">{t.emoji}</div>
                        <p className="text-white font-bold text-base mb-1">{t.label}</p>
                        <p className="text-white/45 text-xs leading-relaxed">{t.desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: t.color }}>Get started <ChevronRight className="w-3 h-3" /></div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-white/25 text-xs pb-6">All responses are confidential and used only to prepare for your 1:1.</p>
                </motion.div>
              ) : showReview ? (
                <motion.div key="review" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }} className="flex flex-col">
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>Review & Submit</span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white">Your Brief</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                    <DiscoveryQuestionnaireReview formData={formData} onBack={() => setShowReview(false)}
                      onSubmitComplete={() => { try { localStorage.removeItem(LS_KEY); } catch {} setShowScheduling(true); }} inline />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col" style={{ maxHeight: '92vh' }}>
                  <div className="px-8 pt-8 pb-5 border-b border-white/6 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                        {TRACK_OPTIONS.find(t => t.id === track)?.label} · Step {sectionIndex + 1} of {totalSections}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-4">{currentSection?.title}</h2>
                    <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${accentColor}, #d4a090)` }} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      {trackData.sections.map((_, idx) => (
                        <button key={idx} onClick={() => { setDirection(idx > sectionIndex ? 1 : -1); setSectionIndex(idx); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                          style={{ background: idx === sectionIndex ? accentColor : idx < sectionIndex ? `${accentColor}30` : 'rgba(255,255,255,0.05)', color: idx === sectionIndex ? '#07111f' : idx < sectionIndex ? accentColor : 'rgba(255,255,255,0.25)', transform: idx === sectionIndex ? 'scale(1.15)' : 'scale(1)', border: `1px solid ${idx < sectionIndex ? `${accentColor}40` : 'rgba(255,255,255,0.06)'}` }}>
                          {idx < sectionIndex ? <Check className="w-3 h-3" /> : idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div key={`${track}-${sectionIndex}`} custom={direction}
                        initial={{ opacity: 0, x: direction >= 0 ? 28 : -28 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction >= 0 ? -28 : 28 }} transition={{ duration: 0.26, ease: 'easeOut' }}>
                        <DiscoveryQuestionnaireForm track={track} sectionIndex={sectionIndex} formData={formData} setFormData={setFormData} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="px-8 py-5 border-t border-white/6 flex items-center justify-between gap-3 flex-shrink-0">
                    <button onClick={handlePrev} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white transition-colors border border-white/10 hover:border-white/20" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleNext}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #d4a090)`, color: '#07111f' }}>
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
    <div className="fixed inset-0 z-[200] flex items-start justify-center"
      style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(12px)', overflowY: 'auto', padding: '16px' }}
      onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#c9a87c]/30 my-auto"
        style={{ background: '#0d1f36', minWidth: 0 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 rounded-t-3xl z-10" style={{ background: '#0d1f36' }}>
          <div>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Operation: Moon Joy</p>
            <p className="text-white font-semibold text-sm">Join the Hangout · M–F, 1:30 PM Pacific</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div style={{ width: '100%' }}>
          <iframe src={`https://api.leadconnectorhq.com/widget/booking/${CALENDAR_EMBED_ID}`}
            style={{ width: '100%', border: 'none', display: 'block', height: '700px' }}
            scrolling="yes" id={`${CALENDAR_EMBED_ID}_modal`} />
        </div>
        <div className="px-6 py-5 border-t border-white/8">
          <div className="flex flex-wrap gap-2">
            <Link to="/" onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/70 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>← Back to TOP 100</Link>
            <Link to="/nominate" onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all" style={{ background: 'rgba(201,168,124,0.06)' }}>Nominate someone</Link>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:border-[#c9a87c]/60 transition-all" style={{ background: 'rgba(201,168,124,0.06)' }}>Invest on Wefunder ↗</a>
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

const pullQuote = (text) => (
  <div className="my-12 text-center">
    <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      className="text-3xl md:text-4xl font-bold text-[#c9a87c] leading-snug max-w-2xl mx-auto">
      "{text}"
    </p>
  </div>
);

const sessions = [
  { icon: MessageCircle, label: 'Shoot the Shit', desc: 'Open conversation. What\'s happening in the industry right now. What\'s frustrating you. What\'s working. What nobody else is saying publicly. No agenda. High signal.' },
  { icon: Hammer, label: 'Live Build', desc: 'Someone builds something in public — a pitch, a business model, a product, a content strategy. The room watches, reacts, and improves it in real time. You leave having watched something go from rough to sharp in 30 minutes.' },
  { icon: BookOpen, label: 'Workshop', desc: 'One host. One skill. 30 minutes. Negotiation. LinkedIn strategy. How to pitch research to non-technical investors. How to price your consulting. Leave knowing something you didn\'t.' },
  { icon: Flame, label: 'Hot Seat', desc: 'One person brings one challenge. The whole room helps solve it. No politeness. No performance. Real input from people who know what they are talking about.' },
  { icon: Mic, label: 'Q&A', desc: 'A Fellow or guest takes your questions. No script. No PR filter. No prepared talking points. Just the conversation you actually want to have.' },
  { icon: Zap, label: 'Hackathon', desc: 'Time-boxed. Collaborative. Build something together. The energy in a room of people solving a problem on a deadline is unlike anything else.' },
  { icon: Users, label: 'Breakout Rooms', desc: 'Any session can split into smaller rooms. By domain, by career stage, or completely random. The best conversations at conferences happen in hallways. We built the hallway. Four people in a breakout can do things forty people in a main session can\'t. Smaller. Faster. More honest.' },
  { icon: Network, label: 'Networking 101', desc: 'Once a month. The mechanics nobody teaches you. How to open a cold conversation with someone who has no idea who you are. How to follow up without being annoying. How to ask for what you want without feeling transactional. Live practice in breakout rooms. Real feedback.' },
  { icon: Globe, label: 'Townhall', desc: 'Your voice shapes what we build. Your challenges become our roadmap. You\'re not consuming this institution. You\'re building it with us.' },
];

const joyFundTiers = [
  { amount: '$0', name: 'Sponsored by the Community' },
  { amount: '$25', name: 'Friend of the Mission' },
  { amount: '$100', name: 'Supporter' },
  { amount: '$250', name: 'Contributor' },
  { amount: '$500', name: 'Champion' },
  { amount: '$1,000', name: 'Patron' },
  { amount: '$2,500', name: 'Mission Partner' },
  { amount: '$5,000', name: 'Mission Sponsor — you funded the room' },
  { amount: '$5,000+', name: 'Ad Astra — named, on the record' },
];

const squads = [
  { icon: Rocket, label: 'Space Squad', desc: 'Commercial space, launch, satellites, exploration' },
  { icon: Globe, label: 'Aviation Squad', desc: 'Commercial, military, regional, rotorcraft' },
  { icon: Zap, label: 'Engineering Squad', desc: 'Propulsion, structures, avionics, systems' },
  { icon: BookOpen, label: 'Policy Squad', desc: 'Regulation, law, government, international' },
  { icon: Star, label: 'Research Squad', desc: 'Academia, R&D, innovation, grants' },
  { icon: TrendingUp, label: 'Founder Squad', desc: 'Entrepreneurs, startups, operators, builders' },
  { icon: Users, label: 'Early Career Squad', desc: 'Students, new entrants, career pivots' },
];

const stats = [
  { value: '300+', label: 'Verified Fellows' },
  { value: '1,000+', label: 'Boosters' },
  { value: '40+', label: 'Countries' },
  { value: '70+', label: 'Disciplines' },
  { value: '13K+', label: 'In the Network' },
  { value: '6K+', label: 'Newsletter Subscribers' },
];

const socialProof = [
  { icon: TrendingUp, label: 'Promotions', desc: 'Fellows promoted directly citing their TOP 100 recognition in the conversation that led to the offer.' },
  { icon: Award, label: 'Raises', desc: 'Professionals negotiating raises using Fellow status as proof of external, community-verified validation.' },
  { icon: Globe, label: 'New Jobs', desc: 'People landing roles at organizations they couldn\'t have accessed before — with a verified credential behind them.' },
  { icon: Star, label: 'Green Cards & Visas', desc: 'TOP 100 recognition used on immigration applications as evidence of extraordinary ability. Immigration authorities said yes.' },
];

const whoForPrinciple = [
  { label: 'Curious', desc: 'Curious people ask the questions nobody else will ask in public. They sit in a room and actually listen. They change their mind when they hear something that earns it. They do not perform expertise. They pursue it.' },
  { label: 'Community', desc: 'Community people show up for others, not just themselves. They share what they know before they are asked. They introduce people who should know each other. They make the room better by being in it.' },
  { label: 'Memory-makers', desc: 'Memory-makers bring energy that leaves a mark. A story that lands. A moment of honesty that shifts the air in the room. An insight someone is still thinking about three weeks later. A connection that becomes a collaboration that becomes something neither of them could have built alone.' },
];

const whoFor = [
  { label: '300+ Fellows and Alumni', desc: 'The verified core of the community. Your consulting package is already sponsored. Book directly.' },
  { label: '1,000+ Boosters', desc: 'The people who have been vouching for excellence in this industry for years. Come be recognized for that.' },
  { label: '13,000+ followers and counting', desc: 'If you have been watching from the outside and wondering when to come in — this is when.' },
  { label: 'Founders and operators', desc: 'If you are building something and need a room that will actually help you build it, this is that room.' },
  { label: 'Early-career professionals', desc: 'If you are trying to get in the door of an industry that does not always make it easy, we built this room so you do not have to figure it out alone.' },
  { label: 'Local business owners, creatives, and adjacent builders', desc: 'If you bring curiosity, community, and the capacity to create memories, aerospace is not a prerequisite. The energy is.' },
  { label: 'People who have never heard of TOP 100 before today', desc: 'Welcome. You are exactly on time.' },
];

const faqs = [
  { q: 'Do I need to be a TOP 100 Fellow to join?', a: 'No. Operation: Moon Joy is open to Fellows, Alumni, Boosters, followers, nominees, and anyone in the broader TOP 100 community. If you\'ve ever orbited this space, you\'re welcome.' },
  { q: 'I\'m a Fellow or Alumni. How do I book my sponsored consulting package?', a: 'Your package is a benefit of your standing in this community. Book directly using the Alumni link. No application required.' },
  { q: 'I\'m a community member. How do I apply for a sponsored package?', a: 'Use the Community Application link. Three short questions. Values-based, not income-based. Approved participants receive their booking link within 48 hours.' },
  { q: 'What is the Joy Fund?', a: 'Every dollar contributed above $0 goes directly into the Joy Fund, which sponsors seats for community members who apply for access. Mission Sponsors ($5K) fund an entire session. The community funds itself.' },
  { q: 'What are Squads?', a: 'Domain-specific groups that form from consistent Hangout participants. Space, Aviation, Engineering, Policy, Research, Founder, Early Career. Show up to Hangouts, find your people, go deeper. Squads run their own sessions on their own cadence.' },
  { q: 'What are Chapters?', a: 'The in-person version. Geographic anchors for the community. Starting in LA, Seattle, and Houston. Every Chapter begins as a Squad. Every Squad begins in a Hangout.' },
  { q: 'What is Wefunder?', a: 'We are running a community ownership round through Wefunder. Minimum investment $100. If you want to be more than a participant — if you want to be a shareholder in what we are building — that is the door. wefunder.com/top.100.aerospace.aviation' },
  { q: 'What if I miss a session?', a: 'Sessions are recorded. Replays available. But showing up live is where the compounding happens. Replays don\'t have breakout rooms.' },
  { q: 'What\'s the commitment?', a: 'None. Come when you can. Come consistently if you want the full return.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden cursor-pointer hover:border-[#c9a87c]/30 transition-all"
      style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <p className="text-white text-sm font-semibold">{q}</p>
        <ChevronDown className={`w-4 h-4 text-[#c9a87c] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <div className="px-6 pb-5"><p className="text-white/60 text-sm leading-relaxed">{a}</p></div>}
    </div>
  );
}

export default function Hangouts() {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const isLive = useIsLiveNow();

  const CTAPrimary = ({ children, variant = 'rsvp' }) => (
    <button onClick={() => variant === 'package' ? setDiscoveryOpen(true) : setRsvpOpen(true)}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)] hover:shadow-[0_0_55px_rgba(201,168,124,0.55)] whitespace-nowrap">
      {children} <ChevronRight className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 55%, #111827 100%)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <RSVPModal open={rsvpOpen} onClose={() => setRsvpOpen(false)} />
      <DiscoveryOverlay open={discoveryOpen} onClose={() => setDiscoveryOpen(false)} />

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between gap-4 px-6 md:px-12 py-4 border-b border-white/5 sticky top-0 z-50" style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/" className="text-sm font-semibold tracking-widest text-[#c9a87c] uppercase">TOP 100</Link>
          {isLive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE NOW
            </span>
          )}
        </div>
        <GlobalNewsletterFooter currentPageName="Hangouts" variant="header" />
        <CTAPrimary>Join</CTAPrimary>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 pt-24 pb-28 max-w-4xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-15 blur-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="inline-flex items-center gap-2 mb-6">
          <Moon className="w-4 h-4 text-[#c9a87c]" />
          <span className="uppercase tracking-[0.35em] text-[#c9a87c] text-xs font-semibold">A TOP 100 Aerospace &amp; Aviation Community Initiative</span>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
          Operation:<br /><span className="text-[#c9a87c]">Moon Joy</span>
        </motion.h1>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="inline-block px-6 py-3 rounded-full border border-[#c9a87c]/30 mb-8"
          style={{ background: 'rgba(201,168,124,0.08)' }}>
          <p className="text-[#c9a87c] text-base font-bold">$6,500+ in expertise, resources, and access. Every session.</p>
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4">
          Invest what you can. $0 to $5K+. Nobody gets turned away.
        </motion.p>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3.5}
          className="text-white/40 text-base max-w-xl mx-auto leading-relaxed mb-12 italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          The only question is whether you show up.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <CTAPrimary>Join Operation: Moon Joy</CTAPrimary>
          <CTAPrimary variant="package">Alumni: Book Your Sponsored Session</CTAPrimary>
          <button onClick={() => setDiscoveryOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all whitespace-nowrap">
            Apply for Community Access
          </button>
          {isLive ? (
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm whitespace-nowrap"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />Happening Now · Join In
            </span>
          ) : (
            <span className="inline-flex items-center px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white/70 whitespace-nowrap">
              M–F · 1:30 PM Pacific
            </span>
          )}
        </motion.div>
      </section>

      {divider}

      {/* ── LET'S START WITH SOMETHING HONEST ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Let's start with something honest.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            I built this community and underestimated it.
          </h2>
          <div className="space-y-5 text-white/65 text-base leading-relaxed">
            <p>For years, I focused on building the platform, the program, the systems. The recognition engine. The governance. The publication. And while I was building all of that, something was happening in the community that I wasn't fully seeing.</p>
            <p>People were getting promoted.</p>
            <p>People were getting raises.</p>
            <p>People were landing jobs they couldn't have gotten without this credential behind them.</p>
            <p>And then the one that stopped me cold: people were using their TOP 100 recognition on green card and visa applications. As proof of excellence. As evidence that a government immigration body could point to and say: this person is extraordinary in their field.</p>
            <p className="text-white/80 font-medium">Let that land for a second.</p>
            <p>A community we built from nothing, in 2021, with no institutional backing and no paid acquisition, became a credential that immigration authorities recognize as proof of elite standing in aerospace, aviation, and space.</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="my-10 rounded-2xl p-8 border border-[#c9a87c]/25"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.03))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl md:text-2xl text-white font-bold leading-snug mb-4">
            A recognition platform built by a small team, from nothing, with no government backing, no university affiliation, no legacy institutional weight behind it — recognized by immigration authorities as a credible signal of elite standing.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            Something that a government body looks at and says: <span className="text-[#c9a87c] font-semibold">yes, this is evidence that this person is among the best in the world at what they do.</span>
          </p>
          <p className="text-white/40 text-xs mt-4 italic">We did not design that. The community earned it.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>I didn't see it coming. I underestimated what we were building. And I won't make that mistake again.</p>
          <p className="text-white font-semibold text-lg">That's why we're opening the room.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── SOCIAL PROOF ── */}
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

      {/* ── THE CONVERSATION ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The conversation you're not in. Yet.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            There are rooms where the real conversations happen.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>Not the conference panels. Not the keynotes. Not the polished LinkedIn posts.</p>
          <p>The rooms where someone gets an honest answer to the question they were afraid to ask publicly. Where a senior operator says what they actually think about where the industry is going. Where two people who've never met figure out they're solving the same problem from opposite ends and decide to work together.</p>
          <p>Where a founder gets the feedback that saves her company six months of wasted direction. Where a researcher gets the introduction that opens the door to the funding she's been circling for two years. Where someone finally asks: <em className="text-white/80">am I charging enough for this?</em> And the room tells her the truth.</p>
          <p>These rooms exist. They've always existed. They've just been hard to find, harder to get into, and almost impossible to replicate.</p>
        </motion.div>
        {pullQuote("We just built the room.")}
      </section>

      {divider}

      {/* ── WHAT OPERATION: MOON JOY IS ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">What Operation: Moon Joy is.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
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
          {['How do we take TOP 100 further?', 'How do we take you further?', 'How do we take your business further?', 'How do we take your career further?', 'How do we take this community further, globally and at home?'].map((q, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[#c9a87c] font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-white text-sm font-medium">{q}</p>
            </div>
          ))}
          <p className="text-white/40 text-xs pt-4 italic text-center tracking-widest uppercase">Think global. Act locally. Ad Astra.</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed">
          <p>The agenda belongs to the room. If you come in with something pressing, we work on it. If you come in with a question you've been sitting on, we answer it. If you come in with a win, we celebrate it and figure out how to build on it.</p>
          <p>If nobody has an agenda, we bring ours. Where TOP 100 is going. How we think we can help you, the community, and the world. Roadmaps, problem solving, strategic introductions, development plans, monetization, marketing, content strategy.</p>
          <p className="text-white font-semibold">What we never do: waste your time.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE MASTERMIND PRINCIPLE ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Mastermind Principle. Why This Works.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            There is nothing new about what we are doing here.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-8">
          <p>The most successful builders in history did not build alone. They understood something that most people never act on.</p>
        </motion.div>
        {pullQuote("Your mind alone has a ceiling.")}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>Two minds in genuine collaboration do not simply add. They multiply. The shared energy, the cross-pollination of experience, the moment when someone says something that unlocks something in someone else that neither of them could have reached independently. That is not a happy accident. That is the principle at work.</p>
          <p>The question has never been whether masterminds work. The question has always been <span className="text-white font-semibold">who is in the room.</span></p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="my-10 rounded-2xl p-8 border border-[#c9a87c]/25"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.03))' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">This is where TOP 100 changes the equation.</p>
          <p className="text-white/65 text-base leading-relaxed mb-4">This community was built on verification. Not self-reporting. Not dues paid. Not follower counts. Every Fellow in this network was nominated, endorsed, and recognized by peers who staked their own credibility on the claim that this person is exceptional in their field.</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 mb-10">
          {[{ value: '300+', label: 'Verified minds' }, { value: '70+', label: 'Disciplines' }, { value: '40+', label: 'Countries' }, { value: '5', label: 'Seasons of trust' }].map(({ value, label }) => (
            <div key={label} className="text-center rounded-xl py-5 px-4 border border-white/8" style={{ background: 'rgba(201,168,124,0.05)' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-[#c9a87c] mb-1">{value}</div>
              <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/30"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold text-white mb-3">That is the room you are joining.</p>
          <p className="text-white/50 text-sm leading-relaxed mb-4">A verified, credentialed, cross-domain community that has been building trust with each other since 2021. It has been meeting informally, in hallways and DMs and side conversations, for years.</p>
          <p className="text-[#c9a87c] font-bold text-base">We just built it.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── SESSION TYPES ── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-3">What actually happens in a session.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white">
            Every Moon Joy Hangout is different because every room is different.
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
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            Every Moon Joy Hangout: $5,000+ in value.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-4 text-white/65 text-sm leading-relaxed mb-10">
          {[
            'People pay $300 to $500 an hour for the kind of consulting expertise that comes into this room.',
            'Group coaching sessions with senior operators, founders, and practitioners at this level run $5,000 minimum per session.',
            'Strategic introductions from a network spanning 40+ countries and 70+ disciplines in aerospace, aviation, and space? Those take years to build. Some of them you never get access to without knowing the right person.',
            'Startup resources. Business development frameworks. Sales and marketing strategy. Content planning. Growth architecture. These are things founders pay advisors tens of thousands of dollars a year to access.',
            'And then there is the community itself.',
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
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Invested into this community. Every session.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl md:text-3xl font-bold text-[#c9a87c]">
            Because the return isn't captured. It's compounded.
          </p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE JOY FUND ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Joy Fund.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            Every Moon Joy Hangout carries a $5,000 value.<br />Pay what you can.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-4 text-white/65 text-sm leading-relaxed mb-10">
          <p>Start from $0. Go as high as you want. Every dollar invested by those who can goes directly toward sponsored seats for those who cannot. The community funds itself.</p>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl overflow-hidden border border-white/10 mb-8">
          {joyFundTiers.map(({ amount, name }, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 py-4 border-b border-white/5 ${amount === '$0' ? 'opacity-60' : ''}`}
              style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(201,168,124,0.02)' }}>
              <span className="text-[#c9a87c] font-bold text-sm w-20 flex-shrink-0">{amount}</span>
              <span className="text-white/70 text-sm">{name}</span>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center rounded-2xl p-6 border border-[#c9a87c]/20 mb-8"
          style={{ background: 'rgba(201,168,124,0.05)' }}>
          <p className="text-white/50 text-xs mb-2">Nobody gets turned away because of what they can invest.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-[#c9a87c]">That is the whole point.</p>
        </motion.div>
        {pullQuote("Pay it forward. Double it. Pass it on.")}
      </section>

      {divider}

      {/* ── MOON JOY CONSULTING SCHOLARSHIP ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto" id="package">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-14 border border-[#c9a87c]/30 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.1), rgba(13,31,54,0.8))' }}>
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#c9a87c]/40 mb-6" style={{ background: 'rgba(201,168,124,0.12)' }}>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">The Moon Joy Consulting Scholarship</p>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            For TOP 100 Fellows and Alumni:<br />your package is already sponsored.
          </h2>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Three sessions. One hour each. Direct access. Sponsored in full by the Joy Fund. No application. No waitlist. Book directly.
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
          <p className="text-white/50 text-sm mb-8">For community members outside the Alumni network: a limited number of sponsored packages are available each quarter. Three questions. Values-based, not income-based. Approved participants receive their booking link within 48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAPrimary variant="package">Alumni: Book Your Sponsored Session</CTAPrimary>
            <button onClick={() => setDiscoveryOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all whitespace-nowrap">
              Apply for a Community Package
            </button>
          </div>
        </motion.div>
      </section>

      {divider}

      {/* ── WHAT THIS LEADS TO — SQUADS ── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">What this leads to.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-6">
            Operation: Moon Joy is not a destination.<br />It's the beginning of a progression.
          </h2>
        </motion.div>

        {/* Funnel */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14 text-sm font-bold">
          {['Moon Joy Hangout', 'Squad', 'Collective', 'Chapter', 'Incubator'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-xl border border-[#c9a87c]/40 text-[#c9a87c]"
                style={{ background: 'rgba(201,168,124,0.08)' }}>{step}</div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-white/30" />}
            </div>
          ))}
        </motion.div>

        {/* Squads intro */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-10 space-y-4 text-white/65 text-base leading-relaxed">
          <p>Squads are what forms from consistent Hangout participation. Domain-specific groups. Smaller rooms. More specific conversations. More powerful outcomes.</p>
          <p className="text-white font-semibold">But Squads are more than community groups.</p>
          <p>They are the foundation of consulting collectives.</p>
        </motion.div>

        {/* Collective callout */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-2xl p-8 border border-[#c9a87c]/25 mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(13,31,54,0.8))' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The Consulting Collective.</p>
          <p className="text-white/70 text-sm leading-relaxed mb-3">When a project comes in that is too large or complex for one person — or needs diverse expertise across disciplines — Squad members can bid on it together. Each person maintains their own independent practice. Each person keeps their own clients and their own rates. For this project, they show up as a collective. They split the revenue. They deliver together.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-[#c9a87c] my-5">Think of it as the Avengers for client work. Assembled for the mission. Independent after it.</p>
          <p className="text-white/65 text-sm leading-relaxed mb-3">What makes it work is what happened before it: the weeks of Hangouts where you watched how someone thinks, how they handle pressure, how they teach, how they ask for help. The trust is built before the project exists.</p>
          <p className="text-white font-semibold text-sm">That is the unfair advantage.</p>
        </motion.div>

        {/* Squad grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {squads.map(({ icon: Icon, label, desc }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
              className="rounded-2xl p-6 border border-white/8 hover:border-[#c9a87c]/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.2), rgba(201,168,124,0.05))' }}>
                <Icon className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <p className="text-white font-bold text-sm mb-1">{label}</p>
              <p className="text-white/50 text-xs">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How to start */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-2xl p-7 border border-white/8 space-y-3"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-white font-semibold text-sm mb-1">Each Squad runs its own Hangout cadence. Smaller. More specific. More powerful.</p>
          <p className="text-white/60 text-sm leading-relaxed">Start small. Three people maximum on a first Collective project. Run one pilot. Test it before making anything official. The platform provides the governance template. The community provides the trust. You provide the work.</p>
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-center text-white/40 text-sm mt-8 italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Show up to the first session. The rest finds you.
        </motion.p>
      </section>

      {divider}

      {/* ── WHO'S LEADING THIS ── */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Who's in the room.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white leading-snug">
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
            { label: 'One of 66 Founding Ambassadors', desc: 'Selected from 1,221 applicants to Base44\'s inaugural cohort. Top 5%.' },
            { label: 'Master Certified OKR Professional', desc: 'Founder of Pineapple EMPIRE — a strategy studio and venture platform. Twelve years building and advising across local business strategy, marketing, software, and events.' },
            { label: 'Built TOP 100 from Zero', desc: '2021. No institutional backing. No paid acquisition. No existing brand in this space. Just a conviction that this community existed and deserved to be seen.' },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl p-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
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

      {/* ── COMMUNITY STATS ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The community. And why I've been underestimating it.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
            TOP 100 isn't just a recognition platform.<br />It's a credential that compounds.
          </h2>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="space-y-5 text-white/65 text-base leading-relaxed mb-10">
          <p>I need to tell you something I don't say enough.</p>
          <p>What we built here is more important than I knew when we were building it.</p>
          <p>I have spent five years focused on the platform: the governance, the selection process, the publication, the verification engine, the editorial standards. Building the institution. And while I was doing that, the community was doing something I was not fully tracking.</p>
          <p className="text-white font-semibold text-lg">It was changing lives.</p>
          <p>Not in the abstract, inspirational way that platforms like to claim. In specific, documented, real-world ways.</p>
          <p>Fellows have been promoted. Directly citing their TOP 100 recognition in the conversation that led to the offer. Professionals have negotiated raises using their Fellow status as proof of external validation — not internal performance reviews, but an independent community-verified credential that said: this person is exceptional, and the field has recognized it.</p>
          <p>People have landed jobs at organizations they could not have gotten into before because they could point to something beyond their resume. A verified, permanent record of contribution and recognition in aerospace, aviation, and space.</p>
          <p>The truth is that TOP 100 is not just a recognition platform. It is a credential that compounds. Every season adds to the permanence of the record. Every endorsement adds to the verification layer. Every published Volume becomes part of the institutional archive. The longer it runs, the more weight it carries.</p>
          <p>This community has been doing extraordinary work in aerospace, aviation, and space for decades. TOP 100 gave that work a permanent, verified, institutional address.</p>
          <p className="text-white font-semibold text-lg">We are just getting started with what that means.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
              className="text-center rounded-2xl py-7 px-4 border border-white/8"
              style={{ background: 'rgba(201,168,124,0.05)' }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold text-[#c9a87c] mb-1">{value}</div>
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

      {/* ── WHO IT'S FOR ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">Who this is for.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            Simple.
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-8">
            Clean principle. Three gates, all attitude-based. No credential required.
          </p>
          <p className="text-white/70 text-base leading-relaxed mb-10 font-medium">
            If you can provide curiosity, if you can provide community, and if you can provide something that gives people memories — you belong here. That is the whole filter.
          </p>
        </motion.div>

        <div className="space-y-4 mb-12">
          {whoForPrinciple.map(({ label, desc }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.3}
              className="rounded-2xl p-7 border border-[#c9a87c]/20"
              style={{ background: 'rgba(201,168,124,0.04)' }}>
              <p className="text-[#c9a87c] font-bold text-base mb-2 uppercase tracking-wide">{label}</p>
              <p className="text-white/65 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-white/65 text-base leading-relaxed mb-10">
          If that is you — in any combination, at any career stage, from any corner of aerospace, aviation, space, or anywhere adjacent — this room is yours.
        </motion.p>

        <div className="space-y-3 mb-10">
          {whoFor.map(({ label, desc }, i) => (
            <motion.div key={label} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.2}
              className="rounded-xl p-5 border border-white/8 flex gap-4 items-start"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] mt-2 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm mb-1">{label}</p>
                <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-7 border border-[#c9a87c]/30 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(201,168,124,0.02))' }}>
          <p className="text-white/70 text-sm leading-relaxed mb-2">The only thing we ask is the same thing the principle asks.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-xl font-bold text-white mb-1">Bring curiosity. Bring community. Bring something that gives people memories.</p>
          <p className="text-[#c9a87c] font-semibold text-sm mt-3">The room will do the rest.</p>
        </motion.div>
      </section>

      {divider}

      {/* ── THE INSTITUTION ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The institution behind it.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug">
            TOP 100 Aerospace & Aviation. Est. 2021.
          </h2>
          <p className="text-white/50 text-sm mb-8">Here is what we are, how we work, where we are going, and what we do with every dollar invested in this community. No pitch deck language. No corporate gloss. Just the truth.</p>
        </motion.div>

        {/* Philosophy */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/20 mb-6"
          style={{ background: 'rgba(201,168,124,0.04)' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The philosophy.</p>
          {pullQuote("We don't rank. We measure.")}
          <p className="text-white/65 text-sm leading-relaxed mb-3">That distinction matters more than it might seem. Rankings create winners and losers. Measurement creates records. A ranking is a moment in time. A record is permanent.</p>
          <p className="text-white/65 text-sm leading-relaxed mb-3">What we built is the institutional infrastructure that aerospace and aviation has never had: a credentialed community, a verified talent graph, and a live activation layer — all in one platform. The index, the archive, the governance system, and now the community engagement layer through Operation: Moon Joy.</p>
          <p className="text-white/65 text-sm leading-relaxed">Think of it as the Chamber of Commerce for the new space economy. Operation: Moon Joy is the activation surface. The talent graph is the moat.</p>
        </motion.div>

        {/* Business model */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-white/8 mb-6"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">The business model.</p>
          <div className="space-y-4">
            {[
              { label: 'Self-funding layer — operational now', desc: 'A white-label agency serving aerospace companies with websites, apps, AI voice receptionists, and marketing automation. $297/month base. This funds operations while the platform scales.' },
              { label: 'Community investment layer — launching now', desc: 'The Joy Fund through Operation: Moon Joy. Contributions from $25 to $5K+ per session. The community invests in itself.' },
              { label: 'Sponsorship & corporate partnership layer — active', desc: 'Aerospace primes, defense contractors, VC firms, and strategic corporates pay for access to a verified, credentialed audience across 40+ countries. Packages from $5,000 per episode.' },
              { label: 'Multimedia layer — in development', desc: 'A professional YouTube and podcast platform built on the TOP 100 Fellow network. 80+ full-length interviews and 400+ short-form clips annually.' },
              { label: 'Structured programs layer — coming', desc: 'The TOP 100 Incubator. Cohort-based. Application or invitation. Built from consistent Operation: Moon Joy participants.' },
              { label: 'Institutional capital layer — on the horizon', desc: 'Series A targeted Q4 2026–Q1 2027. Target investors include Seraphim Space, Space Capital, Pivotal Ventures, and Backstage Capital.' },
            ].map(({ label, desc }) => (
              <div key={label} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <p className="text-[#c9a87c] font-bold text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className="text-white/55 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Use of funds */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-white/8 mb-6"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">Use of funds. The Joy Fund is transparent by design.</p>
          <div className="space-y-3">
            {[
              { label: 'Sponsored seat access', desc: 'The primary use. Every sponsored application approved draws from the Joy Fund. You fund someone\'s seat. They show up. The community grows stronger.' },
              { label: 'Session infrastructure', desc: 'Google Meet, recording, replay hosting, content clipping. Operation: Moon Joy generates content that feeds the platform and the multimedia strategy simultaneously.' },
              { label: 'Consulting scholarship packages', desc: 'Sponsored 1:1 packages for community members who qualify. Your contribution funds three hours of direct advisory access for someone who could not otherwise access it.' },
              { label: 'Platform development', desc: 'The technical layer — Base44, GHL, Stripe — that makes every session possible at scale.' },
              { label: 'Community programs', desc: 'Squad formation, Chapter launch support, Networking 101 curriculum, Incubator program design.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-xs mb-0.5">{label}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-5 italic">For Wefunder investors: full use of funds disclosure is on the campaign page at wefunder.com/top.100.aerospace.aviation</p>
        </motion.div>

        {/* 2030 vision teaser */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="rounded-2xl p-8 border border-[#c9a87c]/25"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(13,31,54,0.8))' }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-4">The 2030 vision.</p>
          <p className="text-white/65 text-sm leading-relaxed mb-4">The U.S. aerospace and defense industry represents nearly $1 trillion in annual revenue. A projected talent gap of one million workers by 2030. A generation of extraordinary women already doing the work, still not visible enough in the rooms where decisions get made.</p>
          <div className="space-y-2 mb-5">
            {[
              'Ten Volumes published. A decade of institutional record.',
              '1,000+ verified Fellows across 50+ countries.',
              'Flightography: the definitive career record system for aerospace professionals.',
              'The TOP 100 Angels Index: the investor side of the recognition system.',
              'Chapter cities on every continent.',
              'Operation: Moon Joy running daily across Squad and Chapter networks globally.',
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] mt-1.5 flex-shrink-0" />
                <p className="text-white/65 text-xs leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-xs mb-2">We are in Year 5. We know what the next five years build toward.</p>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-base font-bold text-[#c9a87c]">This is the institution you are investing in when you show up. We are building something that will outlast all of us.</p>
          <Link to="/2030-vision" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-[#c9a87c] hover:text-white transition-colors">
            Read the full 2030 Vision <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </section>

      {divider}

      {/* ── FINAL CTA ── */}
      <section className="px-6 md:px-12 py-28 text-center" id="schedule"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,124,0.07) 50%, transparent 100%)' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="uppercase tracking-[0.25em] text-[#c9a87c] text-xs font-semibold mb-5">What happens if you don't show up.</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-2xl mx-auto">
            The conversations happen without you.
          </h2>
          <p className="text-white/50 text-base mb-4 max-w-xl mx-auto">The connections get made. The introductions happen. The problems get solved. The career moments occur. In rooms you were not in.</p>
          <p className="text-white/60 text-base mb-2">That has always been true.</p>
          <p className="text-white/70 text-base mb-6">But now there is a room you do not have to earn your way into. One designed specifically to invest in you.</p>
          <p className="text-[#c9a87c] font-bold text-lg mb-4 italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Joy is the mission.</p>
          <p className="uppercase tracking-[0.3em] text-[#c9a87c] text-xs font-semibold mb-8">Free · Open · M–F · 1:30 PM Pacific</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <CTAPrimary>Join Operation: Moon Joy</CTAPrimary>
            <CTAPrimary variant="package">Alumni: Book Your Sponsored Session</CTAPrimary>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white hover:border-[#c9a87c]/50 hover:text-[#c9a87c] transition-all whitespace-nowrap">
              Invest on Wefunder ↗
            </a>
          </div>
        </motion.div>
      </section>

      {divider}

      {divider}

      {/* ── FAQ ── */}
      <section className="px-6 md:px-12 py-20 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
          <HelpCircle className="w-7 h-7 text-[#c9a87c] mx-auto mb-4" />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl md:text-3xl font-bold text-white">Questions.</h2>
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
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-white/20 text-xs italic mb-2">
          Think global. Act locally. Ad Astra. Joy is the mission.
        </p>
        <p className="text-white/20 text-xs tracking-widest uppercase">
          TOP 100 Aerospace &amp; Aviation · Est. 2021 · Governed by contribution. Built in community. Built with community.
        </p>
      </footer>
    </div>
  );
}