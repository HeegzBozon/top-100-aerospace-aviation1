import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Zap, LayoutList, BookOpen, Flame, ChevronRight, Users, Star, Play, Copy, Check, Radio, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  { icon: Zap, label: 'Session Selector', desc: 'Answer 3 questions, get a tailored agenda recommendation.', path: '/session-portal/selector', color: '#c9a87c' },
  { icon: Flame, label: 'Warm-Up Activities', desc: 'Quick energizers to open the room and get people present.', path: '/session-portal/warmup', color: '#f97316' },
  { icon: LayoutList, label: 'Agenda Builder', desc: 'Drag-and-drop your tactic sequence. Run it live with a timer.', path: '/session-portal/agenda', color: '#6366f1' },
  { icon: BookOpen, label: 'Tactics Library', desc: 'Browse and search all facilitation tactics. Add your own.', path: '/session-portal/tactics', color: '#10b981' },
];

function generateCode() {
  const words = ['MOON', 'ORBIT', 'NOVA', 'APEX', 'LIFT', 'STAR', 'FUEL', 'WAVE'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}-${num}`;
}

function ActiveRoomBanner({ session, onEnd }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/session-portal/join/${session.code}`;

  const copy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#c9a87c]/40 p-5 mb-8"
      style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.12), rgba(13,31,54,0.8))' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
          </div>
          <div>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Room is Live</p>
            <p className="text-white font-bold text-lg">{session.title || 'Moon Joy Session'}</p>
          </div>
        </div>
        <button onClick={onEnd} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5" /> End Session
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Join code */}
        <div className="rounded-xl border border-white/15 px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Join Code</p>
          <p className="text-[#c9a87c] text-2xl font-bold tracking-widest font-mono">{session.code}</p>
        </div>
        {/* Participants */}
        <div className="rounded-xl border border-white/15 px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">In the Room</p>
          <p className="text-white text-2xl font-bold">{session.participant_count || 0}</p>
          <p className="text-white/40 text-xs">participants</p>
        </div>
        {/* Share link */}
        <button onClick={copy} className="rounded-xl border border-white/15 px-4 py-3 text-left hover:border-[#c9a87c]/40 transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Share Link</p>
          <div className="flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/50" />}
            <p className="text-white/70 text-xs truncate">{copied ? 'Copied!' : joinUrl}</p>
          </div>
        </button>
      </div>

      {/* Nav to tools */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <Link to="/session-portal/warmup" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/10 transition-colors">
          <Flame className="w-3.5 h-3.5" /> Run a Warm-Up
        </Link>
        <Link to="/session-portal/selector" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c9a87c]/30 text-[#c9a87c] hover:bg-[#c9a87c]/10 transition-colors">
          <Zap className="w-3.5 h-3.5" /> Pick a Session
        </Link>
        <Link to="/session-portal/agenda" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/10 transition-colors">
          <LayoutList className="w-3.5 h-3.5" /> Open Agenda
        </Link>
      </div>
    </motion.div>
  );
}

export default function SessionWelcome({ liveSession, setLiveSession }) {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);

  // Poll for participant count updates
  useEffect(() => {
    if (!liveSession?.id) return;
    const unsub = base44.entities.LiveSession.subscribe((event) => {
      if (event.id === liveSession.id && event.data) {
        setLiveSession(event.data);
      }
    });
    return unsub;
  }, [liveSession?.id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      let user = null;
      try { user = await base44.auth.me(); } catch {}
      const code = generateCode();
      const session = await base44.entities.LiveSession.create({
        code,
        host_email: user?.email || 'host',
        host_name: user?.full_name || 'Host',
        title: titleInput.trim() || 'Moon Joy Session',
        status: 'lobby',
        participant_count: 0,
        participants: [],
      });
      setLiveSession(session);
      setShowTitlePrompt(false);
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    if (!liveSession?.id) return;
    await base44.entities.LiveSession.update(liveSession.id, { status: 'ended' });
    setLiveSession(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Active Room Banner */}
      <AnimatePresence>
        {liveSession && liveSession.status !== 'ended' && (
          <ActiveRoomBanner session={liveSession} onEnd={handleEnd} />
        )}
      </AnimatePresence>

      {/* Title prompt modal */}
      <AnimatePresence>
        {showTitlePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(7,17,31,0.92)' }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-2xl border border-[#c9a87c]/30 p-6"
              style={{ background: '#0d1f36' }}>
              <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-1">Let's Get to Work</p>
              <h3 className="text-white text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Name this session</h3>
              <input
                autoFocus
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="e.g. Moon Joy May 2026"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a87c]/50 mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowTitlePrompt(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/10 hover:border-white/25 transition-colors">
                  Cancel
                </button>
                <button onClick={handleStart} disabled={starting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#07111f] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                  <Play className="w-4 h-4" /> {starting ? 'Starting…' : "Let's Go"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-12">
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

        <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Your facilitation command center. Design sessions, warm up your room, and run live agendas — with your participants following along in real-time.
        </p>

        {!liveSession || liveSession.status === 'ended' ? (
          <button onClick={() => setShowTitlePrompt(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-[#07111f] hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            <Play className="w-5 h-5" /> Let's Get to Work
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-green-400/30 text-green-400 text-sm font-semibold"
            style={{ background: 'rgba(74,222,128,0.08)' }}>
            <Radio className="w-4 h-4 animate-pulse" /> Session is live — {liveSession.participant_count || 0} in the room
          </div>
        )}
      </motion.div>

      {/* Feature Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
}