/**
 * SessionJoin — the participant-facing page.
 * Route: /session-portal/join/:code
 * Participants enter their name, join the room, and see live state.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Users, Vote, Flame, BarChart3, CheckCircle2, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function VoteCard({ session, voterId }) {
  const poll = session.active_poll;
  const [voted, setVoted] = useState(() => poll?.voter_ids?.includes(voterId) || false);
  const totalVotes = Object.values(poll?.votes || {}).reduce((a, b) => a + b, 0);

  if (!poll || !poll.is_open) return null;

  const castVote = async (optionId) => {
    if (voted) return;
    const newVotes = { ...poll.votes, [optionId]: (poll.votes[optionId] || 0) + 1 };
    const newVoterIds = [...(poll.voter_ids || []), voterId];
    await base44.entities.LiveSession.update(session.id, {
      active_poll: { ...poll, votes: newVotes, voter_ids: newVoterIds }
    });
    setVoted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#c9a87c]/30 overflow-hidden mb-6"
      style={{ background: 'rgba(201,168,124,0.06)' }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
        <Vote className="w-4 h-4 text-[#c9a87c]" />
        <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Live Vote</span>
        <Radio className="w-3 h-3 text-green-400 animate-pulse ml-1" />
      </div>
      <div className="px-5 py-4">
        <p className="text-white font-bold text-sm mb-4">{poll.question}</p>
        <div className="space-y-2">
          {(poll.options || []).map(opt => {
            const count = poll.votes?.[opt.id] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <button key={opt.id} onClick={() => castVote(opt.id)} disabled={voted}
                className={`w-full relative rounded-xl border overflow-hidden text-left transition-all ${
                  voted ? 'cursor-default' : 'hover:border-[#c9a87c]/50 active:scale-[0.98]'
                } border-white/10`}
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                {voted && (
                  <div className="absolute inset-0 rounded-xl transition-all duration-700"
                    style={{ width: `${pct}%`, background: 'rgba(201,168,124,0.15)' }} />
                )}
                <div className="relative flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{opt.label}</p>
                    {opt.desc && <p className="text-white/40 text-xs">{opt.desc}</p>}
                  </div>
                  {voted && <p className="text-white/50 text-xs font-bold">{pct}%</p>}
                </div>
              </button>
            );
          })}
        </div>
        {voted && <p className="text-white/40 text-xs mt-3 text-center">Vote cast — waiting for host to close the poll.</p>}
      </div>
    </motion.div>
  );
}

export default function SessionJoin() {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [voterId] = useState(() => `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  useEffect(() => {
    loadSession();
  }, [code]);

  useEffect(() => {
    if (!session?.id) return;
    const unsub = base44.entities.LiveSession.subscribe((event) => {
      if (event.id === session.id) setSession(event.data);
    });
    return unsub;
  }, [session?.id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.LiveSession.filter({ code }, '', 1);
      if (results?.length) setSession(results[0]);
      else setNotFound(true);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim() || !session) return;
    const participants = [...(session.participants || []), name.trim()];
    await base44.entities.LiveSession.update(session.id, {
      participants,
      participant_count: participants.length,
    });
    setJoined(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#07111f' }}>
      <div className="w-8 h-8 border-2 border-[#c9a87c] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07111f' }}>
      <div className="text-center">
        <p className="text-4xl mb-4">🚀</p>
        <h2 className="text-white text-2xl font-bold mb-2">Room not found</h2>
        <p className="text-white/50">Double-check the code and try again.</p>
      </div>
    </div>
  );

  if (session?.status === 'ended') return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07111f' }}>
      <div className="text-center">
        <p className="text-4xl mb-4">🛬</p>
        <h2 className="text-white text-2xl font-bold mb-2">Session ended</h2>
        <p className="text-white/50">The host has closed this session. Thanks for being here.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #07111f 0%, #0d1f36 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3"
        style={{ background: 'rgba(7,17,31,0.9)', backdropFilter: 'blur(16px)' }}>
        <Rocket className="w-5 h-5 text-[#c9a87c]" />
        <div>
          <p className="text-[#c9a87c] text-[10px] font-bold uppercase tracking-widest">Operation: Moon Joy</p>
          <p className="text-white font-bold text-sm">{session?.title || 'Live Session'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-bold">LIVE</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10">

        {!joined ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full border border-[#c9a87c]/30 mb-4"
                style={{ background: 'rgba(201,168,124,0.08)' }}>
                <span className="text-[#c9a87c] text-xs font-bold tracking-widest">{session.code}</span>
              </div>
              <h2 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                You're in the right place.
              </h2>
              <p className="text-white/50 text-sm">Enter your name to join the room.</p>
            </div>

            <div className="rounded-2xl border border-white/15 p-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2 mb-2 text-white/50 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>{session.participant_count || 0} already in the room</span>
              </div>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Your name…"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c9a87c]/50 mb-4"
              />
              <button onClick={handleJoin} disabled={!name.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm text-[#07111f] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
                Join Session
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h2 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                You're in, {name}!
              </h2>
              <p className="text-white/50 text-sm">Follow along as the host runs the session.</p>
            </div>

            {/* Live poll */}
            {session?.active_poll?.is_open && (
              <VoteCard session={session} voterId={voterId} />
            )}

            {/* Current activity */}
            {session?.current_warmup && !session?.active_poll?.is_open && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-[#f97316]/30 p-5 mb-4"
                style={{ background: 'rgba(249,115,22,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-[#f97316]" />
                  <span className="text-[#f97316] text-xs font-bold uppercase tracking-widest">Warm-Up in Progress</span>
                </div>
                <p className="text-white font-bold">{session.current_warmup}</p>
              </motion.div>
            )}

            {session?.current_template && !session?.active_poll?.is_open && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-[#c9a87c]/30 p-5 mb-4"
                style={{ background: 'rgba(201,168,124,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-[#c9a87c]" />
                  <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Today's Session</span>
                </div>
                <p className="text-white font-bold">{session.current_template}</p>
              </motion.div>
            )}

            {session?.broadcast_message && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/20 p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-white text-base font-semibold">{session.broadcast_message}</p>
              </motion.div>
            )}

            {!session?.active_poll?.is_open && !session?.current_warmup && !session?.current_template && !session?.broadcast_message && (
              <div className="text-center py-12 text-white/30">
                <Radio className="w-8 h-8 mx-auto mb-3 animate-pulse" />
                <p className="text-sm">Waiting for the host to begin…</p>
              </div>
            )}

            {/* Participants */}
            {session?.participants?.length > 0 && (
              <div className="mt-6 rounded-xl border border-white/10 px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">In the Room</p>
                <div className="flex flex-wrap gap-2">
                  {session.participants.map((p, i) => (
                    <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${p === name ? 'border-[#c9a87c]/50 text-[#c9a87c] bg-[#c9a87c]/10' : 'border-white/10 text-white/60'}`}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}